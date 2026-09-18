import React from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';

const TONES = {
  green: { bg: COLORS.greenDim, fg: COLORS.green },
  amber: { bg: COLORS.amberDim, fg: COLORS.amber },
  red: { bg: COLORS.rustDim, fg: COLORS.rust },
};

// The standard shape for a group of fields inside a long add/edit form:
// a small colored icon chip + uppercase label, optional helper text, then
// the fields. Every form with more than one logical group of fields uses
// this instead of one flat list, so long forms read as a few short ones.
export function FormSection({ icon: Icon, label, tone = 'green', hint, first, children }) {
  const t = TONES[tone] || TONES.green;
  return (
    <div style={{ borderTop: first ? 'none' : `1px solid ${COLORS.line}`, paddingTop: first ? 0 : 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: hint ? 4 : 14 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, background: t.bg, color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Icon size={14} />
        </div>
        <span style={{ fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, color: t.fg }}>{label}</span>
      </div>
      {hint && <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steelDim, margin: '0 0 12px', lineHeight: 1.5 }}>{hint}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}
