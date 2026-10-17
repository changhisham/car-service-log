import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { fmtKm } from '../../utils/format';
import { fmtDate } from '../../utils/date';

// Combines top-level vehicle fields (already edited via Edit Vehicle) with
// the extra profile fields (trim/VIN/engine number/registration date) that
// only live here — shown together since they're all "vehicle profile" to
// the person reading this page, regardless of which form actually owns them.
export function VehicleInfoPanel({ active, onEdit }) {
  const profile = active.profile || {};
  const rows = [
    ['Make & Model', [active.brand, active.model].filter(Boolean).join(' ') || '—'],
    ['Variant / Trim', profile.trim],
    ['Model Year', active.year],
    ['Registration Date', profile.registrationDate ? fmtDate(profile.registrationDate) : null],
    ['Registration Number', active.plate],
    ['VIN / Chassis Number', profile.vin],
    ['Engine Number', profile.engineNumber],
    ['Current Mileage', `${fmtKm(active.odometer)} km`],
    ['Colour', active.color],
  ].filter(([, v]) => v);

  return (
    <div className="csl-card" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.greenDim, color: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BadgeCheck size={16} /></div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15.5, color: COLORS.paper }}>Vehicle Information</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.steelDim }}>Basic details about your vehicle</div>
          </div>
        </div>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: COLORS.blue, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', flexShrink: 0 }}>Edit</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: `1px solid ${COLORS.bg}` }}>
            <span style={{ fontSize: 13.5, color: COLORS.steelDim }}>{label}</span>
            <span style={{ fontSize: 13.5, color: COLORS.paper, fontWeight: 600, textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
