import React from 'react';
import { Gauge, Wrench, Fuel, Receipt, MoreHorizontal } from 'lucide-react';

const ITEMS = [
  ['overview', 'Overview', Gauge],
  ['logbook', 'Maintenance', Wrench],
  ['fuel', 'Fuel', Fuel],
  ['expenses', 'Expenses', Receipt],
  ['more', 'More', MoreHorizontal],
];

export function MobileBottomNavV2({ section, onSelect }) {
  const renderItem = ([k, l, I]) => <button key={k} className={section === k ? 'active' : ''} onClick={() => onSelect(k)}><I size={20} /><span>{l}</span></button>;
  return <div className="gl-mobile-nav">
    {ITEMS.map(renderItem)}
  </div>;
}
