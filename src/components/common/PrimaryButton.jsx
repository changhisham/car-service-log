import React from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';

export function PrimaryButton({ children, onClick, disabled, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? '100%' : 'auto', background: disabled ? COLORS.steelDim : COLORS.blue,
        color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '13px 20px',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}
    </button>
  );
}
