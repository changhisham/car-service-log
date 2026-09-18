import React from 'react';
import { CarFront, Gauge, Wrench, Fuel, Receipt, History, BarChart3, Settings, Plus, Bell, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import { signOutUser } from '../../auth';

const items = [
  ['overview','Overview',Gauge], ['logbook','Maintenance',Wrench], ['fuel','Fuel',Fuel], ['expenses','Expenses',Receipt], ['history','History',History], ['insights','Insights',BarChart3]
];

// Same initials helper as the old top bar's account avatar — kept here
// now that the account row lives in the sidebar instead.
function initialsFromEmail(email) {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  const chars = parts.length > 1 ? [parts[0][0], parts[1][0]] : [name[0], name[1] || ''];
  return chars.join('').toUpperCase();
}

export function Sidebar({ section, onSelect, vehicles, activeId, onVehicle, onAddVehicle, onSettings, onReminders, saveState, userEmail }) {
  return <aside className="gl-sidebar">
    <div className="gl-brand"><span className="gl-brand-mark"><CarFront size={21}/></span><div><b>GARAGE <em>LOG</em></b><small>Keep Your Drive in Check</small></div></div>
    <div className="gl-side-vehicle"><div className="gl-side-label">MY GARAGE</div>{vehicles.map(v=><button key={v.id} className={`gl-side-car ${v.id===activeId?'active':''}`} onClick={()=>onVehicle(v.id)}><span><CarFront size={16}/>{v.plate}</span><small>{v.model || 'Vehicle'}</small></button>)}<button className="gl-side-add" onClick={onAddVehicle}><Plus size={15}/> Add vehicle</button></div>
    <nav>{items.map(([key,label,Icon])=><button key={key} className={section===key?'active':''} onClick={()=>onSelect(key)}><Icon size={18}/><span>{label}</span></button>)}</nav>
    <div className="gl-side-bottom">
      <button onClick={onReminders}><Bell size={17}/> Reminders</button>
      <button className={section==='settings'?'active':''} onClick={onSettings}><Settings size={17}/> Settings</button>
      <div className="gl-side-account">
        <div className="gl-side-avatar">{initialsFromEmail(userEmail)}</div>
        <div className="gl-side-account-info">
          <div className="gl-side-account-email" title={userEmail || 'Account'}>{userEmail || 'Account'}</div>
          <div className={`gl-side-sync ${saveState === 'error' ? 'error' : ''}`}>
            {saveState === 'saving' ? <><Loader2 size={10} className="csl-spin"/> Syncing</> : saveState === 'error' ? <>Sync failed</> : <><CheckCircle2 size={10}/> Synced</>}
          </div>
        </div>
        <button className="gl-side-icon-btn" onClick={() => signOutUser()} title="Sign out"><LogOut size={15}/></button>
      </div>
      <div className="gl-side-version">Garage Log v2.1.0 · © 2026</div>
    </div>
  </aside>;
}
