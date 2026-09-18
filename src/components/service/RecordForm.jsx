import React, { useState } from 'react';
import { Wrench, MapPin, FileText } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { SelectField } from '../common/SelectField';
import { FormActions } from '../common/FormActions';
import { FormSection } from '../common/FormSection';
import { MultiPhotoPicker } from '../common/MultiPhotoPicker';
import { SERVICE_TYPES } from '../../constants/serviceTypes';
import { uid } from '../../utils/format';
import { todayISO } from '../../utils/date';

export function RecordForm({ initial, currentOdo, onSave, onCancel }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FormSection icon={Wrench} label="Service details" tone="green" first>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Date" required type="date" value={r.date} onChange={set('date')} />
          <TextField label="Odometer" required type="number" value={r.odometer} onChange={set('odometer')} suffix="km" />
        </div>
        <SelectField label="Service type" value={r.type} onChange={set('type')}
          options={SERVICE_TYPES.map(t => ({ value: t.key, label: t.label }))} />
        <TextField label="Cost" type="number" value={r.cost} onChange={set('cost')} suffix="RM" placeholder="185" />
      </FormSection>

      <FormSection icon={MapPin} label="Workshop" tone="amber" hint="Optional.">
        <TextField label="Name" value={r.workshopName} onChange={set('workshopName')} placeholder="Ahmad Auto Service" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Phone" value={r.workshopPhone} onChange={set('workshopPhone')} placeholder="012-3456789" />
          <TextField label="Location" value={r.workshopLocation} onChange={set('workshopLocation')} placeholder="Petaling Jaya" />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Notes & photos" tone="green">
        <label style={{ display: 'block' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>Notes</div>
          <textarea
            value={r.notes} onChange={(e) => set('notes')(e.target.value)} rows={3}
            placeholder="Parts used, anything worth remembering"
            style={{
              width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
              borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 17.5,
              outline: 'none', resize: 'vertical'
            }}
          />
        </label>
        <MultiPhotoPicker photos={r.photos} onChange={set('photos')} />
      </FormSection>

      <FormActions onCancel={onCancel} disabled={!canSave} onSave={() => onSave(r)} saveLabel={initial ? 'Save changes' : 'Add record'} />
    </div>
  );
}
