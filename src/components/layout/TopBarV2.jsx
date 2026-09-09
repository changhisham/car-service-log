import React from 'react';
import { Bell, ChevronDown, LogOut, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { signOutUser } from '../../auth';
export function TopBarV2({ active, vehicles, activeId, onVehicle, onAddVehicle, saveState, userEmail }) {
  return <header className="gl-topbar">
    <div className="gl-mobile-brand"><span>GARAGE <em>LOG</em></span></div>
    <label className="gl-top-select"><span className="gl-car-icon">🚙</span><select value={activeId || ''} onChange={e=>onVehicle(e.target.value)} aria-label="Select vehicle">{vehicles.map(v=><option key={v.id} value={v.id}>{v.plate} · {v.model || 'Vehicle'}</option>)}</select><ChevronDown size={15}/></label>
    <button className="gl-add-vehicle" onClick={onAddVehicle}><Plus size={16}/> Add vehicle</button>
    <div className="gl-top-spacer"/>
    <div className="gl-sync">{saveState==='saving'?<>SYNCING <Loader2 size={12} className="csl-spin"/></>:saveState==='error'?<>SYNC FAILED</>:<>SYNCED <CheckCircle2 size={13}/></>}</div>
    <button className="gl-icon-top"><Bell size={18}/><i/></button>
    <button className="gl-user" title={userEmail || 'Account'}><span>SMH</span></button>
    <button className="gl-signout" onClick={()=>signOutUser()}><LogOut size={15}/></button>
  </header>;
}
