import React from 'react';
import { Gauge, History, Settings, LogOut, Plus } from 'lucide-react';
// Two items either side of the FAB (not 2-and-3) so it lands exactly in
// the middle instead of just left of center. Maintenance/Fuel/Expenses
// aren't tabs here anymore — they're reachable from Overview's cards —
// so this bar stays a slim, permanent utility strip: Overview, History,
// quick-add, Settings, Sign out.
export function MobileBottomNavV2({ section, onSelect, onAdd, onSignOut }) {
  const left = [['overview', 'Overview', Gauge], ['history', 'History', History]];
  const right = [['settings', 'Settings', Settings]];
  const renderItem = ([k, l, I]) => <button key={k} className={section === k ? 'active' : ''} onClick={() => onSelect(k)}><I size={20} /><span>{l}</span></button>;
  return <div className="gl-mobile-nav">
    {left.map(renderItem)}
    <button className="gl-mobile-fab" onClick={onAdd} aria-label="Quick add"><Plus size={24} /></button>
    {right.map(renderItem)}
    <button onClick={onSignOut}><LogOut size={20} /><span>Sign out</span></button>
  </div>;
}
