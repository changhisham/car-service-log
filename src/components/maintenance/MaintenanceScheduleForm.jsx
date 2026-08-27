import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { PrimaryButton } from '../common/PrimaryButton';
import { IconButton } from '../common/IconButton';
import { uid } from '../../utils/format';

export function MaintenanceScheduleForm({ items, onSave }) {
  const [list, setList] = useState(items || []);

  const updateItem = (id, patch) => {
    setList(l => l.map(item => item.id === id ? { ...item, ...patch } : item));
  };
  const removeItem = (id) => {
    setList(l => l.filter(item => item.id !== id));
  };
  const addItem = () => {
    setList(l => [...l, { id: uid(), key: `custom_${uid()}`, label: '', intervalKm: 10000, intervalMonths: 6, lastDate: '', lastOdo: null }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {list.map((item) => (
        <div key={item.id} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <TextField label="Item" value={item.label} onChange={(v) => updateItem(item.id, { label: v })} placeholder="e.g. Spark plugs" />
            </div>
            <IconButton icon={Trash2} tone="danger" onClick={() => removeItem(item.id)} title="Remove item" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <TextField label="Every" type="number" value={item.intervalKm} onChange={(v) => updateItem(item.id, { intervalKm: v })} suffix="km" />
            <TextField label="Or every" type="number" value={item.intervalMonths} onChange={(v) => updateItem(item.id, { intervalMonths: v })} suffix="months" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <TextField label="Last done (date)" type="date" value={item.lastDate || ''} onChange={(v) => updateItem(item.id, { lastDate: v })} />
            <TextField label="Last done (odometer)" type="number" value={item.lastOdo === null || item.lastOdo === undefined ? '' : item.lastOdo} onChange={(v) => updateItem(item.id, { lastOdo: v === '' ? null : Number(v) })} suffix="km" />
          </div>
        </div>
      ))}

      <button onClick={addItem} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10,
        border: `1px dashed ${COLORS.line}`, background: 'transparent', color: COLORS.steel,
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, cursor: 'pointer'
      }}>
        <Plus size={14} /> Add item
      </button>

      <PrimaryButton full onClick={() => onSave(list.map(item => ({
        ...item,
        intervalKm: Number(item.intervalKm) || 10000,
        intervalMonths: Number(item.intervalMonths) || 6,
      })))}>
        Save schedule
      </PrimaryButton>
    </div>
  );
}
