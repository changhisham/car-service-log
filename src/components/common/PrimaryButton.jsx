import React from 'react';
import { COLORS, FONT_BODY, ACCENT_GRADIENT } from '../../styles/theme';

export function PrimaryButton({ children, onClick, disabled, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? '100%' : 'auto', background: disabled ? COLORS.steelDim : ACCENT_GRADIENT,
        color: disabled ? COLORS.paper : COLORS.bg, border: 'none', borderRadius: 10, padding: '13px 20px',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15.5, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? 'none' : '0 4px 14px rgba(4,120,87,0.28)'
      }}
    >
      {children}
    </button>
  );
}
