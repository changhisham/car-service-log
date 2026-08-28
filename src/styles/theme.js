// Palette: cool slate — neutral gray-blue surfaces, dark ink text, a
// steel-blue accent for brand/selection UI (buttons, active tabs, links).
// amber/green/rust stay fixed as semantic warn/ok/danger colors — they
// don't change with the theme, so status meaning stays consistent.
export const COLORS = {
  bg: '#EDEFF2',
  panel: '#FFFFFF',
  panel2: '#F2F4F6',
  line: '#D6DBE1',
  steel: '#5B6472',
  steelDim: '#8B93A0',
  paper: '#1A1F26',
  amber: '#B4600F',
  amberDim: '#F2DEB3',
  green: '#3D7A50',
  greenDim: '#DCEDDE',
  rust: '#A8492C',
  rustDim: '#F3D8CB',
  blue: '#2F6690',
  blueDim: '#DCEAF3',
  // Stable, theme-independent token: a real vehicle plate is light with
  // dark text regardless of the app's palette, so this doesn't move when
  // the rest of the theme changes.
  plate: '#F3F5F7',
};

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
