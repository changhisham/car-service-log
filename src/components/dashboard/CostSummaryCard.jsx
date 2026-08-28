import React from 'react';
import { TrendingUp } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../styles/theme';
import { fmtRM } from '../../utils/format';

function TrendChart({ byMonth }) {
  const max = Math.max(1, ...byMonth.map(m => m.total));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, paddingTop: 8 }}>
      {byMonth.map(m => (
        <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div
            title={fmtRM(m.total)}
            style={{
              width: '100%', maxWidth: 28, borderRadius: '5px 5px 2px 2px',
              height: `${Math.max(3, (m.total / max) * 74)}px`,
              background: m.total > 0 ? COLORS.blue : COLORS.line,
            }}
          />
          <span style={{ fontSize: 10, color: COLORS.steelDim, fontFamily: FONT_MONO }}>{m.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CostSummaryCard({ costSummary, costView, setCostView }) {
  const rows = costView === 'category' ? costSummary.byCategory : costView === 'year' ? costSummary.byYear : null;
  return (
    <div className="csl-card" style={{ margin: '0 18px 16px', background: COLORS.panel, borderRadius: 18, border: `1px solid ${COLORS.line}`, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color={COLORS.blue} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Spend</span>
        </div>
        <div style={{ display: 'flex', gap: 4, background: COLORS.bg, borderRadius: 8, padding: 3 }}>
          {['category', 'year', 'trend'].map(v => (
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

      {costView === 'trend' ? (
        <TrendChart byMonth={costSummary.byMonth} />
      ) : rows.length === 0 ? (
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
                  <div style={{ height: '100%', width: `${(amt / max) * 100}%`, background: COLORS.blue, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
