import React, { useMemo } from 'react';
import {
  Activity, AlertTriangle, Bell, Car, ChevronRight, CircleCheck, Clock3,
  FileText, Fuel, Gauge, Receipt, ShieldAlert, Sparkles, Wrench, Plus,
  TrendingUp, CalendarDays
} from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../styles/theme';
import { calculateSchedule } from '../../domain/maintenanceSchedule';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate } from '../../utils/date';
import { typeMeta } from '../../constants/serviceTypes';

const card = {
  background: 'linear-gradient(180deg, rgba(18,22,42,.96), rgba(11,16,31,.96))',
  border: `1px solid ${COLORS.line}`,
  borderRadius: 18,
};

function StatusDot({ tone = 'ok' }) {
  const color = tone === 'bad' ? COLORS.rust : tone === 'warn' ? COLORS.amber : COLORS.green;
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, display: 'inline-block', flexShrink: 0 }} />;
}

function SectionTitle({ icon: Icon, title, action, onAction }) {
  return (
    <div className="gl-section-title">
      <div className="gl-section-heading"><Icon size={16} /><span>{title}</span></div>
      {action && <button className="gl-link-button" onClick={onAction}>{action}<ChevronRight size={14} /></button>}
    </div>
  );
}

function VehicleHero({ active, reminder, roadTax, insurance, onEdit }) {
  return (
    <section className="gl-hero" style={{ backgroundImage: active.photo ? `linear-gradient(90deg, rgba(7,12,25,.96) 0%, rgba(7,12,25,.82) 46%, rgba(7,12,25,.36) 100%), url(${active.photo})` : undefined }}>
      <div className="gl-hero-content">
        <div className="gl-hero-copy">
          <div className="gl-eyebrow">{active.brand || 'Vehicle'}</div>
          <h1>{active.model || 'Your vehicle'}</h1>
          <div className="gl-muted">{active.year ? `${active.year} · ` : ''}{active.color || '—'}</div>
          <div className="gl-plate"><Car size={15} /> {active.plate}</div>
        </div>
        <div className="gl-hero-stats">
          <div className="gl-mileage">
            <Gauge size={30} />
            <div><span>Total mileage</span><strong>{fmtKm(active.odometer)} <small>km</small></strong><em>On the clock</em></div>
          </div>
          <div className="gl-service-status">
            <div className="gl-status-icon"><CircleCheck size={30} /></div>
            <div><strong>{!reminder?.known ? 'Service baseline needed' : reminder.overdue ? 'Service overdue' : 'Service on track'}</strong>
              <span>{!reminder?.known ? 'Add your latest service to enable reminders' : `Next service: ${fmtKm(Math.max(0, reminder.kmLeft))} km or ${fmtDate(reminder.dueDate)}`}</span></div>
          </div>
          <div className="gl-doc-alerts">
            <div className={`gl-doc ${roadTax.tone === 'bad' ? 'bad' : roadTax.tone === 'warn' ? 'warn' : ''}`}><ShieldAlert size={30}/><div><b>Road tax</b><span>{roadTax.text}</span></div></div>
            <div className={`gl-doc ${insurance.tone === 'bad' ? 'bad' : insurance.tone === 'warn' ? 'warn' : ''}`}><ShieldAlert size={30}/><div><b>Insurance</b><span>{insurance.text}</span></div></div>
          </div>
        </div>
        <button className="gl-hero-edit" onClick={onEdit} aria-label="Edit vehicle">✎</button>
      </div>
    </section>
  );
}

function NextUp({ schedule, roadTax, insurance, onEditSchedule }) {
  const tasks = [];
  if (roadTax.tone === 'bad' || roadTax.tone === 'warn') tasks.push({ key:'tax', bad: roadTax.tone === 'bad', icon: ShieldAlert, title:'Renew road tax', sub: roadTax.text, action:'Update' });
  if (insurance.tone === 'bad' || insurance.tone === 'warn') tasks.push({ key:'ins', bad: insurance.tone === 'bad', icon: ShieldAlert, title:'Renew insurance', sub: insurance.text, action:'Update' });
  schedule.filter(x => x.known).sort((a,b) => (a.kmLeft || 0) - (b.kmLeft || 0)).slice(0, 3).forEach(item => tasks.push({ key:item.id, bad:item.overdue, icon: Wrench, title:`${item.label} service`, sub:item.overdue ? 'Due now' : `Due in ${fmtKm(Math.max(0,item.kmLeft))} km · ${fmtDate(item.dueDate)}` }));
  const shown = tasks.slice(0, 4);
  return <section className="gl-card"><SectionTitle icon={CalendarDays} title="Next up" action="View all" />
    <div className="gl-task-list">
      {shown.length === 0 && <div className="gl-empty-small"><CircleCheck size={18}/> Nothing urgent. You're on track.</div>}
      {shown.map(t => { const Icon=t.icon; return <div className={`gl-task ${t.bad ? 'bad' : ''}`} key={t.key}>
        <div className="gl-task-icon"><Icon size={16}/></div><div className="gl-task-copy"><b>{t.title}</b><span>{t.sub}</span></div>{t.action ? <button className="gl-outline-action" onClick={onEditSchedule}>{t.action}</button> : <ChevronRight size={15} className="gl-chevron"/>}
      </div> })}
    </div>
  </section>;
}

function Maintenance({ schedule, onManage }) {
  return <section className="gl-card gl-maintenance"><SectionTitle icon={Wrench} title="Maintenance" action="Manage" onAction={onManage}/>
    <div className="gl-maint-list">{schedule.map(item => {
      const tone = !item.known ? 'neutral' : item.overdue ? 'bad' : item.soon ? 'warn' : 'ok';
      const pct = item.known ? Math.max(0, Math.min(100, ((item.intervalKm - Math.max(0,item.kmLeft)) / Math.max(1,item.intervalKm))*100)) : 0;
      return <div className="gl-maint-row" key={item.id}><div className="gl-maint-name"><StatusDot tone={tone}/><span>{item.label}</span></div><div className="gl-progress"><i style={{width:`${pct}%`}}/></div><div className="gl-maint-meta">{!item.known ? <><span>Not configured</span><a onClick={onManage}>+ Add schedule</a></> : <><b>{item.overdue ? 'Due now' : `${fmtKm(Math.max(0,item.kmLeft))} km remaining`}</b><span>Next: {fmtDate(item.dueDate)}</span></>}</div></div>;
    })}</div>
  </section>;
}

function Documents({ roadTax, insurance, onEdit }) {
  return <section className="gl-card"><SectionTitle icon={FileText} title="Documents" action="View all"/><div className="gl-doc-list">
    {[['Road Tax',roadTax],['Insurance',insurance]].map(([name,status]) => <div className="gl-document" key={name}><div className={`gl-doc-big ${status.tone}`}>{status.tone==='bad'?<AlertTriangle size={17}/>:<FileText size={17}/>}</div><div><b>{name}</b><span>{status.text}</span></div><button className="gl-outline-action" onClick={onEdit}>{status.tone==='bad'?'Update':'Manage'}</button></div>)}
  </div></section>;
}

function QuickActions({ onService, onFuel, onExpense, onDocument }) {
  const actions=[['Service',Wrench,onService],['Fuel',Fuel,onFuel],['Expense',Receipt,onExpense],['Document',FileText,onDocument]];
  return <section className="gl-card"><SectionTitle icon={Sparkles} title="Quick actions"/>
    <div className="gl-quick-grid">{actions.map(([label,Icon,fn])=><button key={label} className="gl-quick" onClick={fn}><span><Icon size={20}/></span><b>Add {label}</b></button>)}</div>
  </section>;
}

function RecentActivity({ active, onHistory }) {
  const rows = useMemo(() => [...(active.records||[])].map(r=>({...r,_kind:'service'})), [active.records]);
  const fuel = (active.fuelLogs||[]).map(f=>({...f,_kind:'fuel',cost:f.totalCost,title:'Fuel refill'}));
  const expenses = (active.expenses||[]).map(e=>({...e,_kind:'expense',cost:e.amount,title:e.title||e.category||'Expense'}));
  return <section className="gl-card"><SectionTitle icon={Clock3} title="Recent activity" action="View all" onAction={onHistory}/><div className="gl-activity">{[...rows,...fuel,...expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map((r,i)=>{const Icon=r._kind==='service'?Wrench:r._kind==='fuel'?Fuel:Receipt; const title=r.title || typeMeta(r.type).label; return <div className="gl-activity-row" key={`${r._kind}-${r.id||i}`}><span className="gl-activity-icon"><Icon size={15}/></span><div><b>{title}</b><span>{fmtDate(r.date)}{r.odometer ? ` · ${fmtKm(r.odometer)} km` : ''}</span></div><strong>{fmtRM(r.cost||0)}</strong><ChevronRight size={14}/></div>})}</div></section>;
}

function InsightsMini({ costSummary, active }) {
  const totalFuel = (active.fuelLogs||[]).reduce((s,x)=>s+(Number(x.totalCost)||0),0);
  const totalService = (active.records||[]).reduce((s,x)=>s+(Number(x.cost)||0),0);
  const totalExpense = (active.expenses||[]).reduce((s,x)=>s+(Number(x.amount)||0),0);
  const total = totalFuel+totalService+totalExpense;
  return <section className="gl-card gl-insights"><SectionTitle icon={TrendingUp} title="Insights" action="Open analytics"/>
    <div className="gl-insight-total"><span>Total tracked spending</span><strong>{fmtRM(total || costSummary.total)}</strong></div>
    <div className="gl-mini-bars">{costSummary.byMonth.map(m=>{const max=Math.max(1,...costSummary.byMonth.map(x=>x.total)); return <div key={m.key}><i style={{height:`${Math.max(5,(m.total/max)*74)}px`}}/><span>{m.label}</span></div>})}</div>
    <div className="gl-stat-strip"><div><b>{active.fuelLogs?.length||0}</b><span>fuel logs</span></div><div><b>{active.records?.length||0}</b><span>services</span></div><div><b>{active.expenses?.length||0}</b><span>expenses</span></div></div>
  </section>;
}

export function GarageOverviewV2({ active, reminder, roadTax, insurance, costSummary, schedule, onEditVehicle, onManageSchedule, onEditDocument, onService, onFuel, onExpense, onDocument, onHistory }) {
  return <div className="gl-overview-v2">
    <VehicleHero active={active} reminder={reminder} roadTax={roadTax} insurance={insurance} onEdit={onEditVehicle}/>
    <div className="gl-overview-grid">
      <div className="gl-main-column">
        <NextUp schedule={schedule} roadTax={roadTax} insurance={insurance} onEditSchedule={onEditDocument}/>
        <QuickActions onService={onService} onFuel={onFuel} onExpense={onExpense} onDocument={onDocument}/>
        <Maintenance schedule={schedule} onManage={onManageSchedule}/>
        <InsightsMini costSummary={costSummary} active={active}/>
      </div>
      <div className="gl-side-column">
        <Documents roadTax={roadTax} insurance={insurance} onEdit={onEditDocument}/>
        <RecentActivity active={active} onHistory={onHistory}/>
      </div>
    </div>
  </div>;
}
