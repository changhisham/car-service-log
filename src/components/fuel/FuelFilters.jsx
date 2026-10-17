import React from 'react';
import { Search } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_MONO } from '../../styles/theme';

const TANK_TYPES = [['full', 'Full tank'], ['partial', 'Partial']];

export function FuelFilters({ entries, filters, setFilters }) {
  const years = [...new Set(entries.map(f => f.date.slice(0, 4)))].sort().reverse();

  return (
    <div style={{ margin: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} color={COLORS.steelDim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search station…"
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.panel, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '9px 12px 9px 34px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 17.5, outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <button onClick={() => setFilters(f => ({ ...f, tankType: null }))} style={{
          flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: `1px solid ${!filters.tankType ? COLORS.blue : COLORS.line}`,
          background: !filters.tankType ? COLORS.blueDim : 'transparent', color: !filters.tankType ? COLORS.blue : COLORS.steel,
          fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
        }}>All</button>
        {TANK_TYPES.map(([key, label]) => (
          <button key={key} onClick={() => setFilters(f => ({ ...f, tankType: f.tankType === key ? null : key }))} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: `1px solid ${filters.tankType === key ? COLORS.blue : COLORS.line}`,
            background: filters.tankType === key ? COLORS.blueDim : 'transparent', color: filters.tankType === key ? COLORS.blue : COLORS.steel,
            fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{label}</button>
        ))}
      </div>

      {years.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button onClick={() => setFilters(f => ({ ...f, year: null }))} style={{
            flexShrink: 0, padding: '5px 11px', borderRadius: 8, border: `1px solid ${!filters.year ? COLORS.steel : COLORS.line}`,
            background: 'transparent', color: !filters.year ? COLORS.paper : COLORS.steelDim,
            fontFamily: FONT_MONO, fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
          }}>All years</button>
          {years.map(y => (
            <button key={y} onClick={() => setFilters(f => ({ ...f, year: f.year === y ? null : y }))} style={{
              flexShrink: 0, padding: '5px 11px', borderRadius: 8, border: `1px solid ${filters.year === y ? COLORS.steel : COLORS.line}`,
              background: 'transparent', color: filters.year === y ? COLORS.paper : COLORS.steelDim,
              fontFamily: FONT_MONO, fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
            }}>{y}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function filterFuelEntries(entries, filters) {
  return entries.filter(f => {
    if (filters.tankType === 'full' && !f.fullTank) return false;
    if (filters.tankType === 'partial' && f.fullTank) return false;
    if (filters.year && !f.date.startsWith(filters.year)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(f.station || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
