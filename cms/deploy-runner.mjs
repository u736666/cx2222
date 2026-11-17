import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const DEPLOY_CONFIG_REL = 'cms/deploy.config.json';
const ENV_LOCAL_REL = '.env.local';

export const DEFAULT_DEPLOY_CONFIG = {
  provider: 'vercel',
  projectName: 'cxfolks',
  productionBranch: 'main',
  productionUrl: 'https://cx2222.vercel.app',
  githubRepo: 'u736666/cxfolks',
  githubRemote: 'origin',
};

let deployInProgress = false;

function stripAnsi(text) {
  return String(text || '')
    .replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/\r/g, '');
}

function unquoteEnvValue(raw) {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export async function readDeployConfig(rootDir) {
  const absPath = path.join(rootDir, DEPLOY_CONFIG_REL);
  try {
    const raw = await fs.readFile(absPath, 'utf8');
    return { ...DEFAULT_DEPLOY_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DEPLOY_CONFIG };
  }
}

export async function writeDeployConfig(rootDir, input) {
  const current = await readDeployConfig(rootDir);
  const projectName = String(input.projectName ?? current.projectName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cxfolks';

  const productionUrl = String(input.productionUrl ?? current.productionUrl).trim() || 'https://cx2222.vercel.app';
  const githubRepo = String(input.githubRepo ?? current.githubRepo).trim() || 'u736666/cx2222';
  const productionBranch = String(input.productionBranch ?? current.productionBranch).trim() || 'main';

  const next = {
    provider: 'vercel',
    projectName,
    productionBranch,
    productionUrl,
    githubRepo,
    githubRemote: 'origin',
  };

  const absPath = path.join(rootDir, DEPLOY_CONFIG_REL);
  await fs.writeFile(absPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return next;
}

export async function readGithubToken(rootDir) {
  const envPath = path.join(rootDir, ENV_LOCAL_REL);
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      if (key === 'GITHUB_TOKEN' || key === 'GH_TOKEN') {
        const value = unquoteEnvValue(trimmed.slice(eqIdx + 1));
        if (value) {
          return { token: value, source: '.env.local' };
        }
      }
    }
  } catch {
    // .env.local yok
  }

  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    return { token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN, source: 'process.env' };
  }

  return { token: '', source: 'none' };
}

export async function writeEnvLocalToken(rootDir, tokenInput) {
  const clean = String(tokenInput || '').trim();
  if (/[\r\n]/.test(clean)) {
    throw new Error('Token geçersiz satır sonu karakteri içeremez.');
  }

  const envPath = path.join(rootDir, ENV_LOCAL_REL);
  let lines = [];
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    lines = raw.split(/\r?\n/);
  } catch {
    lines = [];
  }

  let tokenFound = false;
  const updatedLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('GITHUB_TOKEN=') || trimmed.startsWith('GH_TOKEN=')) {
      if (clean) {
        updatedLines.push(`GITHUB_TOKEN="${clean}"`);
        tokenFound = true;
      }
      // clean boş ise satırı atlayarak silmiş oluyoruz
    } else {
      updatedLines.push(line);
    }
  }

  if (clean && !tokenFound) {
    if (updatedLines.length > 0 && updatedLines[updatedLines.length - 1] !== '') {
      updatedLines.push('');
    }
    updatedLines.push('# GitHub Personal Access Token (Vercel/GitHub yayını için)');
    updatedLines.push(`GITHUB_TOKEN="${clean}"`);
  }

  const output = updatedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  await fs.writeFile(envPath, output ? output + '\n' : '', 'utf8');
}

export function runCommand(bin, args, options = {}) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(bin, args, {
      cwd: options.cwd,
      env: { ...process.env, ...(options.env || {}) },
      shell: false,
    });

    const append = (data) => {
      output += stripAnsi(data.toString());
      if (output.length > 120000) {
        output = output.slice(output.length - 120000);
      }
    };

    child.stdout.on('data', append);
    child.stderr.on('data', append);

    let timedOut = false;
    let timer = null;
    const timeoutMs = options.timeoutMs ?? 90000;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
      }, timeoutMs);
    }

    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      resolve({
        code: 1,
        output: output + `\nKomut başlatma hatası (${bin}): ${err.message}`,
        timedOut: false,
      });
    });

    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({
        code: timedOut ? 124 : (code ?? 0),
        output: output.trim(),
        timedOut,
      });
    });
  });
}

export async function getDeployStatus(rootDir) {
  const [config, tokenInfo] = await Promise.all([
    readDeployConfig(rootDir),
    readGithubToken(rootDir),
  ]);

  let gitBranch = 'main';
  let gitRemoteUrl = '';
  let changedFilesCount = 0;
  let isDirty = false;
  let lastCommit = '';
  let gitOk = false;

  try {
    const branchRes = await runCommand('git', ['branch', '--show-current'], { cwd: rootDir, timeoutMs: 5000 });
    gitBranch = branchRes.output.trim() || 'main';

    const remoteRes = await runCommand('git', ['remote', 'get-url', config.githubRemote || 'origin'], { cwd: rootDir, timeoutMs: 5000 });
    gitRemoteUrl = remoteRes.output.trim();

    const statusRes = await runCommand('git', ['status', '--porcelain'], { cwd: rootDir, timeoutMs: 5000 });
    const lines = statusRes.output.split('\n').filter(l => l.trim().length > 0);
    changedFilesCount = lines.length;
    isDirty = changedFilesCount > 0;

    const commitRes = await runCommand('git', ['log', '-1', '--format=%h - %s (%cr)'], { cwd: rootDir, timeoutMs: 5000 });
    lastCommit = commitRes.output.trim();

    gitOk = true;
  } catch (err) {
    gitOk = false;
  }

  const hasEnvToken = Boolean(tokenInfo.token);
  const tokenMasked = hasEnvToken ? `...${tokenInfo.token.slice(-4)}` : '';

  return {
    ok: true,
    provider: 'vercel',
    config,
    git: {
      ok: gitOk,
      branch: gitBranch,
      remoteUrl: gitRemoteUrl || `https://github.com/${config.githubRepo}.git`,
      isDirty,
      changedFilesCount,
      lastCommit,
    },
    hasEnvToken,
    tokenMasked,
    tokenSource: tokenInfo.source,
    productionUrl: config.productionUrl || 'https://cxfolks.vercel.app',
    githubRepo: config.githubRepo || 'u736666/cxfolks',
  };
}

export async function runStaticBuild(rootDir) {
  const result = await runCommand('npm', ['run', 'build'], {
    cwd: rootDir,
    timeoutMs: 120000,
  });
  return {
    statusCode: result.code === 0 ? 200 : 500,
    payload: {
      ok: result.code === 0,
      code: result.code,
      timedOut: result.timedOut,
      output: result.output,
    },
  };
}

export async function runVercelDeploy(rootDir, options = {}) {
  if (deployInProgress) {
    return {
      statusCode: 409,
      payload: {
        ok: false,
        error: 'Şu anda devam eden bir yayınlama işlemi var. Lütfen tamamlanmasını bekleyin.',
      },
    };
  }

  deployInProgress = true;
  const logs = [];

  try {
    const [config, tokenInfo] = await Promise.all([
      readDeployConfig(rootDir),
      readGithubToken(rootDir),
    ]);

    const activeToken = String(options.githubToken || tokenInfo.token || '').trim();
    const branch = config.productionBranch || 'main';
    const repo = config.githubRepo || 'u736666/cxfolks';

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const defaultMsg = `CMS içerik güncellemesi (${dateStr} ${timeStr})`;
    const commitMessage = String(options.commitMessage || '').trim() || defaultMsg;

    // 1. Statik Derleme Kontrolü
    logs.push('=== 1/3 Yerel Derleme Kontrol Ediliyor (npm run build) ===');
    const buildRes = await runCommand('npm', ['run', 'build'], {
      cwd: rootDir,
      timeoutMs: 120000,
    });
    logs.push(buildRes.output || '(çıktı yok)');
    if (buildRes.code !== 0) {
      return {
        statusCode: 500,
        payload: {
          ok: false,
          error: 'Astro derleme (npm run build) başarısız oldu. Hataları düzeltmeden GitHub ve Vercel üzerine gönderilemez.',
          logs: logs.join('\n\n'),
        },
      };
    }

    // 2. Git Değişikliklerini Hazırlama & Commit
    logs.push('=== 2/3 Git Değişiklikleri Paketleniyor (git add . && git commit) ===');
    const addRes = await runCommand('git', ['add', '.'], { cwd: rootDir, timeoutMs: 10000 });
    if (addRes.output) logs.push(addRes.output);

    const statusRes = await runCommand('git', ['status', '--porcelain'], { cwd: rootDir, timeoutMs: 5000 });
    let committed = false;
    if (statusRes.output.trim().length > 0) {
      const commitRes = await runCommand('git', ['commit', '-m', commitMessage], { cwd: rootDir, timeoutMs: 15000 });
      logs.push(commitRes.output || '(commit oluşturuldu)');
      if (commitRes.code !== 0) {
        return {
          statusCode: 500,
          payload: {
            ok: false,
            error: 'Git commit oluşturulamadı.',
            logs: logs.join('\n\n'),
          },
        };
      }
      committed = true;
    } else {
      logs.push('Yeni commit gerektiren dosya değişikliği bulunamadı (mevcut commitler gönderilecek).');
    }

    // 3. GitHub'a Push ve Vercel Tetikleme
    logs.push(`=== 3/3 GitHub'a Gönderiliyor ve Vercel Tetikleniyor (${repo} -> ${branch}) ===`);

    let pushTarget = config.githubRemote || 'origin';
    const envOverrides = {
      GIT_TERMINAL_PROMPT: '0',
    };

    if (activeToken) {
      // Token ile authenticated push
      pushTarget = `https://${encodeURIComponent(activeToken)}@github.com/${repo}.git`;
    }

    const pushRes = await runCommand('git', ['push', pushTarget, branch], {
      cwd: rootDir,
      env: envOverrides,
      timeoutMs: 60000,
    });

    // Hassas token'ı loglarda maskele
    let sanitizedOutput = pushRes.output || '';
    if (activeToken) {
      sanitizedOutput = sanitizedOutput.split(activeToken).join('***TOKEN***');
    }
    logs.push(sanitizedOutput || '(çıktı yok)');

    if (pushRes.code !== 0) {
      const isAuthError =
        sanitizedOutput.includes('Authentication failed') ||
        sanitizedOutput.includes('could not read Username') ||
        sanitizedOutput.includes('Permission denied') ||
        sanitizedOutput.includes('Invalid username or password');

      let userError = 'GitHub deposuna gönderme (git push) başarısız oldu.';
      if (isAuthError) {
        userError =
          'GitHub yetkilendirme hatası: Depoya doğrudan yazma yetkisi olan bir GitHub Personal Access Token (PAT) girin veya terminalden `git push origin main` komutunu çalıştırın.';
      }

      return {
        statusCode: 403,
        payload: {
          ok: false,
          error: userError,
          logs: logs.join('\n\n'),
        },
      };
    }

    // Son commit bilgisi
    const lastCommitRes = await runCommand('git', ['log', '-1', '--format=%h - %s'], { cwd: rootDir, timeoutMs: 5000 });

    return {
      statusCode: 200,
      payload: {
        ok: true,
        committed,
        commitMessage,
        lastCommit: lastCommitRes.output.trim(),
        productionUrl: config.productionUrl || 'https://cx2222.vercel.app',
        repoUrl: `https://github.com/${repo}`,
        logs: logs.join('\n\n'),
      },
    };
  } finally {
    deployInProgress = false;
  }
}
