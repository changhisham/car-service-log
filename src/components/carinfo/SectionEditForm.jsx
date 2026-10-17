import React, { useState } from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { FormActions } from '../common/FormActions';
import { MultiPhotoPicker } from '../common/MultiPhotoPicker';

export function SectionEditForm({ section, initial, onSave, onCancel }) {
  const [data, setData] = useState(() => {
    const base = {};
    section.fields.forEach(f => { base[f.key] = (initial && initial[f.key]) || ''; });
    if (section.hasAttachments) base.attachments = (initial && initial.attachments) || [];
    return base;
  });
  const set = (k) => (v) => setData(s => ({ ...s, [k]: v }));

  const singleLine = section.fields.filter(f => !f.multiline);
  const multiline = section.fields.filter(f => f.multiline);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {section.note && (
        <div style={{
          fontSize: 12.5, color: COLORS.steelDim, lineHeight: 1.5, background: COLORS.bg,
          border: `1px solid ${COLORS.line}`, borderRadius: 9, padding: 10
        }}>{section.note}</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {singleLine.map(f => (
          <TextField key={f.key} label={f.label} type={f.type || 'text'} value={data[f.key]} onChange={set(f.key)} suffix={f.suffix} placeholder={f.placeholder} />
        ))}
      </div>
      {multiline.map(f => (
        <label key={f.key} style={{ display: 'block' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>{f.label}</div>
          <textarea
            value={data[f.key]} onChange={(e) => set(f.key)(e.target.value)} rows={3} placeholder={f.placeholder}
            style={{
              width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
              borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 17.5,
              outline: 'none', resize: 'vertical'
            }}
          />
        </label>
      ))}
      {section.hasAttachments && <MultiPhotoPicker photos={data.attachments} onChange={set('attachments')} />}
      <FormActions onCancel={onCancel} onSave={() => onSave(data)} saveLabel="Save" />
    </div>
  );
}
