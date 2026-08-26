import React from 'react';
import { TrendingUp } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../styles/theme';
import { fmtRM } from '../../utils/format';

export function CostSummaryCard({ costSummary, costView, setCostView }) {
  const rows = costView === 'category' ? costSummary.byCategory : costSummary.byYear;
  return (
    <div style={{ margin: '0 18px 16px', background: COLORS.panel, borderRadius: 18, border: `1px solid ${COLORS.line}`, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color={COLORS.amber} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Spend</span>
        </div>
        <div style={{ display: 'flex', gap: 4, background: COLORS.bg, borderRadius: 8, padding: 3 }}>
          {['category', 'year'].map(v => (
            <button key={v} onClick={() => setCostView(v)} style={{
              padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: costView === v ? COLORS.panel2 : 'transparent',
              color: costView === v ? COLORS.paper : COLORS.steelDim,
              fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize'
            }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 600, marginBottom: 14 }}>{fmtRM(costSummary.total)}
        <span style={{ fontSize: 11, color: COLORS.steelDim, fontFamily: FONT_BODY, marginLeft: 8 }}>all-time</span>
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12.5, color: COLORS.steelDim }}>No service records yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(([label, amt]) => {
            const max = Math.max(...rows.map(x => x[1]));
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: COLORS.steel }}>{label}</span>
                  <span style={{ fontFamily: FONT_MONO, color: COLORS.paper }}>{fmtRM(amt)}</span>
                </div>
                <div style={{ height: 6, background: COLORS.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(amt / max) * 100}%`, background: COLORS.amber, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
