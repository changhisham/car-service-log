import React from 'react';
import { CarFront, Plus, Bell, Settings, LogOut, CheckCircle2, Loader2, X } from 'lucide-react';
import { NAV_ITEMS, initialsFromEmail } from './Sidebar';
import { signOutUser } from '../../auth';

// Mobile-only counterpart to the desktop sidebar — same section list, same
// account row, so nothing is reachable on desktop but not on mobile. The
// bottom nav bar stays slim (4 most-used screens); this covers the rest.
export function MobileMenuDrawer({ open, onClose, section, onSelect, vehicles, activeId, onVehicle, onAddVehicle, onSettings, onReminders, saveState, userEmail }) {
  if (!open) return null;
  const go = (fn) => { fn(); onClose(); };

  return (
    <div className="gl-mmenu-backdrop" onClick={onClose}>
      <aside className="gl-mmenu" onClick={e => e.stopPropagation()}>
        <div className="gl-mmenu-head">
          <div className="gl-brand"><img className="gl-brand-mark" src="/logo.png" alt="" /><div><b>GARAGE <em>LOG</em></b><small>Keep Your Drive in Check</small></div></div>
          <button className="gl-mmenu-close" onClick={onClose} aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className="gl-side-vehicle">
          <div className="gl-side-label">MY GARAGE</div>
          {vehicles.map(v => (
            <button key={v.id} className={`gl-side-car ${v.id === activeId ? 'active' : ''}`} onClick={() => go(() => onVehicle(v.id))}>
              <span><CarFront size={16}/>{v.plate}</span><small>{v.model || 'Vehicle'}</small>
            </button>
          ))}
          <button className="gl-side-add" onClick={() => go(onAddVehicle)}><Plus size={15}/> Add vehicle</button>
        </div>

        <nav>{NAV_ITEMS.map(([key, label, Icon]) => (
          <button key={key} className={section === key ? 'active' : ''} onClick={() => go(() => onSelect(key))}><Icon size={18}/><span>{label}</span></button>
        ))}</nav>

        <div className="gl-side-bottom">
          <button onClick={() => go(onReminders)}><Bell size={17}/> Reminders</button>
          <button className={section === 'settings' ? 'active' : ''} onClick={() => go(onSettings)}><Settings size={17}/> Settings</button>
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
        </div>
      </aside>
    </div>
  );
}
