import themeData from '../data/theme.json';
import siteData from '../data/site.json';
import homeData from '../data/home.json';
import pagesData from '../data/pages.json';

export type SurfaceStyleKey = 'platinum' | 'dustGrey' | 'brandAccent' | 'richBlack' | 'siteBg' | 'mesh';
export type BarStyleKey = 'brandAccent' | 'sandyBrown' | 'richBlack';

export interface ThemeTypography {
  bodySizeMobile?: number;
  bodySizeDesktop?: number;
  bodyLineHeight?: number;
  leadSizeMobile?: number;
  leadSizeDesktop?: number;
  h1SizeMobile?: number;
  h1SizeDesktop?: number;
  h1Weight?: number;
  h1LineHeight?: number;
  h2SizeMobile?: number;
  h2SizeDesktop?: number;
  h2Weight?: number;
  h2LineHeight?: number;
  h3SizeMobile?: number;
  h3SizeDesktop?: number;
  h3Weight?: number;
  h3LineHeight?: number;
  h4SizeMobile?: number;
  h4SizeDesktop?: number;
  h4Weight?: number;
  h4LineHeight?: number;
  smallSize?: number;
  buttonSize?: number;
  headingLetterSpacing?: number;
}

export interface SeoGeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  robots?: string;
  breadcrumbName?: string;
  headline?: string;
  schemaDesc?: string;
  schemaType?: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  aboutTopics?: string[];
  targetAudience?: string;
  geoRegion?: string;
  llmsInclude?: boolean;
}

export interface ThemeConfig {
  siteBg: string;
  textMain: string;
  textMuted: string;
  textLight: string;
  brandAccent: string;
  brandAccentHover: string;
  sandyBrown: string;
  sandyBrownHover: string;
  platinum: string;
  dustGrey: string;
  deepNavy: string;
  richBlack: string;
  cardBg: string;
  typography?: ThemeTypography;
}

export interface SurfaceStyleConfig {
  section: string;
  eyebrow: string;
  title: string;
  body: string;
  muted: string;
  btn: string;
  textLink: string;
  cardTitle: string;
  cardBody: string;
}

const SURFACE_STYLES: Record<SurfaceStyleKey, SurfaceStyleConfig> = {
  platinum: {
    section: 'bg-palettePlatinum text-paletteRichBlack',
    eyebrow: 'text-paletteRichBlack/60',
    title: 'text-paletteRichBlack',
    body: 'text-paletteRichBlack/75',
    muted: 'text-paletteRichBlack/60',
    btn: 'bg-paletteRichBlack text-white hover:bg-paletteDeepNavy',
    textLink: 'text-paletteRichBlack hover:text-paletteDeepNavy underline underline-offset-4',
    cardTitle: 'text-paletteRichBlack',
    cardBody: 'text-paletteRichBlack/75',
  },
  dustGrey: {
    section: 'bg-paletteDustGrey text-paletteRichBlack',
    eyebrow: 'text-paletteRichBlack/60',
    title: 'text-paletteRichBlack',
    body: 'text-paletteRichBlack/80',
    muted: 'text-paletteRichBlack/70',
    btn: 'bg-paletteRichBlack text-white hover:bg-paletteDeepNavy',
    textLink: 'text-paletteRichBlack hover:underline underline-offset-4',
    cardTitle: 'text-paletteRichBlack',
    cardBody: 'text-paletteRichBlack/80',
  },
  mesh: {
    section: 'cta-mesh-gradient text-paletteRichBlack',
    eyebrow: 'text-paletteRichBlack/70 font-semibold',
    title: 'text-paletteRichBlack',
    body: 'text-paletteRichBlack/80',
    muted: 'text-paletteRichBlack/65',
    btn: 'bg-paletteRichBlack text-white hover:bg-black',
    textLink: 'text-paletteRichBlack hover:underline underline-offset-4',
    cardTitle: 'text-paletteRichBlack',
    cardBody: 'text-paletteRichBlack/80',
  },
  brandAccent: {
    section: 'bg-brandAccent text-paletteRichBlack',
    eyebrow: 'text-paletteRichBlack/70',
    title: 'text-paletteRichBlack',
    body: 'text-paletteRichBlack/85',
    muted: 'text-paletteRichBlack/70',
    btn: 'bg-paletteRichBlack text-white hover:bg-siteBg hover:text-paletteRichBlack',
    textLink: 'text-paletteRichBlack hover:text-white',
    cardTitle: 'text-paletteRichBlack',
    cardBody: 'text-paletteRichBlack/80',
  },
  richBlack: {
    section: 'bg-paletteRichBlack text-white',
    eyebrow: 'text-brandAccent',
    title: 'text-white',
    body: 'text-white/80',
    muted: 'text-white/60',
    btn: 'bg-brandAccent text-paletteRichBlack hover:bg-brandAccentHover',
    textLink: 'text-brandAccent hover:text-white',
    cardTitle: 'text-brandAccent',
    cardBody: 'text-white/80',
  },
  siteBg: {
    section: 'bg-siteBg text-paletteRichBlack',
    eyebrow: 'text-paletteRichBlack/60',
    title: 'text-paletteRichBlack',
    body: 'text-paletteRichBlack/75',
    muted: 'text-paletteRichBlack/60',
    btn: 'bg-paletteRichBlack text-white hover:bg-paletteDeepNavy',
    textLink: 'text-paletteRichBlack hover:text-paletteDeepNavy underline underline-offset-4',
    cardTitle: 'text-paletteRichBlack',
    cardBody: 'text-paletteRichBlack/75',
  },
};

const BAR_STYLES: Record<BarStyleKey, string> = {
  brandAccent: 'bg-brandAccent group-hover:bg-brandAccentHover',
  sandyBrown: 'bg-paletteSandyBrown group-hover:bg-paletteSandyBrownHover',
  richBlack: 'bg-paletteRichBlack group-hover:bg-paletteDeepNavy',
};

export function getSurfaceStyle(key?: string): SurfaceStyleConfig {
  if (key && key in SURFACE_STYLES) {
    return SURFACE_STYLES[key as SurfaceStyleKey];
  }
  return SURFACE_STYLES.platinum;
}

export function getBarClass(key?: string): string {
  if (key && key in BAR_STYLES) {
    return BAR_STYLES[key as BarStyleKey];
  }
  return BAR_STYLES.brandAccent;
}

export function getTheme(): ThemeConfig {
  return themeData as ThemeConfig;
}

export function getSite() {
  return siteData;
}

export function getHome() {
  return homeData;
}

export function getPages() {
  return pagesData;
}

export interface BlockPageData {
  meta: {
    title: string;
    slug: string;
    status?: string;
  };
  seo: SeoGeoConfig;
  status: string;
  blocks: Array<{
    id?: string;
    type: string;
    visible?: boolean;
    data?: any;
    style?: any;
  }>;
}

export function getAllBlockPages(): BlockPageData[] {
  const modules = import.meta.glob('../data/pages/*.json', { eager: true });
  return Object.values(modules).map((m: any) => m.default || m);
}

export function getBlockPageBySlug(slug: string): BlockPageData | null {
  const normalizedSlug = (slug || '').replace(/^\/|\/$/g, '');
  const all = getAllBlockPages();
  const found = all.find((p) => (p.meta?.slug || '').replace(/^\/|\/$/g, '') === normalizedSlug);
  if (found) return found;
  if (!normalizedSlug) {
    return all.find((p) => p.meta?.slug === '' || p.meta?.slug === 'home') || null;
  }
  return null;
}

export interface ProjectData {
  slug: string;
  order?: number;
  client: string;
  sector: string;
  heroSector?: string;
  title: string;
  shortTitle?: string;
  desc: string;
  listDesc?: string;
  image: string;
  imageAlt?: string;
  image2?: string;
  image2Alt?: string;
  image2Position?: 'afterContent' | 'afterChallenge' | 'afterSolution' | 'afterQuote' | 'end';
  image3?: string;
  image3Alt?: string;
  image3Position?: 'afterContent' | 'afterChallenge' | 'afterSolution' | 'afterQuote' | 'end';
  listStyle?: SurfaceStyleKey;
  heroStyle?: SurfaceStyleKey;
  bullets?: string[];
  seo?: SeoGeoConfig;
  metrics?: Array<{ value: string; label: string }>;
  challenge?: { eyebrow?: string; title: string; body: string };
  approach?: string;
  content?: string;
  closingBoxText?: string;
  summaryItems?: Array<{ title: string; body: string }>;
  solution?: {
    eyebrow?: string;
    title: string;
    columns?: number;
    cards?: Array<{ title: string; body: string; style?: SurfaceStyleKey }>;
  };
  quote?: string;
  cta?: { title?: string; desc?: string };
}

export interface BlogBlock {
  type: 'heading' | 'paragraph' | 'calloutList' | 'gridCards';
  text?: string;
  title?: string;
  items?: string[];
  gap?: string;
  cards?: Array<{ title: string; body: string; style?: SurfaceStyleKey }>;
}

export interface BlogPostData {
  slug: string;
  order?: number;
  title: string;
  articleTitle?: string;
  desc: string;
  homeDesc?: string;
  articleSubtitle?: string;
  category: string;
  date: string;
  datePublishedIso?: string;
  readTime: string;
  barStyle?: BarStyleKey;
  heroStyle?: SurfaceStyleKey;
  image: string;
  heroImage?: string;
  imageAlt?: string;
  seo?: SeoGeoConfig;
  blocks: BlogBlock[];
  relatedLink?: { label: string; href: string };
}

function normalizeCollection<T extends { slug?: string; order?: number }>(
  modules: Record<string, any>
): T[] {
  return Object.entries(modules)
    .map(([filePath, mod]) => {
      const data = (mod?.default ?? mod) as T;
      const fallbackSlug = filePath.split('/').pop()?.replace(/\.json$/, '') || '';
      return {
        ...data,
        slug: data.slug || fallbackSlug,
      };
    })
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function getAllProjects(): ProjectData[] {
  const modules = import.meta.glob('../data/projects/*.json', { eager: true });
  return normalizeCollection<ProjectData>(modules);
}

export function getProjectsBySlugs(slugs?: string[]): ProjectData[] {
  const all = getAllProjects();
  if (!slugs || slugs.length === 0) return all.slice(0, 3);
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const picked = slugs.map((s) => bySlug.get(s)).filter(Boolean) as ProjectData[];
  return picked.length > 0 ? picked : all.slice(0, 3);
}

export function getAllPosts(): BlogPostData[] {
  const modules = import.meta.glob('../data/blog/*.json', { eager: true });
  return normalizeCollection<BlogPostData>(modules);
}

export function getPostsBySlugs(slugs?: string[]): BlogPostData[] {
  const all = getAllPosts();
  if (!slugs || slugs.length === 0) return all.slice(0, 2);
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const picked = slugs.map((s) => bySlug.get(s)).filter(Boolean) as BlogPostData[];
  return picked.length > 0 ? picked : all.slice(0, 2);
}

// =========================================================================
// UNIVERSAL TEXT, COLOR & TYPOGRAPHY RESOLVERS
// =========================================================================

export const PALETTE_COLOR_MAP: Record<string, string> = {
  brandAccent: 'var(--color-brand-accent)',
  brandAccentHover: 'var(--color-brand-accent-hover)',
  brandTag: 'var(--color-brand-tag)',
  brandTagColor: 'var(--color-brand-tag)',
  richBlack: 'var(--color-rich-black)',
  deepNavy: 'var(--color-deep-navy)',
  platinum: 'var(--color-platinum)',
  dustGrey: 'var(--color-dust-grey)',
  sandyBrown: 'var(--color-sandy-brown)',
  siteBg: 'var(--color-site-bg)',
  white: '#ffffff',
  black: '#111111',
  muted: '#666666',
  lime: '#BEF264',
  limeGreen: '#BEF264',
};

export function resolvePaletteColor(c?: string): string {
  if (!c) return '';
  const trimmed = String(c).trim();
  if (PALETTE_COLOR_MAP[trimmed]) return PALETTE_COLOR_MAP[trimmed];
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('rgb') ||
    trimmed.startsWith('hsl') ||
    trimmed.startsWith('var(')
  ) {
    return trimmed;
  }
  return '';
}

export function formatSizePx(s?: string | number): string {
  if (s === undefined || s === null || s === '') return '';
  const str = String(s).trim();
  if (/^[0-9]+(\.[0-9]+)?$/.test(str)) return `${str}px`;
  return str;
}

const TURKISH_VOWELS = new Set(['a','e','ı','i','o','ö','u','ü','A','E','I','İ','O','Ö','U','Ü']);

export function syllabifyTurkishWord(word: string): string {
  if (!word || word.includes('&') || word.includes('http') || word.includes('@') || word.includes('/')) {
    return word;
  }
  const match = word.match(/^([^a-zA-ZçğıöşüÇĞİÖŞÜ]*)([a-zA-ZçğıöşüÇĞİÖŞÜ]+)([^a-zA-ZçğıöşüÇĞİÖŞÜ]*)$/);
  if (!match) return word;
  const [, prefix, letters, suffix] = match;
  // Kelime 6 harften kısaysa satır başından kayması daha estetiktir, hecelemeye gerek yok
  if (letters.length < 6) return word;

  const vIndices: number[] = [];
  for (let i = 0; i < letters.length; i++) {
    if (TURKISH_VOWELS.has(letters[i])) vIndices.push(i);
  }
  if (vIndices.length <= 1) return word;

  const cuts: number[] = [];
  for (let i = 0; i < vIndices.length - 1; i++) {
    const v1 = vIndices[i];
    const v2 = vIndices[i + 1];
    const consonantCount = v2 - v1 - 1;
    let cut: number;
    if (consonantCount === 0) {
      cut = v1 + 1;
    } else if (consonantCount === 1) {
      cut = v1 + 1;
    } else if (consonantCount === 2) {
      cut = v1 + 2;
    } else if (consonantCount === 3) {
      cut = v1 + 3;
    } else {
      cut = v1 + 2;
    }
    // TDK Kuralı: Satır sonu hecelemede başta tek harf bırakılmaz (cut >= 2), sonda tek harf bırakılmaz (letters.length - cut >= 2)
    if (cut >= 2 && letters.length - cut >= 2) {
      cuts.push(cut);
    }
  }

  if (cuts.length === 0) return word;

  let res = '';
  let prev = 0;
  for (const c of cuts) {
    res += letters.slice(prev, c) + '&shy;';
    prev = c;
  }
  res += letters.slice(prev);
  return prefix + res + suffix;
}

export function hyphenateTurkish(text?: string): string {
  if (!text) return '';
  const str = String(text);
  // HTML etiketlerine ve boşluklara dokunmadan metin kelimelerini hecele
  return str.replace(/(<[^>]+>)|([^<\s]+)/g, (match, tag, word) => {
    if (tag) return tag;
    return syllabifyTurkishWord(word);
  });
}

export function formatRich(text?: string): string {
  if (!text) return '';
  let str = String(text);
  // Safely encode standalone '<' that is not part of an allowed html tag (e.g. '< 15', '<100')
  str = str.replace(/<(?!\/?(?:b|strong|br|i|em|span|div|p)\b[^>]*>)/gi, '&lt;');
  str = str.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  str = str.replace(/\r?\n\r?\n/g, '<br><br>');
  return hyphenateTurkish(str);
}

export function resolveTextStyle(data: any, fieldKey: string, fallbackColor?: string): string {
  if (!data || typeof data !== 'object') return '';
  const styles: string[] = [];

  // Size resolution: checks `${fieldKey}Size`, and for title/heading also checks headingSize
  const customSize =
    data[`${fieldKey}Size`] ??
    (fieldKey === 'title' || fieldKey === 'heading' ? data.headingSize || data.titleSize : undefined);

  if (customSize) {
    styles.push(`font-size: ${formatSizePx(customSize)} !important`);
  }

  // Weight / Boldness resolution: checks `${fieldKey}Weight` or `${fieldKey}Bold`
  const rawWeight =
    data[`${fieldKey}Weight`] ??
    (data[`${fieldKey}Bold`] ? '700' : undefined) ??
    (fieldKey === 'title' || fieldKey === 'heading' ? data.headingWeight || data.titleWeight : undefined);

  if (rawWeight) {
    const wVal = rawWeight === true || rawWeight === 'bold' ? '700' : rawWeight === false || rawWeight === 'normal' ? '400' : String(rawWeight);
    styles.push(`font-weight: ${wVal} !important`);
  }

  // Color resolution: checks `${fieldKey}Color`, and for title/heading also checks headingColor
  const rawColor =
    data[`${fieldKey}Color`] ??
    (fieldKey === 'title' || fieldKey === 'heading' ? data.headingColor || data.titleColor : undefined) ??
    fallbackColor;

  const resolvedColor = resolvePaletteColor(rawColor);
  if (resolvedColor) {
    styles.push(`color: ${resolvedColor} !important`);
  }

  return styles.join('; ');
}

export function resolveTextTag(data: any, fieldKey: string, defaultTag: string = 'p'): string {
  if (!data || typeof data !== 'object') return defaultTag;
  const rawTag =
    data[`${fieldKey}Tag`] ||
    (fieldKey === 'title' || fieldKey === 'heading' ? data.headingTag || data.titleTag : undefined);

  if (!rawTag) return defaultTag;
  const clean = String(rawTag).toLowerCase().trim();
  const valid = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'];
  return valid.includes(clean) ? clean : defaultTag;
}
