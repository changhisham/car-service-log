import React, { useEffect } from 'react';
import { COLORS, FONT_DISPLAY, FONT_BODY, ACCENT_GRADIENT } from '../../styles/theme';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';

// Two distinct shapes share this component: a real add/edit form (has an
// `icon`) is a full-screen takeover on mobile — the native date-picker
// overlap issue and cramped fields make a small popup unworkable there —
// but on desktop it's a centered, fixed-width popup again (see
// .gl-modal-form in index.css for the breakpoint). Forms with several
// field groups pass `twoCol` so their sections flow into two columns on
// that wider desktop popup instead of one long scroll (see .gl-form-body).
// A lightweight confirmation (no `icon` — just ConfirmDeleteModal today)
// stays a small centered dialog on every viewport.
export function Modal({ title, subtitle, icon: Icon, onClose, children, wide, twoCol }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const desktopMaxW = twoCol ? 940 : (wide ? 760 : 560);

  if (!Icon) {
    return (
      <div className="csl-modal-backdrop" style={{
        position: 'fixed', inset: 0, background: 'rgba(11,31,26,0.45)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }} onClick={onClose}>
        <div
          role="dialog" aria-modal="true" aria-label={title}
          onClick={(e) => e.stopPropagation()}
          className="csl-card"
          style={{
            background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 20,
            width: '100%', maxWidth: 440, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px', borderBottom: `1px solid ${COLORS.line}`
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20.5, color: COLORS.paper, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
            <IconButton icon={X} onClick={onClose} title="Close" />
          </div>
          <div style={{ padding: 22, overflowY: 'auto' }}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="csl-modal-backdrop gl-modal-form"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`csl-modal-sheet gl-modal-form${twoCol ? ' gl-modal-wide' : ''}`}
        style={{
          background: COLORS.panel, width: '100%', maxWidth: desktopMaxW,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', borderBottom: `1px solid ${COLORS.line}`, flexShrink: 0 }}>
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
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: 22 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
