import React from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';

export function SectionTabs({ sections, active, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 4, margin: '0 18px 16px', background: COLORS.panel, borderRadius: 10, padding: 4 }}>
      {sections.map(s => (
        <button key={s.key} onClick={() => onSelect(s.key)} style={{
          flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
          background: active === s.key ? COLORS.panel2 : 'transparent',
          color: active === s.key ? COLORS.paper : COLORS.steelDim,
          fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700
        }}>{s.label}</button>
      ))}
    </div>
  );
}
