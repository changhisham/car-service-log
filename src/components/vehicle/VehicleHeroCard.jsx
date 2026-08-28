import React from 'react';
import { Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { fmtKm } from '../../utils/format';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';
import { ServiceReminderCard } from '../dashboard/ServiceReminderCard';

export function VehicleHeroCard({ active, reminder, ringColor, roadTax, insurance, onEdit, onDelete }) {
  return (
    <div className="csl-card" style={{ margin: '0 18px 16px', background: COLORS.panel, borderRadius: 18, border: `1px solid ${COLORS.line}`, overflow: 'hidden' }}>
      <div style={{
        padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14,
        background: active.photo ? `linear-gradient(135deg, rgba(21,23,26,0.55), rgba(21,23,26,0.85)), url(${active.photo}) center/cover` : `linear-gradient(135deg, #23361F, #182417)`
      }}>
        <div style={{
          background: COLORS.plate, color: '#1A1A1A', fontFamily: FONT_MONO, fontWeight: 700,
          fontSize: 17, letterSpacing: 2, padding: '7px 14px', borderRadius: 6, border: '2px solid #1A1A1A'
        }}>{active.plate}</div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <IconButton icon={Pencil} onClick={onEdit} />
          <IconButton icon={Trash2} tone="danger" onClick={onDelete} />
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: COLORS.blue, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {active.brand || '—'}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 21, textTransform: 'uppercase', marginTop: 1 }}>{active.model}</div>
            <div style={{ fontSize: 12.5, color: COLORS.steel, marginTop: 2 }}>
              {active.year ? `${active.year} · ` : ''}{active.color || '—'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>{fmtKm(active.odometer)}</div>
            <div style={{ fontSize: 10.5, color: COLORS.steelDim }}>km on the clock</div>
          </div>
        </div>

        <ServiceReminderCard reminder={reminder} ringColor={ringColor} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone={roadTax.tone} icon={ShieldCheck}>Road tax: {roadTax.text}</Badge>
          <Badge tone={insurance.tone} icon={ShieldCheck}>Insurance: {insurance.text}</Badge>
        </div>
      </div>
    </div>
  );
}
