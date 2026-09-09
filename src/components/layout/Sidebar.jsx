import React from 'react';
import { CarFront, Gauge, Wrench, Fuel, Receipt, History, ChartNoAxesColumnIncreasing, Settings, Plus, Bell } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY } from '../../styles/theme';

const items = [
  ['overview','Overview',Gauge], ['logbook','Maintenance',Wrench], ['fuel','Fuel',Fuel], ['expenses','Expenses',Receipt], ['history','History',History], ['insights','Insights',ChartNoAxesColumnIncreasing]
];
export function Sidebar({ active, section, onSelect, vehicles, activeId, onVehicle, onAddVehicle }) {
  return <aside className="gl-sidebar">
    <div className="gl-brand"><span className="gl-brand-mark"><CarFront size={21}/></span><div><b>GARAGE <em>LOG</em></b><small>Keep Your Drive in Check</small></div></div>
    <div className="gl-side-vehicle"><div className="gl-side-label">MY GARAGE</div>{vehicles.map(v=><button key={v.id} className={`gl-side-car ${v.id===activeId?'active':''}`} onClick={()=>onVehicle(v.id)}><span><CarFront size={16}/>{v.plate}</span><small>{v.model || 'Vehicle'}</small></button>)}<button className="gl-side-add" onClick={onAddVehicle}><Plus size={15}/> Add vehicle</button></div>
    <nav>{items.map(([key,label,Icon])=><button key={key} className={section===key?'active':''} onClick={()=>onSelect(key)}><Icon size={18}/><span>{label}</span></button>)}</nav>
    <div className="gl-side-bottom"><button><Bell size={17}/> Reminders</button><button><Settings size={17}/> Settings</button></div>
  </aside>;
}
