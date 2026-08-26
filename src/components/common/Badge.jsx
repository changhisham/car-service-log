import React from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';

export function Badge({ tone, icon: Icon, children }) {
  const tones = {
    ok: { bg: COLORS.greenDim, fg: COLORS.green },
    warn: { bg: COLORS.amberDim, fg: COLORS.amber },
    bad: { bg: COLORS.rustDim, fg: COLORS.rust },
    neutral: { bg: COLORS.panel2, fg: COLORS.steel },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px',
      borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600,
      fontFamily: FONT_BODY, whiteSpace: 'nowrap'
    }}>
      {Icon && <Icon size={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
