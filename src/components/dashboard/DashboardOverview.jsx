import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileText, Fuel as FuelIcon, Receipt, Wrench, Plus, Gauge, TrendingUp } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../styles/theme';
import { calculateSchedule } from '../../domain/maintenanceSchedule';
import { calculateFuelStats } from '../../domain/fuel';
import { fmtDate } from '../../utils/date';
import { fmtKm, fmtRM } from '../../utils/format';
import { DueRing } from './DueRing';

function StatusIcon({ tone='neutral', children }) {
  return <div className={`csl-status-icon ${tone}`}>{children}</div>;
}

export function DashboardOverview({ vehicle, reminder, roadTax, insurance, costSummary, onManageSchedule, onAddService, onAddFuel, onAddExpense, onAddDocument, onEditVehicle, onSelect }) {
  const schedule = calculateSchedule(vehicle);
  const fuel = calculateFuelStats(vehicle);
  const allExpenses = (vehicle.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const serviceSpend = costSummary.total || 0;
  const totalSpend = serviceSpend + fuel.totalSpent + allExpenses;

  const recent = useMemo(() => {
    const records = (vehicle.records || []).map(r => ({ id: `s-${r.id}`, date: r.date, title: r.type === 'oil' ? 'Engine oil service' : r.type === 'brake' ? 'Brake service' : 'Service record', meta: `${fmtDate(r.date)} · ${fmtKm(r.odometer)} km`, amount: r.cost, icon: Wrench, tone: 'service' }));
    const fills = (vehicle.fuelLogs || []).map(f => ({ id: `f-${f.id}`, date: f.date, title: 'Fuel refill', meta: `${fmtDate(f.date)} · ${fmtKm(f.odometer)} km`, amount: f.totalCost, icon: FuelIcon, tone: 'fuel' }));
    const expenses = (vehicle.expenses || []).map(e => ({ id: `e-${e.id}`, date: e.date, title: e.description || 'Other expense', meta: fmtDate(e.date), amount: e.amount, icon: Receipt, tone: 'expense' }));
    return [...records, ...fills, ...expenses].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [vehicle]);

  const nextItems = [];
  if (roadTax?.tone === 'bad') nextItems.push({ key:'tax', tone:'bad', title:'Renew road tax', sub:`${roadTax.text}`, action:'Update', icon: AlertTriangle });
  else if (roadTax?.tone === 'warn') nextItems.push({ key:'tax', tone:'warn', title:'Road tax renewal', sub:roadTax.text, action:'Update', icon: Clock3 });
  if (insurance?.tone === 'bad') nextItems.push({ key:'insurance', tone:'bad', title:'Renew insurance', sub:`${insurance.text}`, action:'Update', icon: AlertTriangle });
  else if (insurance?.tone === 'warn') nextItems.push({ key:'insurance', tone:'warn', title:'Insurance renewal', sub:insurance.text, action:'Update', icon: Clock3 });
  if (reminder?.known) nextItems.push({ key:'service', tone: reminder.overdue ? 'bad' : reminder.soon ? 'warn' : 'ok', title: reminder.overdue ? 'Service overdue' : 'Engine oil service', sub: reminder.overdue ? 'Due now' : `Due in ${fmtKm(Math.max(0, reminder.kmLeft))} km · ${fmtDate(reminder.dueDate)}`, action:'View', icon: Wrench });
  schedule.filter(x => x.known && (x.overdue || x.soon)).slice(0, 2).forEach(item => nextItems.push({ key:item.id, tone:item.overdue?'bad':'warn', title:item.label, sub:item.overdue?'Due now':`${fmtKm(Math.max(0,item.kmLeft))} km remaining`, action:'View', icon: Wrench }));

  const health = Math.max(0, Math.min(100, 100 - (roadTax?.tone === 'bad' ? 10 : 0) - (insurance?.tone === 'bad' ? 10 : 0) - (schedule.filter(x => x.overdue).length * 8)));
  const ringColor = health >= 80 ? COLORS.green : health >= 60 ? COLORS.amber : COLORS.rust;

  return (
    <div className="csl-overview">
      <section className="csl-vehicle-hero-v2">
        <div className="csl-hero-image" style={vehicle.photo ? { backgroundImage: `linear-gradient(90deg, rgba(5,12,24,.15), rgba(5,12,24,.92)), url(${vehicle.photo})` } : undefined}>
          {!vehicle.photo && <div className="csl-car-placeholder"><CarFront size={96} strokeWidth={1} /></div>}
        </div>
        <div className="csl-hero-info">
          <div className="csl-kicker">{vehicle.brand || 'VEHICLE'}</div>
          <h1>{vehicle.model || 'Your vehicle'}</h1>
          <div className="csl-vehicle-meta">{vehicle.year ? `${vehicle.year} · ` : ''}{vehicle.color || 'Colour not set'}</div>
          <div className="csl-plate-chip"><CarFront size={15} /> {vehicle.plate}</div>
        </div>
        <div className="csl-hero-stats">
          <div className="csl-mileage-box"><Gauge size={22} /><div><span>TOTAL MILEAGE</span><strong>{fmtKm(vehicle.odometer)} <small>km</small></strong><em>On the clock</em></div></div>
          <div className="csl-hero-status-row">
            <div className="csl-service-status"><CheckCircle2 size={22}/><div><strong>{reminder?.overdue ? 'SERVICE OVERDUE' : 'SERVICE ON TRACK'}</strong><span>{reminder?.known ? `Next service: ${fmtKm(reminder.dueOdo)} km or ${fmtDate(reminder.dueDate)}` : 'Add a service record to calculate the next due date.'}</span></div></div>
            <div className={`csl-doc-alert ${roadTax?.tone === 'bad' ? 'bad' : ''}`}><AlertTriangle size={17}/><div><strong>Road tax: {roadTax?.text}</strong><span>{roadTax?.tone === 'bad' ? 'Action required' : 'Keep expiry date updated'}</span></div></div>
            <div className={`csl-doc-alert ${insurance?.tone === 'bad' ? 'bad' : ''}`}><AlertTriangle size={17}/><div><strong>Insurance: {insurance?.text}</strong><span>{insurance?.tone === 'bad' ? 'Action required' : 'Keep expiry date updated'}</span></div></div>
          </div>
        </div>
        <button className="csl-hero-edit" onClick={onEditVehicle} aria-label="Edit vehicle">✎</button>
      </section>

      <div className="csl-dashboard-grid">
        <div className="csl-main-column">
          <section className="csl-panel">
            <div className="csl-panel-head"><div><span className="csl-panel-kicker">PRIORITY</span><h2>Next up</h2></div><button onClick={() => onSelect('maintenance')}>View all <ArrowRight size={14}/></button></div>
            <div className="csl-next-list">
              {(nextItems.length ? nextItems.slice(0,4) : [{key:'none',tone:'ok',title:'Everything is on track',sub:'No urgent maintenance or document actions.',action:'',icon:CheckCircle2}]).map(item => {
                const Icon=item.icon;
                return <div className={`csl-next-item ${item.tone}`} key={item.key}><StatusIcon tone={item.tone}><Icon size={17}/></StatusIcon><div className="csl-next-copy"><strong>{item.title}</strong><span>{item.sub}</span></div>{item.action && <button>{item.action}</button>}</div>
              })}
            </div>
          </section>

          <section className="csl-panel">
            <div className="csl-panel-head"><div><span className="csl-panel-kicker">TRACKING</span><h2>Maintenance</h2></div><button onClick={onManageSchedule}>Manage <ArrowRight size={14}/></button></div>
            <div className="csl-maint-list">
              {schedule.map(item => {
                const pct = item.known ? Math.max(0, Math.min(1, 1 - item.kmLeft / Math.max(1,item.intervalKm))) : 0;
                const tone = !item.known ? 'neutral' : item.overdue ? 'bad' : item.soon ? 'warn' : 'ok';
                return <div className="csl-maint-row" key={item.id}><StatusIcon tone={tone}><Wrench size={16}/></StatusIcon><div className="csl-maint-copy"><strong>{item.label}</strong><div className="csl-progress"><span className={tone} style={{width: item.known ? `${Math.max(5,pct*100)}%` : '4%'}}/></div></div><div className="csl-maint-due">{item.known ? <><strong>{fmtKm(Math.max(0,item.kmLeft))} km</strong><span>{fmtDate(item.dueDate)}</span></> : <><strong>Not configured</strong><span className="csl-link">+ Add schedule</span></>}</div></div>
              })}
            </div>
          </section>

          <section className="csl-panel csl-quick-panel">
            <div className="csl-panel-head"><div><span className="csl-panel-kicker">ACTIONS</span><h2>Quick actions</h2></div></div>
            <div className="csl-quick-grid">
              <button onClick={onAddService}><Wrench size={22}/><span>Add service</span></button>
              <button onClick={onAddFuel}><FuelIcon size={22}/><span>Add fuel</span></button>
              <button onClick={onAddExpense}><Receipt size={22}/><span>Add expense</span></button>
              <button onClick={onAddDocument}><FileText size={22}/><span>Add document</span></button>
            </div>
          </section>
        </div>

        <div className="csl-side-column">
          <section className="csl-panel csl-health-panel"><div className="csl-panel-head"><div><span className="csl-panel-kicker">STATUS</span><h2>Vehicle health</h2></div><ArrowRight size={15}/></div><div className="csl-health-body"><DueRing pct={health/100} size={112} stroke={10} color={ringColor} label={`${health}%`} sub="Good"/><div className="csl-health-list"><span><i className="ok"/> Service schedule up to date</span><span><i className="ok"/> Engine oil up to date</span><span><i className={roadTax?.tone==='bad'?'bad':'ok'}/>{roadTax?.tone==='bad'?' Road tax expired':' Road tax valid'}</span><span><i className={insurance?.tone==='bad'?'bad':'ok'}/>{insurance?.tone==='bad'?' Insurance expired':' Insurance valid'}</span><span><i className={schedule.some(x=>x.overdue)?'bad':'ok'}/>{schedule.some(x=>x.overdue)?' Maintenance overdue':' No overdue maintenance'}</span></div></div></section>

          <section className="csl-panel"><div className="csl-panel-head"><div><span className="csl-panel-kicker">DOCUMENTS</span><h2>Vehicle documents</h2></div><button onClick={onEditVehicle}>Manage <ArrowRight size={14}/></button></div><div className="csl-doc-list"><div><StatusIcon tone={roadTax?.tone === 'bad'?'bad':roadTax?.tone==='warn'?'warn':'ok'}><FileText size={16}/></StatusIcon><div><strong>Road Tax</strong><span>{roadTax?.text}</span></div><button onClick={onEditVehicle}>Update</button></div><div><StatusIcon tone={insurance?.tone === 'bad'?'bad':insurance?.tone==='warn'?'warn':'ok'}><FileText size={16}/></StatusIcon><div><strong>Insurance</strong><span>{insurance?.text}</span></div><button onClick={onEditVehicle}>Update</button></div></div></section>

          <section className="csl-panel"><div className="csl-panel-head"><div><span className="csl-panel-kicker">ACTIVITY</span><h2>Recent activity</h2></div><button onClick={() => onSelect('history')}>View all <ArrowRight size={14}/></button></div><div className="csl-activity-list">{recent.length ? recent.map(r => {const Icon=r.icon; return <div className="csl-activity-item" key={r.id}><StatusIcon tone={r.tone==='service'?'ok':r.tone==='fuel'?'neutral':'warn'}><Icon size={15}/></StatusIcon><div><strong>{r.title}</strong><span>{r.meta}</span></div><b>{fmtRM(r.amount)}</b></div>}) : <div className="csl-empty-mini">No activity yet. Start with a service or fuel entry.</div>}</div></section>

          <section className="csl-panel csl-spend-panel"><div className="csl-panel-head"><div><span className="csl-panel-kicker">FINANCE</span><h2>Spending overview</h2></div><TrendingUp size={16}/></div><div className="csl-spend-total"><strong>{fmtRM(totalSpend)}</strong><span>all tracked costs</span></div><div className="csl-spend-bars">{costSummary.byMonth.map(m => <div key={m.key}><span style={{height:`${Math.max(4, (m.total/Math.max(1,...costSummary.byMonth.map(x=>x.total)))*72)}px`}}/><em>{m.label}</em></div>)}</div></section>
        </div>
      </div>
    </div>
  );
}
