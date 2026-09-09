// Garage Log v2 design tokens. Cyan is the primary brand accent; semantic
// colours are reserved for meaning so alerts remain easy to scan.
export const COLORS = {
  bg: '#050B14',
  panel: '#0B1424',
  panel2: '#101C31',
  line: '#19304A',
  steel: '#8EA3BE',
  steelDim: '#60748F',
  paper: '#F1F7FF',
  amber: '#F7B955',
  amberDim: 'rgba(247,185,85,0.12)',
  green: '#39E58C',
  greenDim: 'rgba(57,229,140,0.12)',
  rust: '#FF5C6C',
  rustDim: 'rgba(255,92,108,0.12)',
  blue: '#22E6F2',
  blueDim: 'rgba(34,230,242,0.11)',
  magenta: '#A78BFA',
  magentaDim: 'rgba(167,139,250,0.12)',
};
export const ACCENT_GRADIENT = 'linear-gradient(135deg, #22E6F2, #0FB8D2)';
export const PAGE_GLOW = 'radial-gradient(circle at 50% 0%, rgba(17,55,88,.55) 0%, #050B14 55%)';
export const FONT_DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
export const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_MONO = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";
const FONT_LINK_ID = 'csl-fonts';
export function ensureFonts() {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link'); link.id=FONT_LINK_ID; link.rel='stylesheet';
  link.href='https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}
