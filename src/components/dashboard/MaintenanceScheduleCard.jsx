import React from 'react';
import { Settings2 } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { calculateSchedule } from '../../domain/maintenanceSchedule';
import { fmtKm } from '../../utils/format';
import { fmtDate } from '../../utils/date';

function dotColor(item) {
  if (!item.known) return COLORS.steelDim;
  if (item.overdue) return COLORS.rust;
  if (item.soon) return COLORS.amber;
  return COLORS.green;
}

export function MaintenanceScheduleCard({ vehicle, onManage }) {
  const items = calculateSchedule(vehicle);
  if (items.length === 0) return null;

  return (
    <div style={{ margin: '0 18px 16px', background: COLORS.panel, borderRadius: 18, border: `1px solid ${COLORS.line}`, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings2 size={16} color={COLORS.amber} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Maintenance schedule</span>
        </div>
        <button onClick={onManage} style={{
          background: 'none', border: 'none', color: COLORS.amber, fontFamily: FONT_BODY,
          fontWeight: 700, fontSize: 12, cursor: 'pointer'
        }}>Manage</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor(item), flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: COLORS.steel, textAlign: 'right', flexShrink: 0 }}>
              {!item.known
                ? 'not set'
                : item.overdue
                  ? 'due now'
                  : `${fmtKm(Math.max(0, item.kmLeft))} km · ${fmtDate(item.dueDate)}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
