import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { Modal } from './Modal';

export function ConfirmDeleteModal({ kind, onCancel, onConfirm }) {
  return (
    <Modal title={kind === 'vehicle' ? 'Delete vehicle?' : 'Delete record?'} onClose={onCancel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: COLORS.steel, fontSize: 13.5, lineHeight: 1.5 }}>
          <AlertTriangle size={18} color={COLORS.rust} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            {kind === 'vehicle'
              ? 'This removes the vehicle and its entire service history. This cannot be undone.'
              : 'This removes the service record permanently. This cannot be undone.'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, border: `1px solid ${COLORS.line}`,
            background: 'transparent', color: COLORS.paper, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13.5, cursor: 'pointer'
          }}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
              background: COLORS.rust, color: '#1A0E0A', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, cursor: 'pointer'
            }}>Delete</button>
        </div>
      </div>
    </Modal>
  );
}
