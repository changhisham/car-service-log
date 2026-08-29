import React, { useEffect } from 'react';
import { COLORS, FONT_DISPLAY } from '../../styles/theme';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="csl-modal-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(10,11,13,0.45)', zIndex: 1000,
      display: 'flex', justifyContent: 'center'
    }} onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className="csl-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.panel, width: '100%', maxWidth: wide ? 560 : 440, maxHeight: '88vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${COLORS.line}`
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: COLORS.paper, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
          <IconButton icon={X} onClick={onClose} title="Close" />
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
