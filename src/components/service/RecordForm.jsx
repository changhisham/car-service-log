import React, { useState } from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { SelectField } from '../common/SelectField';
import { PrimaryButton } from '../common/PrimaryButton';
import { PhotoPicker } from '../common/PhotoPicker';
import { SERVICE_TYPES } from '../../constants/serviceTypes';
import { uid } from '../../utils/format';
import { todayISO } from '../../utils/date';

export function RecordForm({ initial, currentOdo, onSave }) {
  const [r, setR] = useState(initial || {
    id: uid(), date: todayISO(), odometer: currentOdo || '', type: 'oil', cost: '', notes: '', photo: null,
  });
  const set = (k) => (val) => setR(s => ({ ...s, [k]: val }));
  const canSave = r.date && r.odometer !== '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Date" required type="date" value={r.date} onChange={set('date')} />
        <TextField label="Odometer" required type="number" value={r.odometer} onChange={set('odometer')} suffix="km" />
      </div>
      <SelectField label="Service type" value={r.type} onChange={set('type')}
        options={SERVICE_TYPES.map(t => ({ value: t.key, label: t.label }))} />
      <TextField label="Cost" type="number" value={r.cost} onChange={set('cost')} suffix="RM" placeholder="185" />
      <label style={{ display: 'block' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>Notes</div>
        <textarea
          value={r.notes} onChange={(e) => set('notes')(e.target.value)} rows={3}
          placeholder="Workshop, parts used, anything worth remembering"
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 16,
            outline: 'none', resize: 'vertical'
          }}
        />
      </label>
      <PhotoPicker photo={r.photo} onPick={set('photo')} onClear={() => set('photo')(null)} />
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(r)}>
        {initial ? 'Save changes' : 'Add record'}
      </PrimaryButton>
    </div>
  );
}
