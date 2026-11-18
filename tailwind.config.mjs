/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        siteBg: 'var(--color-site-bg)',
        brandAccent: 'var(--color-brand-accent)',
        brandAccentHover: 'var(--color-brand-accent-hover)',
        brandTag: 'var(--color-brand-tag)',
        palettePlatinum: 'var(--color-platinum)',
        paletteDustGrey: 'var(--color-dust-grey)',
        paletteSandyBrown: 'var(--color-sandy-brown)',
        paletteSandyBrownHover: 'var(--color-sandy-brown-hover)',
        palettePowderBlush: 'var(--color-brand-accent)',
        paletteDeepNavy: 'var(--color-deep-navy)',
        paletteRichBlack: 'var(--color-rich-black)',
        textMain: 'var(--color-text-main)',
        textMuted: 'var(--color-text-muted)',
      },
      maxWidth: {
        'custom': '1580px',
      },
    },
  },
  plugins: [],
};
