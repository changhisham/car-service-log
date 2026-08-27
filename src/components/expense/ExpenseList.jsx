import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { fmtRM } from '../../utils/format';
import { fmtDate } from '../../utils/date';
import { IconButton } from '../common/IconButton';
import { expenseCategoryMeta } from '../../constants/expenseCategories';

export function ExpenseList({ expenses, onAdd, onEdit, onDelete }) {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  return (
    <div style={{ margin: '0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Other expenses</span>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          color: COLORS.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer'
        }}>
          <Plus size={14} /> Add expense
        </button>
      </div>

      {expenses.length > 0 && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, marginBottom: 14 }}>
          {fmtRM(total)}
          <span style={{ fontSize: 11, color: COLORS.steelDim, fontFamily: FONT_BODY, marginLeft: 8 }}>total</span>
        </div>
      )}

      {expenses.length === 0 ? (
        <div style={{
          padding: '28px 16px', textAlign: 'center', border: `1px dashed ${COLORS.line}`, borderRadius: 14, color: COLORS.steelDim, fontSize: 12.5
        }}>Nothing logged yet — parking, tolls, road tax, insurance, anything that isn't a service.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {expenses.map((e) => {
            const meta = expenseCategoryMeta(e.category);
            const Icon = meta.icon;
            return (
              <div key={e.id} style={{
                background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14,
                display: 'flex', gap: 12, alignItems: 'center'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: COLORS.panel2, border: `1px solid ${COLORS.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: COLORS.amber
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{meta.label}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.steel, fontFamily: FONT_MONO }}>{fmtDate(e.date)}</div>
                  {e.description && <div style={{ fontSize: 12, color: COLORS.steelDim, marginTop: 3 }}>{e.description}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 15 }}>{fmtRM(e.amount)}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <IconButton icon={Pencil} size={26} onClick={() => onEdit(e)} title="Edit expense" />
                    <IconButton icon={Trash2} size={26} tone="danger" onClick={() => onDelete(e.id)} title="Delete expense" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
