import React from 'react';
import { COLORS, FONT_BODY, FONT_MONO } from '../../styles/theme';

export function TextField({ label, value, onChange, type = 'text', placeholder, suffix, required }) {
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>
        {label}{required && <span style={{ color: COLORS.rust }}> *</span>}
      </div>
      <div style={{ position: 'relative', minWidth: 0 }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', minWidth: 0, height: 44, boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '0 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 16,
            outline: 'none', paddingRight: suffix ? 42 : 12, overflow: 'hidden'
          }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: COLORS.steelDim, fontSize: 12, fontFamily: FONT_MONO
          }}>{suffix}</span>
        )}
      </div>
    </label>
  );
}
