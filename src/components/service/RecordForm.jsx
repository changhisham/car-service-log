import React, { useState } from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { SelectField } from '../common/SelectField';
import { PrimaryButton } from '../common/PrimaryButton';
import { MultiPhotoPicker } from '../common/MultiPhotoPicker';
import { SERVICE_TYPES } from '../../constants/serviceTypes';
import { uid } from '../../utils/format';
import { todayISO } from '../../utils/date';

export function RecordForm({ initial, currentOdo, onSave }) {
  const [r, setR] = useState(() => initial ? {
    ...initial,
    photos: initial.photos || (initial.photo ? [initial.photo] : []),
    workshopName: initial.workshopName || '',
    workshopPhone: initial.workshopPhone || '',
    workshopLocation: initial.workshopLocation || '',
  } : {
    id: uid(), date: todayISO(), odometer: currentOdo || '', type: 'oil', cost: '', notes: '', photos: [],
    workshopName: '', workshopPhone: '', workshopLocation: '',
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

      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 10, fontWeight: 600 }}>
          Workshop (optional)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextField label="Name" value={r.workshopName} onChange={set('workshopName')} placeholder="Ahmad Auto Service" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TextField label="Phone" value={r.workshopPhone} onChange={set('workshopPhone')} placeholder="012-3456789" />
            <TextField label="Location" value={r.workshopLocation} onChange={set('workshopLocation')} placeholder="Petaling Jaya" />
          </div>
        </div>
      </div>

      <label style={{ display: 'block' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>Notes</div>
        <textarea
          value={r.notes} onChange={(e) => set('notes')(e.target.value)} rows={3}
          placeholder="Parts used, anything worth remembering"
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 16,
            outline: 'none', resize: 'vertical'
          }}
        />
      </label>
      <MultiPhotoPicker photos={r.photos} onChange={set('photos')} />
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(r)}>
        {initial ? 'Save changes' : 'Add record'}
      </PrimaryButton>
    </div>
  );
}
