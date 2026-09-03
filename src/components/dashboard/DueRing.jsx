import React from 'react';
import { COLORS, FONT_MONO, FONT_BODY } from '../../styles/theme';

export function DueRing({ pct, size = 92, stroke = 9, color, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  const dash = c * clamped;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.line} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 600, color: COLORS.paper, lineHeight: 1 }}>{label}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: COLORS.steel, marginTop: 3, letterSpacing: 0.3 }}>{sub}</div>
      </div>
    </div>
  );
}
