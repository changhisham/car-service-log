export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const fmtKm = (n) =>
  (n === null || n === undefined || isNaN(n)) ? '—' : Number(n).toLocaleString('en-MY');

export const fmtRM = (n) =>
  `RM ${Number(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
