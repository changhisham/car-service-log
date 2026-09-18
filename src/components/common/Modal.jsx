import React, { useEffect } from 'react';
import { COLORS, FONT_DISPLAY, FONT_BODY, ACCENT_GRADIENT } from '../../styles/theme';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';

export function Modal({ title, subtitle, icon: Icon, onClose, children, wide }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="csl-modal-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(11,31,26,0.45)', zIndex: 1000,
      display: 'flex', justifyContent: 'center'
    }} onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className="csl-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.panel, width: '100%', maxWidth: wide ? 560 : 460, maxHeight: '88vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        {Icon ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', borderBottom: `1px solid ${COLORS.line}` }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: ACCENT_GRADIENT, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
            }}>
              <Icon size={19} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 17, fontWeight: 800, color: COLORS.paper }}>{title}</div>
              {subtitle && <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steelDim, marginTop: 2 }}>{subtitle}</div>}
            </div>
            <IconButton icon={X} onClick={onClose} title="Close" />
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px', borderBottom: `1px solid ${COLORS.line}`
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20.5, color: COLORS.paper, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
            <IconButton icon={X} onClick={onClose} title="Close" />
          </div>
        )}
        <div style={{ padding: 22, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
