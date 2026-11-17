import { getSurfaceStyle, type SurfaceStyleKey } from './content';

export interface BlockStyleConfig {
  surface?: SurfaceStyleKey | 'custom';
  customBg?: string;
  customText?: string;
  titleColor?: string;
  bodyColor?: string;
  btnColor?: string;
  bgImage?: string;
  bgOverlayColor?: string;
  bgOverlayOpacity?: number;
  paddingTop?: 'none' | 'compact' | 'normal' | 'spacious' | string;
  paddingBottom?: 'none' | 'compact' | 'normal' | 'spacious' | string;
  containerWidth?: 'narrow' | 'normal' | 'wide' | 'custom' | 'full';
  align?: 'left' | 'center' | 'right';
  visibility?: 'all' | 'desktopOnly' | 'mobileOnly';
  hideMobile?: boolean;
  hideDesktop?: boolean;
  customClass?: string;
  sectionId?: string;
}

export function computeBlockStyles(style: BlockStyleConfig = {}) {
  const surfaceKey = style.surface || 'siteBg';
  const surface = surfaceKey !== 'custom' ? getSurfaceStyle(surfaceKey) : null;

  // Paddings
  const padTopMap: Record<string, string> = {
    none: 'pt-0',
    compact: 'pt-8 sm:pt-12',
    sm: 'pt-8 sm:pt-12',
    normal: 'pt-14 sm:pt-20 md:pt-24',
    md: 'pt-14 sm:pt-20 md:pt-24',
    spacious: 'pt-[100px] md:pt-[150px]',
    lg: 'pt-[100px] md:pt-[150px]',
    xl: 'pt-[120px] md:pt-[150px]',
  };

  const padBottomMap: Record<string, string> = {
    none: 'pb-0',
    compact: 'pb-8 sm:pb-12',
    sm: 'pb-8 sm:pb-12',
    normal: 'pb-14 sm:pb-20 md:pb-24',
    md: 'pb-14 sm:pb-20 md:pb-24',
    spacious: 'pb-[100px] md:pb-[150px]',
    lg: 'pb-[100px] md:pb-[150px]',
    xl: 'pb-[120px] md:pb-[150px]',
  };

  const ptClass = style.paddingTop ? (padTopMap[style.paddingTop] || (style.paddingTop.startsWith('pt-') ? style.paddingTop : '')) : '';
  const pbClass = style.paddingBottom ? (padBottomMap[style.paddingBottom] || (style.paddingBottom.startsWith('pb-') ? style.paddingBottom : '')) : '';

  // Container widths
  const containerMap: Record<string, string> = {
    narrow: 'max-w-3xl mx-auto',
    normal: 'max-w-5xl mx-auto',
    wide: 'max-w-custom mx-auto',
    custom: 'max-w-custom mx-auto',
    full: 'w-full',
  };
  const containerClass = containerMap[style.containerWidth || 'wide'] || 'max-w-custom mx-auto';

  // Responsive visibility
  let visClass = '';
  const isDesktopOnly = style.visibility === 'desktopOnly' || style.hideMobile;
  const isMobileOnly = style.visibility === 'mobileOnly' || style.hideDesktop;
  if (isDesktopOnly && isMobileOnly) visClass = 'hidden';
  else if (isDesktopOnly) visClass = 'hidden md:block';
  else if (isMobileOnly) visClass = 'block md:hidden';

  // Alignment
  const alignClass = style.align === 'center' ? 'text-center' : style.align === 'right' ? 'text-right' : 'text-left';

  // Outer section classes
  const sectionClasses = [
    surface ? surface.section : (style.customBg ? '' : 'bg-siteBg text-paletteRichBlack'),
    ptClass,
    pbClass,
    visClass,
    alignClass,
    style.customClass || '',
  ].filter(Boolean).join(' ');

  // Inline styles for custom colors & background images
  const inlineStyles: Record<string, string> = {};
  if (style.customBg) inlineStyles['background-color'] = style.customBg;
  if (style.customText) inlineStyles['color'] = style.customText;
  if (style.titleColor) inlineStyles['--block-title-color'] = style.titleColor;
  if (style.bodyColor) inlineStyles['--block-body-color'] = style.bodyColor;
  if (style.btnColor) inlineStyles['--block-btn-color'] = style.btnColor;

  if (style.bgImage) {
    inlineStyles['background-image'] = `url('${style.bgImage}')`;
    inlineStyles['background-size'] = 'cover';
    inlineStyles['background-position'] = 'center';
  }

  const inlineStyleString = Object.entries(inlineStyles)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  const overlayColor = style.bgOverlayColor || (style as any).overlayColor || '#000000';
  const rawOpacity = style.bgOverlayOpacity ?? (style as any).overlayOpacity;
  const hasOverlay = Boolean(style.bgOverlayColor || (style as any).overlayColor || rawOpacity !== undefined);
  const opacityVal = rawOpacity !== undefined ? (rawOpacity <= 1 ? rawOpacity : rawOpacity / 100) : 0.5;
  const overlayStyle = hasOverlay ? `background-color: ${overlayColor}; opacity: ${opacityVal};` : '';

  return {
    sectionClasses,
    containerClass,
    alignClass,
    inlineStyleString,
    surface,
    sectionId: style.sectionId || '',
    hasOverlay,
    overlayStyle,
  };
}
