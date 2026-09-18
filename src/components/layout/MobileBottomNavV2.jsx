import React from 'react';
import { Gauge, Wrench, Fuel, Receipt, MoreHorizontal, Plus } from 'lucide-react';
// The FAB sits BETWEEN Maintenance and Fuel in the button order (not
// appended after everything) and takes its own flex slot rather than
// being absolutely centered — otherwise it lands exactly on top of
// whichever nav button happens to be in the middle, covering its tap
// target instead of floating in a gap next to it.
export function MobileBottomNavV2({ section, onSelect, onAdd }) {
  const left = [['overview', 'Overview', Gauge], ['logbook', 'Maintenance', Wrench]];
  const right = [['fuel', 'Fuel', Fuel], ['expenses', 'Expenses', Receipt], ['more', 'More', MoreHorizontal]];
  const renderItem = ([k, l, I]) => <button key={k} className={section === k ? 'active' : ''} onClick={() => onSelect(k)}><I size={18} /><span>{l}</span></button>;
  return <div className="gl-mobile-nav">
    {left.map(renderItem)}
    <button className="gl-mobile-fab" onClick={onAdd} aria-label="Quick add"><Plus size={22} /></button>
    {right.map(renderItem)}
  </div>;
}
