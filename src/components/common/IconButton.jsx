import React from 'react';
import { COLORS } from '../../styles/theme';

export function IconButton({ icon: Icon, onClick, tone = 'default', size = 34, title }) {
  const bg = tone === 'danger' ? COLORS.rustDim : COLORS.panel2;
  const fg = tone === 'danger' ? COLORS.rust : COLORS.steel;
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: size, height: size, borderRadius: 10, border: `1px solid ${COLORS.line}`,
        background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0
      }}
    >
      <Icon size={16} strokeWidth={2.2} />
    </button>
  );
}
