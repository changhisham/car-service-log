// Palette: workshop / logbook — charcoal + steel, amber caution,
// green ok, rust danger. Display face: condensed industrial.
// Body: clean grotesk. Data: mono, like an odometer readout.
export const COLORS = {
  bg: '#15171A',
  panel: '#1D2024',
  panel2: '#24272C',
  line: '#33373D',
  steel: '#8A919C',
  steelDim: '#5C626B',
  paper: '#F0EEE9',
  amber: '#E8A33D',
  amberDim: '#4A3A22',
  green: '#5FAE7E',
  greenDim: '#243A2C',
  rust: '#D9694F',
  rustDim: '#3F2620',
  blue: '#6E9CC7',
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
