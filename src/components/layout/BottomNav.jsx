import React, { useState, useRef, useEffect } from 'react';
import { Gauge, Wrench, Fuel as FuelIcon, Receipt, Plus, ClipboardList, BarChart3 } from 'lucide-react';
import { COLORS, FONT_BODY, ACCENT_GRADIENT } from '../../styles/theme';

const LEFT_ITEMS = [
  { key: 'overview', label: 'Overview', icon: Gauge },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
];
const RIGHT_ITEMS = [
  { key: 'fuel', label: 'Fuel', icon: FuelIcon },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
];

function NavButton({ item, active, onSelect }) {
  const Icon = item.icon;
  return <button onClick={() => onSelect(item.key)} style={{ flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', padding:'6px 0 4px', cursor:'pointer', color: active ? COLORS.blue : COLORS.steelDim }}><Icon size={19} strokeWidth={2.2}/><span style={{fontSize:9.5,fontWeight:700,fontFamily:FONT_BODY}}>{item.label}</span></button>;
}

export function BottomNav({ active, onSelect, onAddService, onAddFuel, onAddExpense, onOpenHistory, onOpenInsights }) {
  const [fabOpen, setFabOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!fabOpen) return;
    const close = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setFabOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [fabOpen]);
  const actions = [
    {label:'Add service', icon:Wrench, onClick:onAddService}, {label:'Add fuel', icon:FuelIcon, onClick:onAddFuel}, {label:'Add expense', icon:Receipt, onClick:onAddExpense},
    {label:'History', icon:ClipboardList, onClick:onOpenHistory}, {label:'Insights', icon:BarChart3, onClick:onOpenInsights},
  ];
  return <div className="csl-bottom-nav" ref={wrapRef}>
    {fabOpen && <div className="csl-fab-menu">{actions.map((a,i)=>{const I=a.icon;return <button key={a.label} onClick={()=>{a.onClick();setFabOpen(false)}}><span><I size={15}/></span>{a.label}</button>})}</div>}
    <div className="csl-bottom-inner">{LEFT_ITEMS.map(i=><NavButton key={i.key} item={i} active={active===i.key} onSelect={onSelect}/>)}<button className="csl-fab" onClick={()=>setFabOpen(v=>!v)} aria-label="Quick add"><Plus size={25} style={{transform:fabOpen?'rotate(45deg)':'none'}}/></button>{RIGHT_ITEMS.map(i=><NavButton key={i.key} item={i} active={active===i.key} onSelect={onSelect}/>)}</div>
  </div>;
}
