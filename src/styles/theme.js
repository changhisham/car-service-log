// Palette: emerald & ink — a light, near-white ground with white card
// surfaces (a real theme flip from the old dark UI, not just a hue
// swap), a deep-ink-to-emerald sidebar/hero, and an emerald accent pair
// for brand/selection UI. amber/green/rust are semantic warn/ok/danger
// colors, tuned for contrast on a light background (a light tint
// background with a deep, readable foreground) — they don't change with
// the theme, so status meaning stays consistent.
export const COLORS = {
  bg: '#F6F8F6',
  panel: '#FFFFFF',
  panel2: '#FBFDFB',
  line: '#E5EAE6',
  steel: '#40493F',
  steelDim: '#7C8880',
  paper: '#14231E',
  amber: '#B45309',
  amberDim: '#FEF3C7',
  green: '#047857',
  greenDim: '#D1FAE5',
  rust: '#DC2626',
  rustDim: '#FEE2E2',
  // The primary accent — kept under the same 'blue'/'blueDim' names used
  // throughout the app for brand/decorative UI (buttons, active tabs,
  // links, icons), so this palette swap alone updates all of it.
  blue: '#059669',
  blueDim: '#D1FAE5',
  // Secondary accent — used sparingly, only where the two-tone gradient
  // matters (plate badge, brand label, primary button, glow rings): the
  // full gradient everywhere would be visual noise.
  magenta: '#065F46',
  magentaDim: '#A7F3D0',
};

export const ACCENT_GRADIENT = 'linear-gradient(90deg, #047857, #059669)';
export const PAGE_GLOW = 'radial-gradient(circle at 20% 0%, #EAF6EF 0%, #F6F8F6 55%)';

export const FONT_DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
export const FONT_BODY = "'Inter', -apple-system, sans-serif";
export const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

const FONT_LINK_ID = 'csl-fonts';
export function ensureFonts() {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}
