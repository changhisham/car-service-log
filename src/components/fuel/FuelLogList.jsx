import React from 'react';
import { Plus, Pencil, Trash2, Fuel, Gauge } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate } from '../../utils/date';
import { IconButton } from '../common/IconButton';
import { SwipeToDelete } from '../common/SwipeToDelete';
import { Sparkline } from '../dashboard/Sparkline';
import { calculateFuelStats } from '../../domain/fuel';

export function FuelLogList({ vehicle, onAdd, onEdit, onDelete }) {
  const stats = calculateFuelStats(vehicle);
  const sparkValues = stats.segments.map(s => s.kmPerL);

  return (
    <div style={{ margin: '0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fuel</span>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          color: COLORS.blue, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer'
        }}>
          <Plus size={14} /> Add fill-up
        </button>
      </div>

      {stats.entries.length > 0 && (
        <div className="csl-card" style={{
          marginBottom: 16, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: sparkValues.length >= 2 ? 14 : 0 }}>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>
                {stats.avgKmPerL ? stats.avgKmPerL.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 10.5, color: COLORS.steelDim }}>avg km/L</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>
                {stats.avgLPer100km ? stats.avgLPer100km.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 10.5, color: COLORS.steelDim }}>avg L/100km</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 600 }}>{fmtRM(stats.totalSpent)}</div>
              <div style={{ fontSize: 10.5, color: COLORS.steelDim }}>total fuel spend</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 600 }}>
                {stats.avgCostPerKm ? `RM ${stats.avgCostPerKm.toFixed(2)}` : '—'}
              </div>
              <div style={{ fontSize: 10.5, color: COLORS.steelDim }}>avg cost/km</div>
            </div>
          </div>
          {sparkValues.length >= 2 && (
            <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
              <div style={{ fontSize: 10.5, color: COLORS.steelDim, marginBottom: 6 }}>km/L trend</div>
              <Sparkline values={sparkValues} width={260} height={40} color={COLORS.blue} />
            </div>
          )}
        </div>
      )}

      {stats.entries.length === 0 ? (
        <div style={{
          padding: '32px 16px', textAlign: 'center', border: `1px dashed ${COLORS.line}`, borderRadius: 14, color: COLORS.steelDim
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: COLORS.panel2, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
          }}>
            <Gauge size={20} color={COLORS.steelDim} />
          </div>
          <div style={{ fontSize: 12.5 }}>No fill-ups logged yet. Add one to start tracking fuel economy.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stats.entries.slice().reverse().map((f) => (
            <SwipeToDelete key={f.id} onDelete={() => onDelete(f.id)}>
              <div className="csl-card" style={{
                background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14,
                display: 'flex', gap: 12, alignItems: 'center'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: COLORS.panel2, border: `1px solid ${COLORS.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: COLORS.blue
                }}>
                  <Fuel size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    {f.litres.toFixed(1)} L {f.fullTank ? '· full tank' : '· partial'}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.steel, fontFamily: FONT_MONO }}>
                    {fmtDate(f.date)} · {fmtKm(f.odometer)} km {f.station ? `· ${f.station}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 15 }}>{fmtRM(f.totalCost)}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <IconButton icon={Pencil} size={26} onClick={() => onEdit(f)} title="Edit fill-up" />
                    <IconButton icon={Trash2} size={26} tone="danger" onClick={() => onDelete(f.id)} title="Delete fill-up" />
                  </div>
                </div>
              </div>
            </SwipeToDelete>
          ))}
        </div>
      )}
    </div>
  );
}
