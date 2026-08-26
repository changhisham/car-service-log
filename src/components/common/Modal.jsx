import React from 'react';
import { COLORS, FONT_DISPLAY } from '../../styles/theme';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';

export function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,11,13,0.72)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.panel, width: '100%', maxWidth: wide ? 560 : 440, maxHeight: '88vh',
          borderRadius: '20px 20px 0 0', border: `1px solid ${COLORS.line}`, borderBottom: 'none',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${COLORS.line}`
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: COLORS.paper, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
          <IconButton icon={X} onClick={onClose} />
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
