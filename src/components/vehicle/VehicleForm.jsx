import React, { useState } from 'react';
import { Car, ShieldCheck, Bell, History } from 'lucide-react';
import { TextField } from '../common/TextField';
import { FormActions } from '../common/FormActions';
import { FormSection } from '../common/FormSection';
import { PhotoPicker } from '../common/PhotoPicker';
import { uid } from '../../utils/format';

export function VehicleForm({ initial, onSave, onCancel }) {
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
    <div className="gl-form-body">
      <FormSection icon={Car} label="Vehicle" tone="green" first>
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
      </FormSection>

      <FormSection icon={ShieldCheck} label="Documents" tone="red">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Road tax expiry" type="date" value={v.roadTaxExpiry} onChange={set('roadTaxExpiry')} />
          <TextField label="Insurance expiry" type="date" value={v.insuranceExpiry} onChange={set('insuranceExpiry')} />
        </div>
      </FormSection>

      <FormSection icon={Bell} label="Service reminder" tone="amber" hint="Due at whichever comes first.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Every" type="number" value={v.intervalKm} onChange={set('intervalKm')} suffix="km" />
          <TextField label="Or every" type="number" value={v.intervalMonths} onChange={set('intervalMonths')} suffix="months" />
        </div>
      </FormSection>

      <FormSection icon={History} label="Last service" tone="green" hint="Optional. Starting point for the next-service reminder until you log a service record in the app.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Date" type="date" value={v.lastServiceDate} onChange={set('lastServiceDate')} />
          <TextField label="Odometer" type="number" value={v.lastServiceOdo} onChange={set('lastServiceOdo')} suffix="km" />
        </div>
      </FormSection>

      <FormActions onCancel={onCancel} disabled={!canSave} onSave={() => onSave(v)} saveLabel={initial ? 'Save changes' : 'Add vehicle'} />
    </div>
  );
}
