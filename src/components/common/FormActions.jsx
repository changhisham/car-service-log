import React from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { PrimaryButton } from './PrimaryButton';

// The standard footer for every add/edit form rendered inside a Modal:
// a neutral Cancel next to the primary action, always in that order and
// always equal width, so every form in the app closes the same way.
export function FormActions({ onCancel, onSave, disabled, saveLabel = 'Save' }) {
  return (
    <div className="gl-form-actions" style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={onCancel}
        style={{
          flex: 1, padding: '13px 16px', borderRadius: 10, border: `1px solid ${COLORS.line}`,
          background: '#fff', color: COLORS.paper, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15.5, cursor: 'pointer'
        }}
      >
        Cancel
      </button>
      <div style={{ flex: 1 }}>
        <PrimaryButton full disabled={disabled} onClick={onSave}>{saveLabel}</PrimaryButton>
      </div>
    </div>
  );
}
