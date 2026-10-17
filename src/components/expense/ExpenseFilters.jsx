import React from 'react';
import { Search } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { EXPENSE_CATEGORIES } from '../../constants/expenseCategories';

export function ExpenseFilters({ expenses, filters, setFilters }) {
  const years = [...new Set(expenses.map(e => e.date.slice(0, 4)))].sort().reverse();
  const toggleCategory = (key) => setFilters(f => ({ ...f, category: f.category === key ? null : key }));

  return (
    <div style={{ margin: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} color={COLORS.steelDim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search description…"
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.panel, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '9px 12px 9px 34px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 17.5, outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <button onClick={() => setFilters(f => ({ ...f, category: null }))} style={{
          flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: `1px solid ${!filters.category ? COLORS.blue : COLORS.line}`,
          background: !filters.category ? COLORS.blueDim : 'transparent', color: !filters.category ? COLORS.blue : COLORS.steel,
          fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
        }}>All</button>
        {EXPENSE_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => toggleCategory(c.key)} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: `1px solid ${filters.category === c.key ? COLORS.blue : COLORS.line}`,
            background: filters.category === c.key ? COLORS.blueDim : 'transparent', color: filters.category === c.key ? COLORS.blue : COLORS.steel,
            fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{c.label}</button>
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

export function filterExpenses(expenses, filters) {
  return expenses.filter(e => {
    if (filters.category && e.category !== filters.category) return false;
    if (filters.year && !e.date.startsWith(filters.year)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(e.description || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
