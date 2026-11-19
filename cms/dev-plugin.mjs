import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getDeployStatus,
  runVercelDeploy,
  runStaticBuild,
  writeDeployConfig,
  writeEnvLocalToken,
} from './deploy-runner.mjs';

const SINGLETON_FILES = {
  theme: 'src/data/theme.json',
  site: 'src/data/site.json',
  home: 'src/data/home.json',
  pages: 'src/data/pages.json',
};

const COLLECTION_DIRS = {
  projects: 'src/data/projects',
  blog: 'src/data/blog',
};

const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

function sanitizeSlug(raw) {
  const trMap = {
    ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return String(raw || '')
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (ch) => trMap[ch] || ch)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('İstek boyutu sınırı (15 MB) aşıldı.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJsonFile(absPath) {
  const raw = await fs.readFile(absPath, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonFile(absPath, data) {
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function readCollection(rootDir, dirRel) {
  const absDir = path.join(rootDir, dirRel);
  await fs.mkdir(absDir, { recursive: true });
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  const items = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const slug = entry.name.replace(/\.json$/, '');
    const data = await readJsonFile(path.join(absDir, entry.name));
    items.push({ ...data, slug: data.slug || slug });
  }
  return items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function syncShowcase(page, showcaseData, afterType) {
  let block = (page.blocks || []).find((b) => b.type === 'projectShowcase');
  if (showcaseData) {
    if (!block) {
      block = {
        id: 'projects-stacked',
        type: 'projectShowcase',
        visible: showcaseData.visible === true,
        data: showcaseData,
        style: { surface: 'siteBg' },
      };
      const afterIdx = (page.blocks || []).findIndex((b) => b.type === afterType);
      if (afterIdx !== -1) {
        page.blocks.splice(afterIdx + 1, 0, block);
      } else {
        page.blocks.push(block);
      }
    } else {
      block.visible = showcaseData.visible === true;
      block.data = { ...block.data, ...showcaseData };
    }
  } else if (block) {
    block.visible = false;
  }
}

function syncBlogShowcase(page, blogData, afterType, fallbackAfter) {
  let block = (page.blocks || []).find((b) => b.type === 'blogShowcase');
  if (blogData) {
    if (!block) {
      block = {
        id: 'blog-section',
        type: 'blogShowcase',
        visible: blogData.visible === true,
        data: blogData,
        style: { surface: 'platinum' },
      };
      let afterIdx = (page.blocks || []).findIndex((b) => b.type === afterType);
      if (afterIdx === -1 && fallbackAfter) {
        afterIdx = (page.blocks || []).findIndex((b) => b.type === fallbackAfter);
      }
      if (afterIdx !== -1) {
        page.blocks.splice(afterIdx + 1, 0, block);
      } else {
        page.blocks.push(block);
      }
    } else {
      block.visible = blogData.visible === true;
      block.data = { ...block.data, ...blogData };
    }
  } else if (block) {
    block.visible = false;
  }
}

function syncCta(page, ctaData) {
  if (!ctaData) return;
  let block = (page.blocks || []).find((b) => b.type === 'ctaBanner');
  if (ctaData.visible !== false) {
    if (!block) {
      block = {
        id: 'cta',
        type: 'ctaBanner',
        visible: true,
        data: { ...ctaData },
        style: { surface: ctaData.surface || 'platinum', bgColor: ctaData.bgColor },
      };
      const contactIdx = (page.blocks || []).findIndex((b) => b.type === 'contactForm');
      if (contactIdx !== -1) {
        page.blocks.splice(contactIdx, 0, block);
      } else {
        page.blocks.push(block);
      }
    } else {
      block.visible = true;
      block.data = { ...block.data, ...ctaData };
      if (ctaData.surface) {
        block.style = { ...block.style, surface: ctaData.surface };
      }
      if (ctaData.bgColor) {
        block.style = { ...block.style, bgColor: ctaData.bgColor };
      }
    }
  } else if (block) {
    block.visible = false;
  }
}

async function syncBlockPages(rootDir, target, data) {
  const pagesDir = path.join(rootDir, 'src/data/pages');
  if (target === 'home') {
    const homeBlockPath = path.join(pagesDir, 'home.json');
    try {
      let homePage = await readJsonFile(homeBlockPath);
      if (data.seo) homePage.seo = data.seo;
      if (data.seo?.title) homePage.meta.title = data.seo.title;

      for (const block of homePage.blocks || []) {
        if (block.type === 'hero' && data.heroSlides) {
          block.data = { ...block.data, slides: data.heroSlides, headingTag: data.heroHeadingTag || block.data?.headingTag || 'h1' };
        } else if (block.type === 'manifesto' && data.manifesto) {
          block.data = { ...block.data, ...data.manifesto };
        } else if (block.type === 'logoMarquee' && data.logos) {
          block.data = data.logos;
        } else if (block.type === 'accordion' && data.whyNow) {
          block.data = { ...block.data, ...data.whyNow };
        } else if (block.type === 'featureCards' && data.solutionsSection) {
          block.data = { ...block.data, ...data.solutionsSection };
        } else if (block.type === 'problemSlider' && data.solutionsSection?.problemSlider) {
          block.data = { ...block.data, items: data.solutionsSection.problemSlider };
        } else if (block.type === 'projectShowcase' && data.projectsSection) {
          block.data = { ...block.data, ...data.projectsSection };
        } else if (block.type === 'blogShowcase' && data.blogSection) {
          block.data = { ...block.data, ...data.blogSection };
        }
      }

      let homeCtaBlock = (homePage.blocks || []).find((b) => b.type === 'ctaBanner');
      if (data.cta && data.cta.visible === true) {
        if (!homeCtaBlock) {
          homeCtaBlock = {
            id: 'cta',
            type: 'ctaBanner',
            visible: true,
            data: { ...data.cta },
            style: { surface: data.cta.surface || 'platinum', bgColor: data.cta.bgColor },
          };
          const contactIdx = (homePage.blocks || []).findIndex((b) => b.type === 'contactForm');
          if (contactIdx !== -1) {
            homePage.blocks.splice(contactIdx, 0, homeCtaBlock);
          } else {
            homePage.blocks.push(homeCtaBlock);
          }
        } else {
          homeCtaBlock.visible = true;
          homeCtaBlock.data = { ...homeCtaBlock.data, ...data.cta };
          homeCtaBlock.style = { ...homeCtaBlock.style, surface: data.cta.surface || 'platinum', bgColor: data.cta.bgColor };
        }
      } else if (homeCtaBlock) {
        homeCtaBlock.visible = false;
      }

      await writeJsonFile(homeBlockPath, homePage);
    } catch (e) {
      console.error('syncBlockPages home error:', e);
    }
  } else if (target === 'pages') {
    const pageMap = [
      {
        file: 'yaklasimimiz.json',
        key: 'yaklasimimiz',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'approachManifesto') b.data = { hero: d.hero, pillars: d.pillars, manifesto: d.manifesto, matrix: d.matrix };
            if (b.type === 'faq') b.data = { title: d.faqTitle, subtitle: '', items: d.faqs };
          }
          syncCta(page, d.cta);
        },
      },
      {
        file: 'neden-simdi.json',
        key: 'nedenSimdi',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') b.data = { ...d.hero, bgImage: d.hero?.bgImage };
            if (b.type === 'shiftsComparison') b.data = { items: d.shifts };
            if (b.type === 'faq') b.data = { title: d.faqTitle, subtitle: '', items: d.faqs };
          }
          syncCta(page, d.cta);
        },
      },
      {
        file: 'cozumler.json',
        key: 'cozumlerIndex',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') b.data = d.hero;
            if (b.type === 'solutionsList') b.data = { items: d.solutions };
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs };
          }
          syncShowcase(page, d.projectShowcase, 'solutionsList');
          syncBlogShowcase(page, d.blogShowcase, 'projectShowcase', 'solutionsList');
          syncCta(page, d.cta);
        },
      },
      {
        file: 'cozumler-ai-destekli-cx.json',
        key: 'aiDestekliCx',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') {
              b.data = d.hero;
              b.style = { ...b.style, surface: d.hero?.surface, bgColor: d.hero?.bgColor };
            }
            if (b.type === 'capabilitiesGrid') b.data = { items: d.capabilities, columns: 2 };
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs };
          }
          syncShowcase(page, d.projectShowcase, 'capabilitiesGrid');
          syncBlogShowcase(page, d.blogShowcase, 'projectShowcase', 'capabilitiesGrid');
          syncCta(page, d.cta);
        },
      },
      {
        file: 'cozumler-deneyim-tasarimi.json',
        key: 'deneyimTasarimi',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') {
              b.data = d.hero;
              b.style = { ...b.style, surface: d.hero?.surface, bgColor: d.hero?.bgColor };
            }
            if (b.type === 'capabilitiesGrid') b.data = { items: d.capabilities, columns: 2 };
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs };
          }
          syncShowcase(page, d.projectShowcase, 'capabilitiesGrid');
          syncBlogShowcase(page, d.blogShowcase, 'projectShowcase', 'capabilitiesGrid');
          syncCta(page, d.cta);
        },
      },
      {
        file: 'cozumler-akademi.json',
        key: 'cxFolksAkademi',
        fallbackKey: 'akademi',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') {
              b.data = { ...b.data, ...d.hero };
              b.style = { ...b.style, surface: d.hero?.surface, bgColor: d.hero?.bgColor };
            }
            if (b.type === 'capabilitiesGrid') {
              b.data = { ...b.data, items: d.capabilities, columns: 2 };
            }
            if (b.type === 'faq') {
              b.data = { ...b.data, title: d.faqTitle, items: d.faqs };
            }
          }
          syncShowcase(page, d.projectShowcase, 'capabilitiesGrid');
          syncBlogShowcase(page, d.blogShowcase, 'projectShowcase', 'capabilitiesGrid');
          syncCta(page, d.cta);
        },
      },
      {
        file: 'cozumler-cx-maturity-testi.json',
        key: 'cxMaturityTesti',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') b.data = d.hero;
            if (b.type === 'maturityTest') b.data = { questions: d.questions, results: d.results };
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs };
          }
          syncShowcase(page, d.projectShowcase, 'maturityTest');
          syncBlogShowcase(page, d.blogShowcase, 'projectShowcase', 'maturityTest');
          syncCta(page, d.cta);
        },
      },
      {
        file: 'projeler.json',
        key: 'projelerIndex',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') b.data = d.hero;
            if (b.type === 'projectsList') b.data = { cardCtaText: d.cardCtaText };
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs || [] };
          }
          syncBlogShowcase(page, d.blogShowcase, 'projectsList', 'hero');
          syncCta(page, d.cta);
        },
      },
      {
        file: 'blog.json',
        key: 'blogIndex',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'hero') b.data = { ...d.hero, bgImage: d.hero?.bgImage };
            if (b.type === 'articlesList') b.data = { readMoreText: d.readMoreText };
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs || [] };
          }
          syncCta(page, d.cta);
        },
      },
      {
        file: 'iletisim.json',
        key: 'iletisim',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'contactHero') b.data = d.hero;
            if (b.type === 'faq') b.data = { title: d.faqTitle, items: d.faqs };
          }
          syncCta(page, d.cta);
        },
      },
      {
        file: 'ekibimiz.json',
        key: 'ekibimiz',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'teamGrid') {
              b.style = {
                ...b.style,
                surface: d.surface,
                bgColor: d.bgColor,
              };
              b.data = {
                ...b.data,
                ...d,
                members: d.members || []
              };
            }
          }
          syncCta(page, d.cta);
        },
      },
      {
        file: 'gizlilik-politikasi.json',
        key: 'gizlilikPolitikasi',
        sync: (page, d) => {
          if (d.seo) page.seo = { ...page.seo, ...d.seo };
          const raw = d.text || (d.content && typeof d.content === 'object' ? d.content.text : d.content) || '';
          if (d.content && typeof d.content === 'object') d.content.text = raw;
          else d.content = { text: raw };
          const subTag = d.subheadingTag || 'h3';
          const subWeight = d.subheadingWeight || '400';
          const subSize = d.subheadingSize || '20px';
          const weightClass = subWeight === '700' ? 'font-bold' : (subWeight === '600' ? 'font-semibold' : (subWeight === '500' ? 'font-medium' : 'font-normal'));
          
          let formattedContent = raw;
          if (!raw.includes('<p>') && !raw.includes('<div>') && !raw.includes('<section>')) {
            const parts = raw.split(/\n\s*\n/).map(block => {
              const trimmed = block.trim();
              if (!trimmed) return '';
              if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
                const lis = trimmed.split('\n').map(l => `<li>${l.replace(/^[\s•\-]+\s*/, '').trim()}</li>`).join('');
                return `<ul class="list-disc pl-5 space-y-2">${lis}</ul>`;
              }
              if (/^#{2,4}\s+/.test(trimmed)) {
                return `<${subTag} class="text-xl ${weightClass} text-paletteRichBlack">${trimmed.replace(/^#{2,4}\s+/, '')}</${subTag}>`;
              }
              if (/^\d+\.\s+[^\n]+$/.test(trimmed)) {
                return `<${subTag} class="text-xl ${weightClass} text-paletteRichBlack">${trimmed}</${subTag}>`;
              }
              const nlIdx = trimmed.indexOf('\n');
              if (nlIdx !== -1 && /^\d+\.\s+[^\n]+$/.test(trimmed.slice(0, nlIdx).trim())) {
                const headingLine = trimmed.slice(0, nlIdx).trim();
                const bodyText = trimmed.slice(nlIdx + 1).trim();
                return `<section class="space-y-3"><${subTag} class="text-xl ${weightClass} text-paletteRichBlack">${headingLine}</${subTag}><p>${bodyText.replace(/\n/g, '<br>')}</p></section>`;
              }
              return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            }).filter(Boolean);
            formattedContent = `<div class="space-y-8 typo-body font-light text-paletteRichBlack/85">${parts.join('')}</div>`;
          }

          if (d.hero?.title) {
            page.meta = page.meta || {};
            page.meta.title = d.hero.title.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }

          for (const b of page.blocks || []) {
            if (b.type === 'hero') {
              b.data = { 
                ...b.data, 
                ...d.hero,
                eyebrow: (d.hero && typeof d.hero.eyebrow === 'string') ? d.hero.eyebrow : ''
              };
              if (d.hero && d.hero.surface) {
                b.style = { ...b.style, surface: d.hero.surface };
              }
            }
            if (b.type === 'richText') {
              b.data = { 
                ...b.data, 
                subheadingTag: subTag,
                subheadingWeight: subWeight,
                subheadingSize: subSize,
                content: formattedContent || raw || b.data?.content 
              };
              if (d.content && typeof d.content === 'object' && d.content.title) {
                b.data.title = d.content.title;
              }
            }
          }
        },
      },
      {
        file: 'cerez-politikasi.json',
        key: 'cerezPolitikasi',
        sync: (page, d) => {
          if (d.seo) page.seo = { ...page.seo, ...d.seo };
          const raw = d.text || (d.content && typeof d.content === 'object' ? d.content.text : d.content) || '';
          if (d.content && typeof d.content === 'object') d.content.text = raw;
          else d.content = { text: raw };
          const subTag = d.subheadingTag || 'h3';
          const subWeight = d.subheadingWeight || '400';
          const subSize = d.subheadingSize || '20px';
          const weightClass = subWeight === '700' ? 'font-bold' : (subWeight === '600' ? 'font-semibold' : (subWeight === '500' ? 'font-medium' : 'font-normal'));
          
          let formattedContent = raw;
          if (!raw.includes('<p>') && !raw.includes('<div>') && !raw.includes('<section>')) {
            const parts = raw.split(/\n\s*\n/).map(block => {
              const trimmed = block.trim();
              if (!trimmed) return '';
              if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
                const lis = trimmed.split('\n').map(l => `<li>${l.replace(/^[\s•\-]+\s*/, '').trim()}</li>`).join('');
                return `<ul class="list-disc pl-5 space-y-2">${lis}</ul>`;
              }
              if (/^#{2,4}\s+/.test(trimmed)) {
                return `<${subTag} class="text-xl ${weightClass} text-paletteRichBlack">${trimmed.replace(/^#{2,4}\s+/, '')}</${subTag}>`;
              }
              if (/^\d+\.\s+[^\n]+$/.test(trimmed)) {
                return `<${subTag} class="text-xl ${weightClass} text-paletteRichBlack">${trimmed}</${subTag}>`;
              }
              const nlIdx = trimmed.indexOf('\n');
              if (nlIdx !== -1 && /^\d+\.\s+[^\n]+$/.test(trimmed.slice(0, nlIdx).trim())) {
                const headingLine = trimmed.slice(0, nlIdx).trim();
                const bodyText = trimmed.slice(nlIdx + 1).trim();
                return `<section class="space-y-3"><${subTag} class="text-xl ${weightClass} text-paletteRichBlack">${headingLine}</${subTag}><p>${bodyText.replace(/\n/g, '<br>')}</p></section>`;
              }
              return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            }).filter(Boolean);
            formattedContent = `<div class="space-y-8 typo-body font-light text-paletteRichBlack/85">${parts.join('')}</div>`;
          }

          if (d.hero?.title) {
            page.meta = page.meta || {};
            page.meta.title = d.hero.title.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }

          for (const b of page.blocks || []) {
            if (b.type === 'hero') {
              b.data = { 
                ...b.data, 
                ...d.hero,
                eyebrow: (d.hero && typeof d.hero.eyebrow === 'string') ? d.hero.eyebrow : ''
              };
              if (d.hero && d.hero.surface) {
                b.style = { ...b.style, surface: d.hero.surface };
              }
            }
            if (b.type === 'richText') {
              b.data = { 
                ...b.data, 
                subheadingTag: subTag,
                subheadingWeight: subWeight,
                subheadingSize: subSize,
                content: formattedContent || raw || b.data?.content 
              };
              if (d.content && typeof d.content === 'object' && d.content.title) {
                b.data.title = d.content.title;
              }
            }
          }
        },
      },
      {
        file: '404.json',
        key: 'notFound',
        sync: (page, d) => {
          if (d.seo) page.seo = d.seo;
          for (const b of page.blocks || []) {
            if (b.type === 'notFound') b.data = d;
          }
        },
      },
    ];

    if (data.cxFolksAkademi || data.akademi) {
      const srcAkademi = data.cxFolksAkademi || data.akademi;
      data.cxFolksAkademi = srcAkademi;
      data.akademi = srcAkademi;
    }

    for (const mapping of pageMap) {
      const pData = data[mapping.key] || (mapping.fallbackKey ? data[mapping.fallbackKey] : null);
      if (!pData) continue;
      const fPath = path.join(pagesDir, mapping.file);
      try {
        let page = await readJsonFile(fPath);
        mapping.sync(page, pData);
        await writeJsonFile(fPath, page);
      } catch (err) {
        console.error(`syncBlockPages page ${mapping.file} error:`, err);
      }
    }
  }
}

async function walkImagesDir(baseDir, currentDir = baseDir, acc = []) {
  try {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walkImagesDir(baseDir, absPath, acc);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!ALLOWED_IMAGE_EXTS.has(ext)) continue;
        const rel = path.relative(baseDir, absPath).split(path.sep).join('/');
        const stat = await fs.stat(absPath);
        const parts = rel.split('/');
        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
        acc.push({
          folder,
          name: entry.name,
          url: `/images/${rel}`,
          size: stat.size,
          mtimeMs: stat.mtimeMs,
          ext: ext.replace('.', ''),
        });
      }
    }
  } catch {
    // ignore missing dir
  }
  return acc;
}

async function replaceImageReferencesAcrossProject(rootDir, oldUrl, newUrl) {
  if (!oldUrl || !newUrl || oldUrl === newUrl) return [];
  const updatedFiles = [];
  const oldUrlBare = oldUrl.startsWith('/') ? oldUrl.slice(1) : oldUrl;
  const newUrlBare = newUrl.startsWith('/') ? newUrl.slice(1) : newUrl;

  const srcDir = path.join(rootDir, 'src');

  async function walkAndReplace(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkAndReplace(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.json', '.astro', '.md', '.mdx', '.js', '.mjs', '.ts'].includes(ext)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            let modified = false;
            let nextContent = content;

            if (nextContent.includes(oldUrl)) {
              nextContent = nextContent.replaceAll(oldUrl, newUrl);
              modified = true;
            }
            if (nextContent.includes(oldUrlBare)) {
              nextContent = nextContent.replaceAll(oldUrlBare, newUrlBare);
              modified = true;
            }

            if (modified) {
              await fs.writeFile(fullPath, nextContent, 'utf-8');
              updatedFiles.push(path.relative(rootDir, fullPath).replace(/\\/g, '/'));
            }
          } catch (err) {
            console.error(`[CMS rename] Error updating file ${fullPath}:`, err);
          }
        }
      }
    }
  }

  await walkAndReplace(srcDir);
  return updatedFiles;
}

function isExternalImageUrl(str) {
  if (typeof str !== 'string') return false;
  const s = str.trim();
  if (!s.startsWith('http://') && !s.startsWith('https://')) return false;
  if (s.includes('images.unsplash.com') || s.includes('static.wixstatic.com')) return true;
  return /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(s);
}

async function downloadAndSaveWebp(url, rootDir, hint = 'gorsel') {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const arrayBuf = await resp.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    const { default: sharp } = await import('sharp');
    const stamp = Date.now().toString(36);
    let base = sanitizeSlug(hint) || 'gorsel';
    if (base === 'gorsel') {
      try {
        const parsed = new URL(url);
        const pName = path.basename(parsed.pathname, path.extname(parsed.pathname));
        base = sanitizeSlug(pName).slice(0, 24) || 'gorsel';
      } catch {
        base = 'gorsel';
      }
    }

    const filename = `${base}-${stamp}.webp`;
    const targetDir = path.join(rootDir, 'public', 'images', 'uploads');
    await fs.mkdir(targetDir, { recursive: true });
    await sharp(buf).webp({ quality: 85, effort: 4 }).toFile(path.join(targetDir, filename));
    return `/images/uploads/${filename}`;
  } catch (err) {
    console.error('[CMS autoImport] Error downloading external image:', url, err);
    return null;
  }
}

async function autoImportExternalImages(obj, rootDir, hint = 'gorsel') {
  if (!obj || typeof obj !== 'object') return false;
  let modified = false;

  async function processNode(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === 'string' && isExternalImageUrl(node[i])) {
          const localUrl = await downloadAndSaveWebp(node[i], rootDir, hint);
          if (localUrl) {
            node[i] = localUrl;
            modified = true;
          }
        } else if (node[i] && typeof node[i] === 'object') {
          await processNode(node[i]);
        }
      }
      return;
    }

    for (const [key, val] of Object.entries(node)) {
      if (typeof val === 'string' && isExternalImageUrl(val)) {
        const localUrl = await downloadAndSaveWebp(val, rootDir, `${hint}-${key}`);
        if (localUrl) {
          node[key] = localUrl;
          modified = true;
        }
      } else if (val && typeof val === 'object') {
        await processNode(val);
      }
    }
  }

  await processNode(obj);
  return modified;
}

async function listMediaFiles(rootDir) {
  const imagesDir = path.join(rootDir, 'public/images');
  const files = await walkImagesDir(imagesDir);
  const seen = new Set(files.map((f) => f.url));

  // Collect all image URLs currently in use across src/data content
  const dataDir = path.join(rootDir, 'src/data');
  const dataImages = [];

  function scanDataObj(obj, category, entityName) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => scanDataObj(item, category, `${entityName} #${idx + 1}`));
      return;
    }
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const isImg = (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/images/')) &&
          (trimmed.match(/\.(jpg|jpeg|png|webp|avif|svg|gif)(\?.*)?$/i) || trimmed.includes('images.unsplash.com'));
        if (isImg && !seen.has(trimmed)) {
          seen.add(trimmed);
          const extMatch = trimmed.split('?')[0].match(/\.([a-z0-9]+)$/i);
          const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
          dataImages.push({
            folder: category,
            name: `${entityName} (${key})`,
            url: trimmed,
            size: null,
            mtimeMs: 0,
            ext,
          });
        }
      } else if (val && typeof val === 'object') {
        scanDataObj(val, category, `${entityName} > ${key}`);
      }
    }
  }

  try {
    const sitePath = path.join(dataDir, 'site.json');
    const homePath = path.join(dataDir, 'home.json');
    const pagesPath = path.join(dataDir, 'pages.json');

    const [site, home, pages] = await Promise.all([
      readJsonFile(sitePath).catch(() => null),
      readJsonFile(homePath).catch(() => null),
      readJsonFile(pagesPath).catch(() => null),
    ]);

    if (site) scanDataObj(site, 'site', 'Site Geneli');
    if (home) scanDataObj(home, 'home', 'Ana Sayfa');
    if (pages) scanDataObj(pages, 'pages', 'Sabit Sayfalar');

    const projDir = path.join(dataDir, 'projects');
    try {
      const pEntries = await fs.readdir(projDir, { withFileTypes: true });
      for (const pe of pEntries) {
        if (pe.isFile() && pe.name.endsWith('.json')) {
          const pData = await readJsonFile(path.join(projDir, pe.name)).catch(() => null);
          if (pData) scanDataObj(pData, 'projects', `Proje (${pData.client || pData.title || pe.name})`);
        }
      }
    } catch {}

    const blogDir = path.join(dataDir, 'blog');
    try {
      const bEntries = await fs.readdir(blogDir, { withFileTypes: true });
      for (const be of bEntries) {
        if (be.isFile() && be.name.endsWith('.json')) {
          const bData = await readJsonFile(path.join(blogDir, be.name)).catch(() => null);
          if (bData) scanDataObj(bData, 'blog', `Blog (${bData.title || be.name})`);
        }
      }
    } catch {}
  } catch {}

  const all = [...files, ...dataImages];
  return all.sort((a, b) => {
    if (a.folder !== b.folder) {
      if (a.folder === 'uploads') return -1;
      if (b.folder === 'uploads') return 1;
      if (a.folder === 'logos') return 1;
      if (b.folder === 'logos') return -1;
      return a.folder.localeCompare(b.folder);
    }
    return (b.mtimeMs || 0) - (a.mtimeMs || 0);
  });
}

async function listUploads(rootDir) {
  const files = await listMediaFiles(rootDir);
  return files.map((f) => f.url);
}

export default function cxfolksCmsPlugin() {
  function attachMiddleware(server) {
    const rootDir = server.config.root || process.cwd();

    server.middlewares.use(async (req, res, next) => {
      const urlPath = (req.url || '/').split('?')[0];

        if (req.method === 'GET' && (urlPath === '/admin' || urlPath === '/admin/')) {
          try {
            const adminHtmlPath = path.join(rootDir, 'cms/admin.html');
            const html = await fs.readFile(adminHtmlPath, 'utf8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(html);
          } catch (err) {
            sendJson(res, 500, { ok: false, error: `Admin dosyası okunamadı: ${err.message}` });
          }
          return;
        }

        if (!urlPath.startsWith('/api/cms/')) {
          return next();
        }

        try {
          // GET /api/cms/state -> Load all editable JSON content + uploaded images list
          if (req.method === 'GET' && urlPath === '/api/cms/state') {
            const [theme, site, home, pages, projects, blog, mediaFiles] = await Promise.all([
              readJsonFile(path.join(rootDir, SINGLETON_FILES.theme)),
              readJsonFile(path.join(rootDir, SINGLETON_FILES.site)),
              readJsonFile(path.join(rootDir, SINGLETON_FILES.home)),
              readJsonFile(path.join(rootDir, SINGLETON_FILES.pages)),
              readCollection(rootDir, COLLECTION_DIRS.projects),
              readCollection(rootDir, COLLECTION_DIRS.blog),
              listMediaFiles(rootDir),
            ]);
            const uploads = mediaFiles.map((f) => f.url);
            return sendJson(res, 200, {
              ok: true,
              data: { theme, site, home, pages, projects, blog, uploads, mediaFiles },
            });
          }

          // POST /api/cms/save -> Save a singleton (theme/site/home/pages) or collection item
          if (req.method === 'POST' && urlPath === '/api/cms/save') {
            const body = JSON.parse(await readBody(req));
            const { target, slug, previousSlug, data } = body || {};

            if (!data || typeof data !== 'object') {
              return sendJson(res, 400, { ok: false, error: 'Geçersiz veri formatı.' });
            }

            // Automatically download, convert to WebP and localize any external image URLs
            await autoImportExternalImages(data, rootDir, slug || target);

            if (target in SINGLETON_FILES) {
              if (target === 'pages' && data) {
                if (data.cxFolksAkademi) {
                  data.akademi = data.cxFolksAkademi;
                } else if (data.akademi) {
                  data.cxFolksAkademi = data.akademi;
                }
              }
              const absPath = path.join(rootDir, SINGLETON_FILES[target]);
              await writeJsonFile(absPath, data);
              await syncBlockPages(rootDir, target, data);
              return sendJson(res, 200, { ok: true, target });
            }

            if (target in COLLECTION_DIRS) {
              const cleanSlug = sanitizeSlug(slug || data.slug || data.title || data.client);
              if (!cleanSlug) {
                return sendJson(res, 400, { ok: false, error: 'Geçerli bir URL kısa adı (slug) gerekli.' });
              }
              const dirAbs = path.join(rootDir, COLLECTION_DIRS[target]);
              const nextData = { ...data, slug: cleanSlug };
              const nextPath = path.join(dirAbs, `${cleanSlug}.json`);
              await writeJsonFile(nextPath, nextData);

              const cleanPrev = sanitizeSlug(previousSlug);
              if (cleanPrev && cleanPrev !== cleanSlug) {
                const prevPath = path.join(dirAbs, `${cleanPrev}.json`);
                await fs.unlink(prevPath).catch(() => {});
              }

              return sendJson(res, 200, { ok: true, target, slug: cleanSlug, item: nextData });
            }

            return sendJson(res, 400, { ok: false, error: 'Bilinmeyen kayıt hedefi.' });
          }

          // POST /api/cms/delete -> Delete an item in projects or blog collection
          if (req.method === 'POST' && urlPath === '/api/cms/delete') {
            const body = JSON.parse(await readBody(req));
            const { target, slug } = body || {};
            if (!(target in COLLECTION_DIRS)) {
              return sendJson(res, 400, { ok: false, error: 'Sadece proje veya blog silinebilir.' });
            }
            const cleanSlug = sanitizeSlug(slug);
            if (!cleanSlug) {
              return sendJson(res, 400, { ok: false, error: 'Geçersiz slug.' });
            }
            const absPath = path.join(rootDir, COLLECTION_DIRS[target], `${cleanSlug}.json`);
            await fs.unlink(absPath);
            return sendJson(res, 200, { ok: true, target, slug: cleanSlug });
          }

          // POST /api/cms/save-batch -> Save multiple singletons/items in one call
          if (req.method === 'POST' && urlPath === '/api/cms/save-batch') {
            const body = JSON.parse(await readBody(req));
            const items = Array.isArray(body?.items) ? body.items : [];
            if (items.length === 0) {
              return sendJson(res, 400, { ok: false, error: 'Kaydedilecek öğe bulunamadı.' });
            }
            for (const item of items) {
              const { target, slug, previousSlug, data } = item || {};
              if (!data || typeof data !== 'object') {
                return sendJson(res, 400, { ok: false, error: 'Geçersiz toplu kayıt öğesi.' });
              }
              // Automatically localize any external images
              await autoImportExternalImages(data, rootDir, slug || target);

              if (target in SINGLETON_FILES) {
                await writeJsonFile(path.join(rootDir, SINGLETON_FILES[target]), data);
                await syncBlockPages(rootDir, target, data);
              } else if (target in COLLECTION_DIRS) {
                const cleanSlug = sanitizeSlug(slug || data.slug || data.title || data.client);
                if (!cleanSlug) {
                  return sendJson(res, 400, { ok: false, error: 'Koleksiyon öğesi için geçerli slug gerekli.' });
                }
                const dirAbs = path.join(rootDir, COLLECTION_DIRS[target]);
                await writeJsonFile(path.join(dirAbs, `${cleanSlug}.json`), { ...data, slug: cleanSlug });
                const cleanPrev = sanitizeSlug(previousSlug);
                if (cleanPrev && cleanPrev !== cleanSlug) {
                  await fs.unlink(path.join(dirAbs, `${cleanPrev}.json`)).catch(() => {});
                }
              } else {
                return sendJson(res, 400, { ok: false, error: `Bilinmeyen hedef: ${target}` });
              }
            }
            return sendJson(res, 200, { ok: true, count: items.length });
          }

          // POST /api/cms/upload -> Save local image file into public/images/{uploads|logos}/ (auto-convert raster images to WebP)
          if (req.method === 'POST' && urlPath === '/api/cms/upload') {
            const body = JSON.parse(await readBody(req));
            const { filename, dataUrl, folder } = body || {};
            if (!filename || typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
              return sendJson(res, 400, { ok: false, error: 'Geçersiz dosya yükleme isteği.' });
            }

            const ext = path.extname(filename).toLowerCase();
            if (!ALLOWED_IMAGE_EXTS.has(ext)) {
              return sendJson(res, 400, { ok: false, error: 'Desteklenmeyen dosya türü (.png, .jpg, .webp, .svg, .gif).' });
            }

            const safeFolder = folder === 'logos' ? 'logos' : 'uploads';
            const baseName = sanitizeSlug(path.basename(filename, ext)) || 'gorsel';
            const stamp = Date.now().toString(36);
            const base64Data = dataUrl.split(',')[1];
            let buffer = Buffer.from(base64Data, 'base64');
            let finalExt = ext;
            let convertedToWebp = false;

            // Automatically convert raster images (.png, .jpg, .jpeg, .webp, .gif) to optimized .webp (quality: 85)
            // Keep .svg as vector XML
            if (ext !== '.svg') {
              try {
                const { default: sharp } = await import('sharp');
                buffer = await sharp(buffer)
                  .webp({ quality: 85, effort: 4 })
                  .toBuffer();
                finalExt = '.webp';
                convertedToWebp = true;
              } catch (sharpErr) {
                console.warn('[CMS upload] Sharp WebP conversion failed, falling back to original:', sharpErr);
              }
            }

            const finalName = `${baseName}-${stamp}${finalExt}`;
            const targetDir = path.join(rootDir, 'public/images', safeFolder);
            await fs.mkdir(targetDir, { recursive: true });
            await fs.writeFile(path.join(targetDir, finalName), buffer);

            const mediaFiles = await listMediaFiles(rootDir);
            return sendJson(res, 200, {
              ok: true,
              url: `/images/${safeFolder}/${finalName}`,
              filename: finalName,
              folder: safeFolder,
              convertedToWebp,
              uploads: mediaFiles.map((f) => f.url),
              mediaFiles,
            });
          }

          // POST /api/cms/media/delete -> Delete an unused local image under public/images/
          if (req.method === 'POST' && urlPath === '/api/cms/media/delete') {
            const body = JSON.parse(await readBody(req));
            const { url } = body || {};
            if (typeof url !== 'string' || !url.startsWith('/images/')) {
              return sendJson(res, 400, { ok: false, error: 'Yalnızca /images/ altındaki yerel dosyalar silinebilir.' });
            }
            const imagesRoot = path.resolve(rootDir, 'public', 'images');
            const rel = url.slice('/images/'.length);
            const targetPath = path.resolve(imagesRoot, rel);
            if (!targetPath.startsWith(imagesRoot + path.sep)) {
              return sendJson(res, 403, { ok: false, error: 'Geçersiz dosya yolu.' });
            }
            const stat = await fs.stat(targetPath).catch(() => null);
            if (!stat || !stat.isFile()) {
              return sendJson(res, 404, { ok: false, error: 'Silinecek dosya bulunamadı.' });
            }
            await fs.unlink(targetPath);
            const mediaFiles = await listMediaFiles(rootDir);
            return sendJson(res, 200, {
              ok: true,
              deleted: url,
              uploads: mediaFiles.map((f) => f.url),
              mediaFiles,
            });
          }

          // POST /api/cms/media/rename -> Rename a local or external file and sync all references across project
          if (req.method === 'POST' && urlPath === '/api/cms/media/rename') {
            const body = JSON.parse(await readBody(req));
            const { oldUrl, newName } = body || {};

            if (typeof oldUrl !== 'string' || !oldUrl.trim()) {
              return sendJson(res, 400, { ok: false, error: 'Geçersiz görsel URL formatı.' });
            }

            if (!newName || typeof newName !== 'string' || !newName.trim()) {
              return sendJson(res, 400, { ok: false, error: 'Lütfen geçerli bir yeni dosya adı girin.' });
            }

            const isExternal = oldUrl.startsWith('http://') || oldUrl.startsWith('https://');

            // Handle external image import & rename
            if (isExternal) {
              const rawBase = path.basename(newName, path.extname(newName));
              const cleanBase = sanitizeSlug(rawBase) || 'gorsel';
              const finalFilename = `${cleanBase}.webp`;
              const targetDir = path.join(rootDir, 'public', 'images', 'uploads');
              await fs.mkdir(targetDir, { recursive: true });
              const newAbsPath = path.join(targetDir, finalFilename);

              // Download external image buffer
              const fetchRes = await fetch(oldUrl);
              if (!fetchRes.ok) {
                return sendJson(res, 400, { ok: false, error: `Harici görsel indirilemedi (${fetchRes.status}).` });
              }
              const arrayBuf = await fetchRes.arrayBuffer();
              const buf = Buffer.from(arrayBuf);

              // Convert to WebP using sharp and save
              const { default: sharp } = await import('sharp');
              await sharp(buf).webp({ quality: 85, effort: 4 }).toFile(newAbsPath);

              const newUrl = `/images/uploads/${finalFilename}`;

              // Replace all occurrences of oldUrl across src/
              const updatedFiles = await replaceImageReferencesAcrossProject(rootDir, oldUrl, newUrl);

              const mediaFiles = await listMediaFiles(rootDir);
              return sendJson(res, 200, {
                ok: true,
                oldUrl,
                newUrl,
                filename: finalFilename,
                converted: true,
                updatedFiles,
                uploads: mediaFiles.map((f) => f.url),
                mediaFiles,
              });
            }

            if (!oldUrl.startsWith('/images/')) {
              return sendJson(res, 400, { ok: false, error: 'Yalnızca /images/ altındaki yerel dosyalar veya geçerli harici URLler adlandırılabilir.' });
            }

            const imagesRoot = path.resolve(rootDir, 'public', 'images');
            const oldRel = oldUrl.slice('/images/'.length);
            const oldAbsPath = path.resolve(imagesRoot, oldRel);

            if (!oldAbsPath.startsWith(imagesRoot + path.sep)) {
              return sendJson(res, 403, { ok: false, error: 'Geçersiz dosya yolu.' });
            }

            const stat = await fs.stat(oldAbsPath).catch(() => null);
            if (!stat || !stat.isFile()) {
              return sendJson(res, 404, { ok: false, error: 'Adı değiştirilecek dosya bulunamadı.' });
            }

            const oldExt = path.extname(oldRel).toLowerCase();
            const rawNewExt = path.extname(newName).toLowerCase();
            const hasValidNewExt = ALLOWED_IMAGE_EXTS.has(rawNewExt);

            // Determine final extension: preserve old extension if newName has none or invalid
            const finalExt = hasValidNewExt ? rawNewExt : oldExt;
            const rawBase = hasValidNewExt ? path.basename(newName, rawNewExt) : newName;
            const cleanBase = sanitizeSlug(rawBase);

            if (!cleanBase) {
              return sendJson(res, 400, { ok: false, error: 'Dosya adı geçersiz karakterler içeriyor.' });
            }

            const finalFilename = `${cleanBase}${finalExt}`;
            const targetDir = path.dirname(oldAbsPath);
            const newAbsPath = path.join(targetDir, finalFilename);

            if (!newAbsPath.startsWith(imagesRoot + path.sep)) {
              return sendJson(res, 403, { ok: false, error: 'Geçersiz hedef yolu.' });
            }

            if (oldAbsPath.toLowerCase() === newAbsPath.toLowerCase()) {
              return sendJson(res, 200, {
                ok: true,
                message: 'Dosya adı değişmedi.',
                oldUrl,
                newUrl: oldUrl,
                filename: finalFilename,
                updatedFiles: [],
              });
            }

            // Check if destination file already exists
            const existingStat = await fs.stat(newAbsPath).catch(() => null);
            if (existingStat) {
              return sendJson(res, 409, { ok: false, error: `"${finalFilename}" adında bir dosya zaten mevcut. Lütfen farklı bir isim belirleyin.` });
            }

            // Check if converting raster to .webp during rename
            let converted = false;
            if (finalExt === '.webp' && oldExt !== '.webp' && oldExt !== '.svg') {
              try {
                const { default: sharp } = await import('sharp');
                await sharp(oldAbsPath).webp({ quality: 85, effort: 4 }).toFile(newAbsPath);
                await fs.unlink(oldAbsPath);
                converted = true;
              } catch (sharpErr) {
                console.warn('[CMS rename] Sharp WebP conversion failed, falling back to rename:', sharpErr);
                await fs.rename(oldAbsPath, newAbsPath);
              }
            } else {
              await fs.rename(oldAbsPath, newAbsPath);
            }

            const newRel = path.relative(imagesRoot, newAbsPath).replace(/\\/g, '/');
            const newUrl = `/images/${newRel}`;

            // Replace all references across project (src/data, src/pages, src/components)
            const updatedFiles = await replaceImageReferencesAcrossProject(rootDir, oldUrl, newUrl);

            const mediaFiles = await listMediaFiles(rootDir);
            return sendJson(res, 200, {
              ok: true,
              oldUrl,
              newUrl,
              filename: finalFilename,
              converted,
              updatedFiles,
              uploads: mediaFiles.map((f) => f.url),
              mediaFiles,
            });
          }

          // GET /api/cms/deploy/status -> Check git & Vercel deployment status
          if (req.method === 'GET' && urlPath === '/api/cms/deploy/status') {
            const status = await getDeployStatus(rootDir);
            return sendJson(res, 200, status);
          }

          // POST /api/cms/deploy/config -> Save project config & optional .env.local GitHub token
          if (req.method === 'POST' && urlPath === '/api/cms/deploy/config') {
            const body = JSON.parse(await readBody(req));
            const config = await writeDeployConfig(rootDir, body || {});
            if (body?.clearToken === true) {
              await writeEnvLocalToken(rootDir, '');
            } else if (typeof body?.githubToken === 'string' && body.githubToken.trim().length > 0) {
              await writeEnvLocalToken(rootDir, body.githubToken);
            }
            const status = await getDeployStatus(rootDir);
            return sendJson(res, 200, { ...status, config });
          }

          // POST /api/cms/build -> Run npm run build and update dist/
          if (req.method === 'POST' && urlPath === '/api/cms/build') {
            const result = await runStaticBuild(rootDir);
            return sendJson(res, result.statusCode, result.payload);
          }

          // POST /api/cms/deploy -> Check build, commit changes & push to GitHub (triggers Vercel deploy)
          if (req.method === 'POST' && urlPath === '/api/cms/deploy') {
            let body = {};
            try {
              const rawBody = await readBody(req);
              if (rawBody) body = JSON.parse(rawBody);
            } catch {}
            const result = await runVercelDeploy(rootDir, body);
            return sendJson(res, result.statusCode, result.payload);
          }

          return sendJson(res, 404, { ok: false, error: 'API ucu bulunamadı.' });
        } catch (err) {
          return sendJson(res, 500, { ok: false, error: err?.message || 'Sunucu hatası.' });
        }
      });
    }

    return {
      name: 'cxfolks-local-cms',
      configureServer(server) {
        attachMiddleware(server);
      },
      configurePreviewServer(server) {
        attachMiddleware(server);
      },
    };
  }
