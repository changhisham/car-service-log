import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Bell, Car, ChevronRight, CircleCheck, Clock3,
  FileText, Fuel, Gauge, Receipt, ShieldCheck, Sparkles, Wrench, Plus, Pencil,
  TrendingUp, HelpCircle, TrendingDown, Minus, BadgeCheck
} from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../styles/theme';
import { calculateSchedule } from '../../domain/maintenanceSchedule';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate, todayISO } from '../../utils/date';
import { typeMeta } from '../../constants/serviceTypes';
import { expenseCategoryMeta } from '../../constants/expenseCategories';

const card = {
  background: 'linear-gradient(180deg, rgba(18,22,42,.96), rgba(11,16,31,.96))',
  border: `1px solid ${COLORS.line}`,
  borderRadius: 18,
};

function StatusDot({ tone = 'ok' }) {
  const color = tone === 'bad' ? COLORS.rust : tone === 'warn' ? COLORS.amber : COLORS.green;
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, display: 'inline-block', flexShrink: 0 }} />;
}

function SectionTitle({ icon: Icon, title, tone, badge, action, onAction }) {
  return (
    <div className="gl-section-title">
      <div className={`gl-section-heading ${tone || ''}`}><Icon size={16} /><span>{title}</span>{!!badge && <i className="gl-section-badge">{badge}</i>}</div>
      {action && <button className="gl-link-button" onClick={onAction}>{action}<ChevronRight size={14} /></button>}
    </div>
  );
}

// The vehicle's own `odometer` field has no timestamp — it's just
// bumped whenever a record or fuel log comes in — so "last updated"
// is derived from whichever logged entry most recently touched it.
function latestOdometerDate(vehicle) {
  const dates = [...(vehicle.records || []), ...(vehicle.fuelLogs || [])].map(x => x.date);
  return dates.length ? dates.reduce((a, b) => (b > a ? b : a)) : null;
}

function VehicleHero({ active, reminder, roadTax, insurance, onEdit, onCarInfo }) {
  const serviceTone = !reminder?.known ? 'neutral' : reminder.overdue ? 'bad' : reminder.soon ? 'warn' : 'ok';
  const ServiceIcon = serviceTone === 'bad' ? AlertTriangle : serviceTone === 'warn' ? Clock3 : serviceTone === 'neutral' ? HelpCircle : CircleCheck;
  const lastOdoDate = latestOdometerDate(active);
  const serviceStatusLabel = serviceTone === 'bad' ? 'Overdue' : serviceTone === 'warn' ? 'Due soon' : 'On track';
  return (
    <section className="gl-hero">
      <div className="gl-hero-actions">
        <button className="gl-hero-edit" onClick={onCarInfo}><BadgeCheck size={13}/> Car Details</button>
        <button className="gl-hero-edit" onClick={onEdit}><Pencil size={13}/> Edit</button>
      </div>
      <div className="gl-hero-top">
        <div className="gl-hero-copy">
          <div className="gl-eyebrow">{active.brand || 'Vehicle'}</div>
          <h1>{active.model || 'Your vehicle'}</h1>
          <div className="gl-hero-meta"><Car size={14}/> {active.plate}<span className="gl-hero-dot">·</span><Gauge size={14}/> {fmtKm(active.odometer)} km</div>
          <div className="gl-hero-updated">Last updated: {lastOdoDate ? fmtDate(lastOdoDate) : '—'}</div>
        </div>
        {active.photo ? <img className="gl-hero-photo" src={active.photo} alt=""/> : <div className="gl-hero-photo gl-hero-photo-empty"><Car size={48}/></div>}
      </div>
      <div className="gl-hero-stats">
        <div className={`gl-service-status ${serviceTone !== 'ok' ? serviceTone : ''}`}>
          <div className={`gl-status-icon ${serviceTone !== 'ok' ? serviceTone : ''}`}><ServiceIcon size={26} /></div>
          <div><span>Next service</span>
            <strong>{reminder?.known ? <>{fmtKm(Math.max(0, reminder.kmLeft))} <small>km</small></> : '—'}</strong>
            <em>{!reminder?.known ? 'Add your latest service' : `${serviceStatusLabel} · due ${fmtDate(reminder.dueDate)}`}</em>
          </div>
        </div>
        <div className={`gl-doc ${roadTax.tone === 'bad' ? 'bad' : roadTax.tone === 'warn' ? 'warn' : ''}`}><FileText size={26}/><div><b>Road tax</b><span>{active.roadTaxExpiry ? fmtDate(active.roadTaxExpiry) : 'Not set'}</span>{(roadTax.tone === 'bad' || roadTax.tone === 'warn') && <em>{roadTax.text}</em>}</div></div>
        <div className={`gl-doc ${insurance.tone === 'bad' ? 'bad' : insurance.tone === 'warn' ? 'warn' : ''}`}><ShieldCheck size={26}/><div><b>Insurance</b><span>{active.insuranceExpiry ? fmtDate(active.insuranceExpiry) : 'Not set'}</span>{(insurance.tone === 'bad' || insurance.tone === 'warn') && <em>{insurance.text}</em>}</div></div>
      </div>
    </section>
  );
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function last12Months() {
  const now = new Date();
  const opts = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return opts;
}

const sumByDatePrefix = (list, amountKey, prefix) =>
  list.filter(x => x.date.startsWith(prefix)).reduce((s, x) => s + (Number(x[amountKey]) || 0), 0);

function prevMonthKey(month) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1); // m is 1-based; -2 steps back one month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// null previous (nothing to compare against) is distinct from a real 0%
// change — "No prior data" reads very differently from "No change".
function computeDelta(current, previous) {
  if (!previous) return current ? { label: 'No prior data', dir: 'flat' } : { label: 'No change', dir: 'flat' };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { label: 'No change', dir: 'flat' };
  return { label: `${Math.abs(pct).toFixed(0)}% vs last month`, dir: pct > 0 ? 'up' : 'down' };
}

function DeltaTag({ delta }) {
  const Icon = delta.dir === 'up' ? TrendingUp : delta.dir === 'down' ? TrendingDown : Minus;
  return <small className={`gl-kpi-delta ${delta.dir}`}><Icon size={11}/> {delta.label}</small>;
}

// A standalone KPI snapshot so spend comparisons don't require a trip to
// the Insights page — the month picker here is independent of Insights'
// own trailing-6-month trend chart.
function OwnershipKpis({ active }) {
  const [month, setMonth] = useState(() => todayISO().slice(0, 7));
  const months = useMemo(last12Months, []);
  const prevMonth = prevMonthKey(month);

  const records = active.records || [], fuelLogs = active.fuelLogs || [], expenses = active.expenses || [];
  const totalFor = (m) => sumByDatePrefix(records, 'cost', m) + sumByDatePrefix(fuelLogs, 'totalCost', m) + sumByDatePrefix(expenses, 'amount', m);
  const fuelFor = (m) => sumByDatePrefix(fuelLogs, 'totalCost', m);
  const maintFor = (m) => sumByDatePrefix(records, 'cost', m);
  const fuelPerLitreFor = (m) => {
    const litres = sumByDatePrefix(fuelLogs, 'litres', m);
    return litres ? fuelFor(m) / litres : 0;
  };

  const tiles = [
    { label: 'Total spent', value: totalFor(month), delta: computeDelta(totalFor(month), totalFor(prevMonth)) },
    { label: 'Fuel', value: fuelFor(month), delta: computeDelta(fuelFor(month), fuelFor(prevMonth)) },
    { label: 'Maintenance', value: maintFor(month), delta: computeDelta(maintFor(month), maintFor(prevMonth)) },
    { label: 'Avg fuel cost', value: fuelPerLitreFor(month), unit: '/L', delta: computeDelta(fuelPerLitreFor(month), fuelPerLitreFor(prevMonth)) },
  ];

  return <section className="gl-card gl-kpi-section">
    <div className="gl-section-title">
      <div className="gl-section-heading"><TrendingUp size={16}/><span>Cost Summary</span></div>
      <select className="gl-kpi-month" value={month} onChange={e => setMonth(e.target.value)}>
        {months.map(k => <option key={k} value={k}>{monthLabel(k)}</option>)}
      </select>
    </div>
    <div className="gl-analytics-grid">
      {tiles.map(t => (
        <div className="gl-analytics-card" key={t.label}>
          <span>{t.label}</span>
          <strong>{fmtRM(t.value)}{t.unit || ''}</strong>
          <DeltaTag delta={t.delta}/>
        </div>
      ))}
    </div>
  </section>;
}

// Overdue first, then soonest upcoming — items with no km/date gauge
// (road tax, insurance) sort by their own urgency tier only.
function taskStatus(bad, soon) {
  return bad ? { label: 'Overdue', tone: 'bad' } : soon ? { label: 'Due now', tone: 'warn' } : { label: 'Upcoming', tone: 'ok' };
}

function NextUp({ active, schedule, roadTax, insurance, onEditSchedule, onLogService }) {
  const tasks = [];
  if (roadTax.tone === 'bad' || roadTax.tone === 'warn') tasks.push({
    key:'tax', bad: roadTax.tone === 'bad', soon: roadTax.tone === 'warn', icon: FileText, title:'Renew road tax',
    sub: active.roadTaxExpiry ? `${roadTax.text} · ${fmtDate(active.roadTaxExpiry)}` : roadTax.text,
    actionLabel:'Update', onAction: onEditSchedule,
  });
  if (insurance.tone === 'bad' || insurance.tone === 'warn') tasks.push({
    key:'ins', bad: insurance.tone === 'bad', soon: insurance.tone === 'warn', icon: ShieldCheck, title:'Renew insurance',
    sub: active.insuranceExpiry ? `${insurance.text} · ${fmtDate(active.insuranceExpiry)}` : insurance.text,
    actionLabel:'Update', onAction: onEditSchedule,
  });
  schedule.filter(x => x.known).sort((a,b) => (a.kmLeft || 0) - (b.kmLeft || 0)).slice(0, 3).forEach(item => tasks.push({
    key:item.id, bad:item.overdue, soon:item.soon, kmLeft:item.kmLeft, icon: Wrench, title:`${item.label} service`,
    sub: item.overdue
      ? (item.kmLeft < 0 ? `${fmtKm(Math.abs(item.kmLeft))} km overdue · was due ${fmtDate(item.dueDate)}` : `Was due ${fmtDate(item.dueDate)}`)
      : `${fmtKm(Math.max(0,item.kmLeft))} km remaining · due ${fmtDate(item.dueDate)}`,
    actionLabel:'Log service', onAction: onLogService,
  }));
  tasks.sort((a,b) => (a.bad === b.bad ? (a.kmLeft ?? Infinity) - (b.kmLeft ?? Infinity) : a.bad ? -1 : 1));
  const shown = tasks.slice(0, 4);
  return <section className="gl-card"><SectionTitle icon={AlertTriangle} tone="warn" title="Needs attention" badge={tasks.length} action="View all" />
    <div className="gl-task-list">
      {shown.length === 0 && <div className="gl-empty-small"><CircleCheck size={18}/> Nothing urgent. You're on track.</div>}
      {shown.map(t => { const Icon=t.icon; const status = taskStatus(t.bad, t.soon); return <div className={`gl-task ${status.tone !== 'ok' ? status.tone : ''}`} key={t.key}>
        <div className="gl-task-icon"><Icon size={16}/></div>
        <div className="gl-task-copy">
          <div className="gl-task-title-row"><b>{t.title}</b><span className={`gl-task-badge ${status.tone}`}>{status.label}</span></div>
          <span>{t.sub}</span>
        </div>
        <button className="gl-outline-action" onClick={t.onAction}>{t.actionLabel}</button>
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

// Each entry wraps the ORIGINAL record (`item`) untouched — display-only
// values (title/cost/icon) are derived at render time instead of being
// spread onto a copy, so clicking through to edit never round-trips
// synthetic fields like `_kind` back into Firestore on save.
function RecentActivity({ active, onHistory, onEditRecord, onEditFuel, onEditExpense }) {
  const rows = useMemo(() => (active.records||[]).map(item=>({ kind:'service', item })), [active.records]);
  const fuel = (active.fuelLogs||[]).map(item=>({ kind:'fuel', item }));
  const expenses = (active.expenses||[]).map(item=>({ kind:'expense', item }));
  const entries = [...rows,...fuel,...expenses].sort((a,b)=>b.item.date.localeCompare(a.item.date)).slice(0,5);
  const onRowClick = (w) => w.kind==='service' ? onEditRecord(w.item) : w.kind==='fuel' ? onEditFuel(w.item) : onEditExpense(w.item);

  let lastDate = null;
  return <section className="gl-card"><SectionTitle icon={Clock3} title="Recent activity" action="View all" onAction={onHistory}/><div className="gl-activity">{entries.map((w,i)=>{
    const r = w.item;
    const Icon = w.kind==='service'?typeMeta(r.type).icon:w.kind==='fuel'?Fuel:expenseCategoryMeta(r.category).icon;
    const title = w.kind==='service'?typeMeta(r.type).label:w.kind==='fuel'?'Fuel refill':expenseCategoryMeta(r.category).label;
    const kindLabel = w.kind==='service'?'Maintenance':w.kind==='fuel'?'Fuel':expenseCategoryMeta(r.category).label;
    const cost = w.kind==='fuel'?r.totalCost:w.kind==='expense'?r.amount:r.cost;
    const subtitle = r.odometer ? `${fmtKm(r.odometer)} km` : (w.kind==='expense' && r.description) ? r.description : '';
    const showDateHeader = r.date !== lastDate;
    lastDate = r.date;
    return <React.Fragment key={`${w.kind}-${r.id||i}`}>
      {showDateHeader && <div className="gl-activity-date">{fmtDate(r.date)}</div>}
      <div className="gl-activity-row" onClick={() => onRowClick(w)} role="button" tabIndex={0}>
        <span className={`gl-activity-icon ${w.kind}`}><Icon size={17} style={{ display: 'block' }}/></span>
        <div><b>{title}</b>{subtitle && <span>{subtitle}</span>}</div>
        <div className="gl-activity-amount"><small>{kindLabel}</small><strong>{fmtRM(cost||0)}</strong></div>
        <ChevronRight size={14}/>
      </div>
    </React.Fragment>;
  })}</div></section>;
}

function InsightsMini({ costSummary, active, onOpen }) {
  return <section className="gl-card gl-insights"><SectionTitle icon={TrendingUp} title="Insights" action="Open analytics" onAction={onOpen}/>
    <div className="gl-insight-total"><span>Total tracked spending</span><strong>{fmtRM(costSummary.total)}</strong></div>
    <div className="gl-mini-bars">{costSummary.byMonth.map(m=>{const max=Math.max(1,...costSummary.byMonth.map(x=>x.total)); return <div key={m.key}><i style={{height:`${Math.max(5,(m.total/max)*74)}px`}}/><span>{m.label}</span></div>})}</div>
    <div className="gl-stat-strip"><div><b>{active.fuelLogs?.length||0}</b><span>fuel logs</span></div><div><b>{active.records?.length||0}</b><span>services</span></div><div><b>{active.expenses?.length||0}</b><span>expenses</span></div></div>
  </section>;
}

export function GarageOverviewV2({ active, reminder, roadTax, insurance, costSummary, schedule, onEditVehicle, onManageSchedule, onEditDocument, onService, onFuel, onExpense, onDocument, onHistory, onInsights, onEditRecord, onEditFuel, onEditExpense, onCarInfo }) {
  return <div className="gl-overview-v2">
    <VehicleHero active={active} reminder={reminder} roadTax={roadTax} insurance={insurance} onEdit={onEditVehicle} onCarInfo={onCarInfo}/>
    <OwnershipKpis active={active}/>
    <div className="gl-overview-grid">
      <div className="gl-main-column">
        <NextUp active={active} schedule={schedule} roadTax={roadTax} insurance={insurance} onEditSchedule={onEditDocument} onLogService={onService}/>
        <QuickActions onService={onService} onFuel={onFuel} onExpense={onExpense} onDocument={onDocument}/>
        <Maintenance schedule={schedule} onManage={onManageSchedule}/>
        <InsightsMini costSummary={costSummary} active={active} onOpen={onInsights}/>
      </div>
      <div className="gl-side-column">
        <Documents roadTax={roadTax} insurance={insurance} onEdit={onEditDocument}/>
        <RecentActivity active={active} onHistory={onHistory} onEditRecord={onEditRecord} onEditFuel={onEditFuel} onEditExpense={onEditExpense}/>
      </div>
    </div>
  </div>;
}
