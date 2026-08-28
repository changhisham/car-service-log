import React from 'react';
import { Search } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { SERVICE_TYPES } from '../../constants/serviceTypes';

export function ServiceFilters({ records, filters, setFilters }) {
  const years = [...new Set(records.map(r => r.date.slice(0, 4)))].sort().reverse();

  const toggleCategory = (key) => {
    setFilters(f => ({ ...f, category: f.category === key ? null : key }));
  };

  return (
    <div style={{ margin: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} color={COLORS.steelDim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search notes, workshop…"
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.panel, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '9px 12px 9px 34px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 16, outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <button onClick={() => setFilters(f => ({ ...f, category: null }))} style={{
          flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: `1px solid ${!filters.category ? COLORS.blue : COLORS.line}`,
          background: !filters.category ? COLORS.blueDim : 'transparent', color: !filters.category ? COLORS.blue : COLORS.steel,
          fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
        }}>All</button>
        {SERVICE_TYPES.map(t => (
          <button key={t.key} onClick={() => toggleCategory(t.key)} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: `1px solid ${filters.category === t.key ? COLORS.blue : COLORS.line}`,
            background: filters.category === t.key ? COLORS.blueDim : 'transparent', color: filters.category === t.key ? COLORS.blue : COLORS.steel,
            fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{t.label}</button>
        ))}
      </div>

      {years.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button onClick={() => setFilters(f => ({ ...f, year: null }))} style={{
            flexShrink: 0, padding: '5px 11px', borderRadius: 8, border: `1px solid ${!filters.year ? COLORS.steel : COLORS.line}`,
            background: 'transparent', color: !filters.year ? COLORS.paper : COLORS.steelDim,
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, cursor: 'pointer'
          }}>All years</button>
          {years.map(y => (
            <button key={y} onClick={() => setFilters(f => ({ ...f, year: f.year === y ? null : y }))} style={{
              flexShrink: 0, padding: '5px 11px', borderRadius: 8, border: `1px solid ${filters.year === y ? COLORS.steel : COLORS.line}`,
              background: 'transparent', color: filters.year === y ? COLORS.paper : COLORS.steelDim,
              fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, cursor: 'pointer'
            }}>{y}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function filterRecords(records, filters) {
  return records.filter(r => {
    if (filters.category && r.type !== filters.category) return false;
    if (filters.year && !r.date.startsWith(filters.year)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${r.notes || ''} ${r.workshopName || ''} ${r.workshopLocation || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
