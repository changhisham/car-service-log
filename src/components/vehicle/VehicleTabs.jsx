import React from 'react';
import { Car, Plus } from 'lucide-react';
import { COLORS, FONT_MONO, FONT_BODY } from '../../styles/theme';

export function VehicleTabs({ vehicles, activeId, onSelect, onAdd }) {
  return <div className="csl-vehicle-tabs">
    {vehicles.map(v => <button key={v.id} className={v.id===activeId?'is-active':''} onClick={()=>onSelect(v.id)}><Car size={14}/>{v.plate}</button>)}
    <button className="csl-vehicle-add" onClick={onAdd}><Plus size={14}/> Add vehicle</button>
  </div>;
}
