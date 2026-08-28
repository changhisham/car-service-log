import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';

export function Toast({ tone = 'ok', message }) {
  const isError = tone === 'error';
  return (
    <div className="csl-toast" style={{
      position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 1200,
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999,
      background: COLORS.paper, color: COLORS.panel, boxShadow: '0 6px 20px rgba(26,31,38,0.25)',
      fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 600, maxWidth: '90vw', whiteSpace: 'nowrap'
    }}>
      {isError ? <AlertCircle size={15} color={COLORS.rust} /> : <CheckCircle2 size={15} color={COLORS.green} />}
      {message}
    </div>
  );
}
