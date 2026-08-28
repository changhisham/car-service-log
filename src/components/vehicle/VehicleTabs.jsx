import React from 'react';
import { Car, Plus } from 'lucide-react';
import { COLORS, FONT_MONO, FONT_BODY } from '../../styles/theme';

export function VehicleTabs({ vehicles, activeId, onSelect, onAdd }) {
  return (
    <div className="csl-tab" style={{
      display: 'flex', gap: 8, padding: '14px 18px', overflowX: 'auto', scrollbarWidth: 'none'
    }}>
      {vehicles.map(v => (
        <button key={v.id} onClick={() => onSelect(v.id)} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
          borderRadius: 10, border: `1px solid ${v.id === activeId ? COLORS.blue : COLORS.line}`,
          background: v.id === activeId ? COLORS.blueDim : COLORS.panel,
          color: v.id === activeId ? COLORS.blue : COLORS.steel, cursor: 'pointer',
          fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5
        }}>
          <Car size={13} /> {v.plate}
        </button>
      ))}
      <button onClick={onAdd} style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderRadius: 10, border: `1px dashed ${COLORS.line}`, background: 'transparent',
        color: COLORS.steel, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 600
      }}>
        <Plus size={14} /> Add vehicle
      </button>
    </div>
  );
}
