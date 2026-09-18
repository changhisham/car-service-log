import React from 'react';
import { Bell, ChevronDown, Plus, CarFront } from 'lucide-react';

// Mobile-only now: on desktop the sidebar carries the vehicle switcher,
// add-vehicle, sync status and account controls, so this bar is hidden
// entirely (see .gl-topbar{display:none} in index.css). Below the
// sidebar's breakpoint there's no left nav to hold those controls, so a
// slim version of them reappears here.
//
// The wordmark collapses to just an icon on the narrowest phones (see
// the max-width:390px rule) — the vehicle selector needs that room far
// more than the app restating its own name.
export function TopBarV2({ vehicles, activeId, onVehicle, onAddVehicle }) {
  return <header className="gl-topbar">
    <div className="gl-mobile-brand">
      <span className="gl-mobile-brand-mark"><CarFront size={14}/></span>
      <span className="gl-mobile-brand-text">GARAGE <em>LOG</em></span>
    </div>
    <label className="gl-top-select"><span className="gl-car-icon">🚙</span><select value={activeId || ''} onChange={e=>onVehicle(e.target.value)} aria-label="Select vehicle">{vehicles.map(v=><option key={v.id} value={v.id}>{v.plate} · {v.model || 'Vehicle'}</option>)}</select><ChevronDown size={15}/></label>
    <button className="gl-add-vehicle" onClick={onAddVehicle} aria-label="Add vehicle"><Plus size={16}/> Add vehicle</button>
    <div className="gl-top-spacer"/>
    <button className="gl-icon-top" aria-label="Notifications"><Bell size={18}/><i/></button>
  </header>;
}
