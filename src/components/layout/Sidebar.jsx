import React from 'react';
import { CarFront, Gauge, Wrench, Fuel, Receipt, History, BarChart3, Settings, Plus } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../styles/theme';

const ITEMS = [
  { key: 'overview', label: 'Overview', icon: Gauge },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'fuel', label: 'Fuel', icon: Fuel },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'history', label: 'History', icon: History },
  { key: 'insights', label: 'Insights', icon: BarChart3 },
];

export function Sidebar({ active, onSelect, vehicles, activeId, onVehicleSelect, onAddVehicle }) {
  return (
    <aside className="csl-sidebar">
      <div className="csl-brand">
        <div className="csl-brand-mark"><CarFront size={22} /></div>
        <div>
          <div className="csl-brand-title">GARAGE <span>LOG</span></div>
          <div className="csl-brand-sub">Keep your drive in check</div>
        </div>
      </div>

      <div className="csl-side-label">NAVIGATION</div>
      <nav className="csl-side-nav">
        {ITEMS.map(item => {
          const Icon = item.icon;
          const selected = active === item.key;
          return (
            <button key={item.key} className={`csl-side-item ${selected ? 'is-active' : ''}`} onClick={() => onSelect(item.key)}>
              <Icon size={18} /> <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="csl-sidebar-spacer" />
      <div className="csl-side-label">MY GARAGE</div>
      <div className="csl-garage-list">
        {vehicles.slice(0, 3).map(v => (
          <button key={v.id} className={`csl-garage-mini ${v.id === activeId ? 'is-active' : ''}`} onClick={() => onVehicleSelect(v.id)}>
            <div className="csl-garage-mini-icon"><CarFront size={16} /></div>
            <div className="csl-garage-mini-copy">
              <strong>{v.plate}</strong>
              <span>{v.brand} {v.model}</span>
            </div>
            {v.id === activeId && <span className="csl-garage-dot" />}
          </button>
        ))}
      </div>
      <button className="csl-add-vehicle-side" onClick={onAddVehicle}><Plus size={15} /> Add vehicle</button>
      <button className="csl-side-settings"><Settings size={17} /><span>Settings</span></button>
      <div className="csl-side-version">GARAGE LOG <span>v2</span></div>
    </aside>
  );
}
