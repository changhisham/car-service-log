import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { typeMeta } from '../../constants/serviceTypes';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate } from '../../utils/date';
import { IconButton } from '../common/IconButton';

export function ServiceTimeline({ records, onAdd, onEditRecord, onDeleteRecord }) {
  return (
    <div style={{ margin: '0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Logbook</span>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          color: COLORS.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer'
        }}>
          <Plus size={14} /> Add record
        </button>
      </div>

      {records.length === 0 ? (
        <div style={{
          padding: '28px 16px', textAlign: 'center', border: `1px dashed ${COLORS.line}`, borderRadius: 14, color: COLORS.steelDim, fontSize: 12.5
        }}>Nothing logged yet. Add the first service record.</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 17, top: 6, bottom: 6, width: 2, background: COLORS.line }} />
          {records.map((r) => {
            const meta = typeMeta(r.type);
            const Icon = meta.icon;
            return (
              <div key={r.id} style={{ display: 'flex', gap: 12, marginBottom: 12, position: 'relative' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: COLORS.panel2, border: `1px solid ${COLORS.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, color: COLORS.amber
                }}>
                  <Icon size={16} />
                </div>
                <div style={{
                  flex: 1, minWidth: 0, background: COLORS.panel, border: `1px solid ${COLORS.line}`,
                  borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{meta.label}</div>
                    <div style={{ fontSize: 11.5, color: COLORS.steel, fontFamily: FONT_MONO }}>
                      {fmtDate(r.date)} · {fmtKm(r.odometer)} km
                    </div>
                    {r.notes && <div style={{ fontSize: 12, color: COLORS.steelDim, marginTop: 5 }}>{r.notes}</div>}
                  </div>
                  {r.photo && <img src={r.photo} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 15 }}>{fmtRM(r.cost)}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      <IconButton icon={Pencil} size={26} onClick={() => onEditRecord(r)} />
                      <IconButton icon={Trash2} size={26} tone="danger" onClick={() => onDeleteRecord(r.id)} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
