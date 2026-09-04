import React from 'react';
import { COLORS, FONT_BODY, ACCENT_GRADIENT } from '../../styles/theme';

export function PrimaryButton({ children, onClick, disabled, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? '100%' : 'auto', background: disabled ? COLORS.steelDim : ACCENT_GRADIENT,
        color: disabled ? COLORS.paper : '#0A0D18', border: 'none', borderRadius: 10, padding: '13px 20px',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? 'none' : '0 0 18px rgba(0,240,255,0.35), 0 0 18px rgba(255,46,154,0.2)'
      }}
    >
      {children}
    </button>
  );
}
