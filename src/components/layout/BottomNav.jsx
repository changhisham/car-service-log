import React, { useState, useRef, useEffect } from 'react';
import { Gauge, ClipboardList, Fuel as FuelIcon, Receipt, Plus, Wrench } from 'lucide-react';
import { COLORS, FONT_BODY, ACCENT_GRADIENT } from '../../styles/theme';

const LEFT_ITEMS = [
  { key: 'overview', label: 'Overview', icon: Gauge },
  { key: 'logbook', label: 'Logbook', icon: ClipboardList },
];
const RIGHT_ITEMS = [
  { key: 'fuel', label: 'Fuel', icon: FuelIcon },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
];

function NavButton({ item, active, onSelect }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onSelect(item.key)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        background: 'none', border: 'none', padding: '6px 0 4px', cursor: 'pointer',
        color: active ? COLORS.blue : COLORS.steelDim
      }}
    >
      <Icon size={20} strokeWidth={2.2} style={active ? { filter: `drop-shadow(0 0 5px ${COLORS.blue})` } : undefined} />
      <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: FONT_BODY }}>{item.label}</span>
    </button>
  );
}

export function BottomNav({ active, onSelect, onAddService, onAddFuel, onAddExpense }) {
  const [fabOpen, setFabOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close the quick-add menu on any tap/click outside it — standard
  // popover behavior, not tied to any specific option.
  useEffect(() => {
    if (!fabOpen) return;
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFabOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [fabOpen]);

  const quickAddActions = [
    { key: 'service', label: 'Add service', icon: Wrench, onClick: onAddService },
    { key: 'fuel', label: 'Add fill-up', icon: FuelIcon, onClick: onAddFuel },
    { key: 'expense', label: 'Add expense', icon: Receipt, onClick: onAddExpense },
  ];

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900,
      background: '#0F1220', borderTop: `1px solid ${COLORS.line}`,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      {fabOpen && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center'
        }}>
          {quickAddActions.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => { opt.onClick(); setFabOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: COLORS.panel,
                  border: `1px solid ${COLORS.line}`, borderRadius: 999, padding: '8px 16px 8px 8px',
                  color: COLORS.paper, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 12.5,
                  whiteSpace: 'nowrap', boxShadow: '0 6px 18px rgba(0,0,0,0.4)', cursor: 'pointer'
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', background: COLORS.blueDim,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.blue, flexShrink: 0
                }}><Icon size={14} /></span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <div ref={wrapRef} style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 6px', position: 'relative' }}>
        {LEFT_ITEMS.map(item => <NavButton key={item.key} item={item} active={active === item.key} onSelect={onSelect} />)}

        <div style={{ flex: '0 0 64px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setFabOpen(o => !o)}
            aria-label="Quick add"
            aria-expanded={fabOpen}
            style={{
              width: 52, height: 52, borderRadius: '50%', marginTop: -26,
              background: ACCENT_GRADIENT, border: '3px solid #0A0D18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,240,255,0.45), 0 0 20px rgba(255,46,154,0.3), 0 6px 16px rgba(0,0,0,0.4)',
              cursor: 'pointer', transition: 'transform 0.2s ease',
              transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)'
            }}
          >
            <Plus size={26} color="#0A0D18" strokeWidth={2.5} />
          </button>
        </div>

        {RIGHT_ITEMS.map(item => <NavButton key={item.key} item={item} active={active === item.key} onSelect={onSelect} />)}
      </div>
    </div>
  );
}
