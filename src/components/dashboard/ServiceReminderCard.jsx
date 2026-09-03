import React from 'react';
import { Bell, Gauge } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { DueRing } from './DueRing';
import { fmtKm } from '../../utils/format';
import { fmtDate } from '../../utils/date';

export function ServiceReminderCard({ reminder, ringColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: COLORS.panel2,
      borderRadius: 14, marginBottom: 14
    }}>
      {reminder.known ? (
        <>
          <DueRing
            pct={reminder.pct} color={ringColor}
            label={reminder.overdue ? 'DUE' : reminder.byKm ? fmtKm(Math.max(0, reminder.kmLeft)) : `${Math.max(0, reminder.daysLeft)}d`}
            sub={reminder.overdue ? 'now' : reminder.byKm ? 'km left' : 'left'}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Bell size={13} color={ringColor} style={{ filter: `drop-shadow(0 0 4px ${ringColor})` }} />
              <span style={{
                fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, color: ringColor,
                textShadow: `0 0 10px ${ringColor}80`
              }}>
                {reminder.overdue ? 'Service overdue' : reminder.soon ? 'Service due soon' : 'Service on track'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.steel, lineHeight: 1.5 }}>
              Due by <b style={{ color: COLORS.paper }}>{fmtKm(reminder.dueOdo)} km</b> or <b style={{ color: COLORS.paper }}>{fmtDate(reminder.dueDate)}</b>, whichever comes first.
              {!reminder.fromRecord && <span style={{ color: COLORS.steelDim }}> Based on the last-service info you entered — add a service record to keep this accurate.</span>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: 92, height: 92, borderRadius: '50%', border: `2px dashed ${COLORS.line}`, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Gauge size={26} color={COLORS.steelDim} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Bell size={13} color={COLORS.steel} />
              <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, color: COLORS.steel }}>
                Service status unknown
              </span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.steel, lineHeight: 1.5 }}>
              No last-service info yet, so the next-service date can't be worked out. Log a service record, or edit this vehicle to fill in when it was last serviced.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
