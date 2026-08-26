import React, { useState } from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { PrimaryButton } from '../common/PrimaryButton';
import { PhotoPicker } from '../common/PhotoPicker';
import { uid } from '../../utils/format';

export function VehicleForm({ initial, onSave }) {
  const [v, setV] = useState(() => initial ? {
    ...initial,
    brand: initial.brand || '',
    lastServiceDate: initial.lastServiceDate || '',
    lastServiceOdo: (initial.lastServiceOdo === null || initial.lastServiceOdo === undefined) ? '' : initial.lastServiceOdo,
  } : {
    id: uid(), plate: '', brand: '', model: '', year: '', color: '', odometer: '',
    photo: null, roadTaxExpiry: '', insuranceExpiry: '',
    intervalKm: 10000, intervalMonths: 6,
    lastServiceDate: '', lastServiceOdo: '',
  });
  const set = (k) => (val) => setV(s => ({ ...s, [k]: val }));
  const canSave = v.plate.trim() && v.brand.trim() && v.model.trim() && v.odometer !== '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PhotoPicker photo={v.photo} onPick={set('photo')} onClear={() => set('photo')(null)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Plate number" required value={v.plate} onChange={(s) => set('plate')(s.toUpperCase())} placeholder="WXY 1234" />
        <TextField label="Odometer" required type="number" value={v.odometer} onChange={set('odometer')} suffix="km" placeholder="78420" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Brand" required value={v.brand} onChange={set('brand')} placeholder="Perodua" />
        <TextField label="Model" required value={v.model} onChange={set('model')} placeholder="Myvi 1.5 AV" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Year" value={v.year} onChange={set('year')} placeholder="2021" />
        <TextField label="Colour" value={v.color} onChange={set('color')} placeholder="Putih Mutiara" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Road tax expiry" type="date" value={v.roadTaxExpiry} onChange={set('roadTaxExpiry')} />
        <TextField label="Insurance expiry" type="date" value={v.insuranceExpiry} onChange={set('insuranceExpiry')} />
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 10, fontWeight: 600 }}>
          Service reminder interval — due at whichever comes first
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Every" type="number" value={v.intervalKm} onChange={set('intervalKm')} suffix="km" />
          <TextField label="Or every" type="number" value={v.intervalMonths} onChange={set('intervalMonths')} suffix="months" />
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 4, fontWeight: 600 }}>
          Last service (optional)
        </div>
        <div style={{ fontSize: 11.5, color: COLORS.steelDim, marginBottom: 10, lineHeight: 1.5 }}>
          Used as the starting point for the next-service reminder until you log a service record in the app. Leave blank if unknown — the reminder will show as unavailable until you add one.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Date" type="date" value={v.lastServiceDate} onChange={set('lastServiceDate')} />
          <TextField label="Odometer" type="number" value={v.lastServiceOdo} onChange={set('lastServiceOdo')} suffix="km" />
        </div>
      </div>
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(v)}>
        {initial ? 'Save changes' : 'Add vehicle'}
      </PrimaryButton>
    </div>
  );
}
