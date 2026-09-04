// Palette: neon cyber — near-black surfaces, a cyan-to-magenta neon
// accent pair for brand/selection UI and glow effects, monospace HUD
// numbers. amber/green/rust stay fixed as semantic warn/ok/danger
// colors (brightened for contrast against a dark background) — they
// don't change with the theme, so status meaning stays consistent.
export const COLORS = {
  bg: '#0A0D18',
  panel: '#12162A',
  panel2: '#171C36',
  line: '#232A4A',
  steel: '#7A85B5',
  steelDim: '#565F8A',
  paper: '#E8ECFF',
  amber: '#FFB84D',
  amberDim: '#3D2E12',
  green: '#4ADE80',
  greenDim: '#123420',
  rust: '#FF6B6B',
  rustDim: '#3D1414',
  // The primary neon accent — kept under the same 'blue'/'blueDim' names
  // used throughout the app for brand/decorative UI (buttons, active
  // tabs, links, icons), so this palette swap alone updates all of it.
  blue: '#7DF9FF',
  blueDim: 'rgba(0,240,255,0.12)',
  // Secondary accent — used sparingly, only where the two-tone neon
  // gradient matters (plate badge, brand label, primary button, glow
  // rings): the full gradient everywhere would be visual noise.
  magenta: '#FF7EC4',
  magentaDim: 'rgba(255,46,154,0.12)',
};

export const ACCENT_GRADIENT = 'linear-gradient(90deg, #00F0FF, #FF2E9A)';
export const PAGE_GLOW = 'radial-gradient(circle at 20% 0%, #151A2E 0%, #0A0D18 55%)';

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
