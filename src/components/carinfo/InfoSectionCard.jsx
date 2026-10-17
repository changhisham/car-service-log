import React from 'react';
import { COLORS, FONT_BODY } from '../../styles/theme';

const TONES = {
  green: { bg: COLORS.greenDim, fg: COLORS.green },
  amber: { bg: COLORS.amberDim, fg: COLORS.amber },
  red: { bg: COLORS.rustDim, fg: COLORS.rust },
};

export function InfoSectionCard({ section, data, onEdit }) {
  const t = TONES[section.tone] || TONES.green;
  const Icon = section.icon;
  const filled = section.fields.filter(f => data[f.key]);
  const attachments = section.hasAttachments ? (data.attachments || []) : [];
  const isEmpty = filled.length === 0 && attachments.length === 0;

  return (
    <div className="csl-card" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: t.bg, color: t.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}><Icon size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15.5, color: COLORS.paper }}>{section.title}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.steelDim }}>{section.description}</div>
          </div>
        </div>
        <button onClick={onEdit} style={{
          background: 'none', border: 'none', color: COLORS.blue, fontFamily: FONT_BODY,
          fontWeight: 700, fontSize: 13.5, cursor: 'pointer', flexShrink: 0
        }}>{isEmpty ? '+ Add details' : 'Edit'}</button>
      </div>

      {isEmpty ? (
        <div style={{ fontSize: 14, color: COLORS.steelDim, padding: '12px 2px 2px' }}>No details added yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginTop: 14 }}>
          {filled.map(f => (
            <div key={f.key} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: COLORS.steelDim }}>{f.label}</div>
              <div style={{
                fontSize: 14.5, color: COLORS.paper, fontWeight: 600, marginTop: 2,
                whiteSpace: f.multiline ? 'pre-wrap' : 'normal'
              }}>{data[f.key]}{f.suffix ? ` ${f.suffix}` : ''}</div>
            </div>
          ))}
          {attachments.length > 0 && (
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 12, color: COLORS.steelDim, marginBottom: 6 }}>Attachments ({attachments.length})</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {attachments.map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: `1px solid ${COLORS.line}` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
