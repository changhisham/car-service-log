import React, { useState, useEffect } from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { PrimaryButton } from '../common/PrimaryButton';
import { uid } from '../../utils/format';
import { todayISO } from '../../utils/date';

export function FuelForm({ initial, currentOdo, onSave }) {
  const [f, setF] = useState(initial || {
    id: uid(), date: todayISO(), odometer: currentOdo || '', litres: '', pricePerLitre: '', totalCost: '', fullTank: true, station: '',
  });
  const set = (k) => (val) => setF(s => ({ ...s, [k]: val }));

  // Auto-fill total cost from litres × price/L when both are present and
  // the user hasn't typed a total themselves.
  const [totalTouched, setTotalTouched] = useState(!!initial);
  useEffect(() => {
    if (totalTouched) return;
    const l = Number(f.litres), p = Number(f.pricePerLitre);
    if (l > 0 && p > 0) {
      setF(s => ({ ...s, totalCost: (l * p).toFixed(2) }));
    }
  }, [f.litres, f.pricePerLitre, totalTouched]);

  const canSave = f.date && f.odometer !== '' && f.litres !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Date" required type="date" value={f.date} onChange={set('date')} />
        <TextField label="Odometer" required type="number" value={f.odometer} onChange={set('odometer')} suffix="km" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Litres" required type="number" value={f.litres} onChange={set('litres')} suffix="L" placeholder="38.2" />
        <TextField label="Price / litre" type="number" value={f.pricePerLitre} onChange={set('pricePerLitre')} suffix="RM" placeholder="2.05" />
      </div>
      <TextField label="Total cost" type="number" value={f.totalCost} onChange={(v) => { setTotalTouched(true); set('totalCost')(v); }} suffix="RM" placeholder="78.31" />
      <TextField label="Station" value={f.station} onChange={set('station')} placeholder="Shell, Petronas…" />
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={f.fullTank} onChange={(e) => set('fullTank')(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: COLORS.blue }} />
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600 }}>Full tank</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: COLORS.steelDim }}>Needed to calculate fuel economy accurately</div>
        </div>
      </label>
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(f)}>
        {initial ? 'Save changes' : 'Add fill-up'}
      </PrimaryButton>
    </div>
  );
}
