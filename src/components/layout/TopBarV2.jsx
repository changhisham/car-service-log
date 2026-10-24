import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Plus, Menu, CarFront } from 'lucide-react';

// Mobile-only now: on desktop the sidebar carries the vehicle switcher,
// add-vehicle, sync status and account controls, so this bar is hidden
// entirely (see .gl-topbar{display:none} in index.css). Below the
// sidebar's breakpoint there's no left nav to hold those controls, so a
// slim version of them reappears here.
//
// The wordmark collapses to just an icon on the narrowest phones (see
// the max-width:390px rule) — the vehicle selector needs that room far
// more than the app restating its own name.
//
// Custom dropdown instead of a native <select>: mobile browsers render a
// native select's option list with OS-default styling that can't be
// themed, which looked out of place next to the rest of the app.
export function TopBarV2({ vehicles, activeId, onVehicle, onAddVehicle, onMenuOpen }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const active = vehicles.find(v => v.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return <header className="gl-topbar">
    <button className="gl-icon-top gl-menu-btn" onClick={onMenuOpen} aria-label="Open menu"><Menu size={20}/></button>
    <div className="gl-mobile-brand">
      <img className="gl-mobile-brand-mark" src="/logo.png" alt="" />
      <span className="gl-mobile-brand-text">GARAGE <em>LOG</em></span>
    </div>
    <div className="gl-top-select" ref={wrapRef}>
      <button className="gl-top-select-btn" onClick={() => setOpen(o => !o)} aria-label="Select vehicle">
        <span className="gl-car-icon">🚙</span>
        <span className="gl-top-select-label">{active ? `${active.plate} · ${active.model || 'Vehicle'}` : 'Select vehicle'}</span>
        <ChevronDown size={15} className={open ? 'open' : ''}/>
      </button>
      {open && (
        <div className="gl-top-select-menu">
          {vehicles.map(v => (
            <button key={v.id} className={`gl-top-select-item ${v.id === activeId ? 'active' : ''}`} onClick={() => { onVehicle(v.id); setOpen(false); }}>
              <CarFront size={14}/><span>{v.plate}</span><small>{v.model || 'Vehicle'}</small>
            </button>
          ))}
        </div>
      )}
    </div>
    <button className="gl-add-vehicle" onClick={onAddVehicle} aria-label="Add vehicle"><Plus size={16}/> Add vehicle</button>
    <div className="gl-top-spacer"/>
    <button className="gl-icon-top" aria-label="Notifications"><Bell size={18}/><i/></button>
  </header>;
}
