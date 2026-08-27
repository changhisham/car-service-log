// Palette: workshop / logbook — charcoal + steel, amber caution,
// green ok, rust danger. Display face: condensed industrial.
// Body: clean grotesk. Data: mono, like an odometer readout.
export const COLORS = {
  bg: '#F2EAD9', panel: '#FFFDF8', panel2: '#F6EEDE', line: '#DED0B4',
  steel: '#6E6250', steelDim: '#9C8F76', paper: '#241D12',
  amber: '#B4600F', amberDim: '#F2DEB3',
  green: '#3D7A50', greenDim: '#DCEDDE',
  rust: '#A8492C', rustDim: '#F3D8CB', blue: '#3A6690',
  plate: '#F5F1E6',
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
