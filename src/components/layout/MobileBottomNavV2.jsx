import React from 'react';
import { Gauge, Fuel, Receipt, Settings, LogOut } from 'lucide-react';

const ITEMS = [
  ['overview', 'Overview', Gauge],
  ['fuel', 'Fuel', Fuel],
  ['expenses', 'Expenses', Receipt],
  ['settings', 'Settings', Settings],
];

export function MobileBottomNavV2({ section, onSelect, onSignOut }) {
  const renderItem = ([k, l, I]) => <button key={k} className={section === k ? 'active' : ''} onClick={() => onSelect(k)}><I size={20} /><span>{l}</span></button>;
  return <div className="gl-mobile-nav">
    {ITEMS.map(renderItem)}
    <button onClick={onSignOut}><LogOut size={20} /><span>Sign out</span></button>
  </div>;
}
