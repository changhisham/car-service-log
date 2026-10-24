import React, { useMemo } from 'react';
import {
  AlertTriangle, Car, ChevronRight, CircleCheck, Clock3,
  FileText, Fuel, Receipt, ShieldCheck, Sparkles, Wrench,
  TrendingUp, TrendingDown, Minus, Sun, Moon, Calendar,
  Wallet, PieChart, Lightbulb, ArrowRight, ArrowUpRight, ArrowDownRight,
  Pencil, Gauge,
} from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../styles/theme';
import { CarDetailsHero } from '../carinfo/CarDetailsHero';
import { Sparkline } from './Sparkline';
import { calculateSchedule } from '../../domain/maintenanceSchedule';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate, todayISO } from '../../utils/date';
import { typeMeta } from '../../constants/serviceTypes';
import { expenseCategoryMeta } from '../../constants/expenseCategories';

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

// Overview uses the same hero card as the Car Details page (CarDetailsHero)
// so the two stay visually consistent. Unlike the Car Details page itself,
// the Overview hero keeps quick-jump actions since this is the entry point
// people land on first.
function VehicleHero({ active, reminder, roadTax, insurance, onEditVehicle, onCarInfo, onNextService }) {
  const actions = (onCarInfo || onEditVehicle) && (
    <>
      {onCarInfo && <button className="gl-hero-edit" onClick={onCarInfo}><Car size={14} /> Car Details</button>}
      {onEditVehicle && <button className="gl-hero-edit" onClick={onEditVehicle}><Pencil size={14} /> Edit</button>}
    </>
  );
  return <CarDetailsHero active={active} reminder={reminder} roadTax={roadTax} insurance={insurance} actions={actions} onNextService={onNextService} />;
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

// Oldest-first — used for sparklines/bar charts, which read left-to-right.
function lastNMonthsAsc(n) {
  const now = new Date();
  const opts = [];
  for (let i = n - 1; i >= 0; i--) {
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
  if (!previous) return { pct: null, label: current ? 'No prior data' : 'No change', dir: 'flat' };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { pct: 0, label: 'No change', dir: 'flat' };
  return { pct, label: `${Math.abs(pct).toFixed(0)}% vs last month`, dir: pct > 0 ? 'up' : 'down' };
}

function DeltaTag({ delta }) {
  const Icon = delta.dir === 'up' ? TrendingUp : delta.dir === 'down' ? TrendingDown : Minus;
  return <small className={`gl-kpi-delta ${delta.dir}`}><Icon size={11}/> {delta.label}</small>;
}

function greetingForHour(h) {
  if (h < 12) return { text: 'Good morning', Icon: Sun };
  if (h < 18) return { text: 'Good afternoon', Icon: Sun };
  return { text: 'Good evening', Icon: Moon };
}

function DashboardGreeting() {
  const { text, Icon } = useMemo(() => greetingForHour(new Date().getHours()), []);
  return (
    <div className="gl-greeting-bar">
      <div className="gl-greeting-left">
        <Icon size={22}/>
        <div><h1>{text}</h1><p>Your garage at a glance</p></div>
      </div>
    </div>
  );
}

// Three headline KPIs with a trailing-6-month sparkline each, for the
// selected period — the period picker lives in the greeting bar above,
// shared with Cost Breakdown so both reflect the same month.
function KpiRow({ active, month, prevMonth }) {
  const records = active.records || [], fuelLogs = active.fuelLogs || [], expenses = active.expenses || [];
  const totalFor = (m) => sumByDatePrefix(records, 'cost', m) + sumByDatePrefix(fuelLogs, 'totalCost', m) + sumByDatePrefix(expenses, 'amount', m);
  const fuelFor = (m) => sumByDatePrefix(fuelLogs, 'totalCost', m);
  const maintFor = (m) => sumByDatePrefix(records, 'cost', m);
  const avgFuelFor = (m) => {
    const litres = sumByDatePrefix(fuelLogs, 'litres', m);
    return litres > 0 ? sumByDatePrefix(fuelLogs, 'totalCost', m) / litres : 0;
  };
  const series6 = useMemo(() => lastNMonthsAsc(6), []);

  const tiles = [
    { label: 'Total Vehicle Cost', icon: Wallet, fn: totalFor },
    { label: 'Fuel', icon: Fuel, fn: fuelFor },
    { label: 'Maintenance', icon: Wrench, fn: maintFor },
    { label: 'Avg Fuel Cost', icon: Gauge, fn: avgFuelFor, perLitre: true },
  ].map(t => ({
    ...t, value: t.fn(month), delta: computeDelta(t.fn(month), t.fn(prevMonth)), spark: series6.map(t.fn),
  }));

  return (
    <div className="gl-kpi-row">
      {tiles.map(t => {
        const Icon = t.icon;
        const hasSpark = t.spark.filter(v => v > 0).length >= 2;
        return (
          <div className={`gl-kpi-card ${t.perLitre ? 'gl-kpi-mobile-only' : ''}`} key={t.label}>
            <div className="gl-kpi-card-head"><span className="gl-kpi-icon"><Icon size={16}/></span><span>{t.label}</span></div>
            <strong>{fmtRM(t.value)}{t.perLitre ? '/L' : ''}</strong>
            <DeltaTag delta={t.delta}/>
            {hasSpark && <div className="gl-kpi-spark"><Sparkline values={t.spark} width={150} height={30} color={t.delta.dir === 'up' ? COLORS.rust : COLORS.green}/></div>}
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, size = 120, strokeWidth = 16 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.line} strokeWidth={strokeWidth} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} strokeLinecap={segments.length > 1 ? 'butt' : 'round'} />;
          offset += dash;
          return el;
        })}
      </g>
    </svg>
  );
}

// Fuel + service records are fixed buckets; expenses are grouped by
// category with the largest category broken out and the rest folded into
// "Other", so the legend stays readable regardless of how many expense
// categories are actually in use.
function CostBreakdown({ active, month }) {
  const records = active.records || [], fuelLogs = active.fuelLogs || [], expenses = active.expenses || [];
  const fuelTotal = sumByDatePrefix(fuelLogs, 'totalCost', month);
  const maintTotal = sumByDatePrefix(records, 'cost', month);
  const expByCat = {};
  expenses.filter(e => e.date.startsWith(month)).forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + (Number(e.amount) || 0); });
  const expEntries = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
  const topExpense = expEntries[0];
  const otherExpenseTotal = expEntries.slice(1).reduce((s, [, v]) => s + v, 0);

  const palette = ['#10B981', '#3B82F6', '#F97316', '#A855F7'];
  // Fuel and Maintenance are fixed buckets — always listed, even at RM0 —
  // so the legend reads consistently period to period. The expense-derived
  // slices only appear when there's actually an expense to show.
  const legend = [
    { label: 'Fuel', value: fuelTotal, color: palette[0] },
    { label: 'Maintenance', value: maintTotal, color: palette[1] },
    ...(topExpense ? [{ label: expenseCategoryMeta(topExpense[0]).label, value: topExpense[1], color: palette[2] }] : []),
    ...(otherExpenseTotal > 0 ? [{ label: 'Other', value: otherExpenseTotal, color: palette[3] }] : []),
  ];
  const segments = legend.filter(s => s.value > 0);
  const total = legend.reduce((s, x) => s + x.value, 0);

  return (
    <section className="gl-card">
      <SectionTitle icon={PieChart} title="Cost Breakdown" />
      {total === 0 ? (
        <div className="gl-empty-small">No costs logged this period.</div>
      ) : (
        <div className="gl-donut-wrap">
          <div className="gl-donut-svg-wrap">
            <DonutChart segments={segments} size={130} strokeWidth={14} />
            <div className="gl-donut-center"><strong>{fmtRM(total)}</strong><span>Total cost</span></div>
          </div>
          <div className="gl-donut-legend">
            {legend.map(s => (
              <div key={s.label}>
                <i style={{ background: s.color }} /><span>{s.label}</span>
                <b>{fmtRM(s.value)}</b><small>{total ? ((s.value / total) * 100).toFixed(1) : '0.0'}%</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Overdue first, then soonest upcoming — items with no km/date gauge
// (road tax, insurance) sort by their own urgency tier only.
function taskStatus(bad, soon) {
  return bad ? { label: 'Overdue', tone: 'bad' } : soon ? { label: 'Due soon', tone: 'warn' } : { label: 'Upcoming', tone: 'ok' };
}

function UpcomingMaintenance({ active, schedule, roadTax, insurance, onEditSchedule, onLogService, onViewAll }) {
  const tasks = [];
  if (roadTax.tone === 'bad' || roadTax.tone === 'warn') tasks.push({
    key: 'tax', bad: roadTax.tone === 'bad', soon: roadTax.tone === 'warn', icon: FileText, title: 'Renew road tax', sub: 'Road tax',
    dueValue: roadTax.text, dueDate: active.roadTaxExpiry ? fmtDate(active.roadTaxExpiry) : '',
    actionLabel: 'Update', shortLabel: 'Update', onAction: onEditSchedule,
  });
  if (insurance.tone === 'bad' || insurance.tone === 'warn') tasks.push({
    key: 'ins', bad: insurance.tone === 'bad', soon: insurance.tone === 'warn', icon: ShieldCheck, title: 'Renew insurance', sub: 'Insurance',
    dueValue: insurance.text, dueDate: active.insuranceExpiry ? fmtDate(active.insuranceExpiry) : '',
    actionLabel: 'Update', shortLabel: 'Update', onAction: onEditSchedule,
  });
  schedule.filter(x => x.known).sort((a, b) => (a.kmLeft || 0) - (b.kmLeft || 0)).slice(0, 3).forEach(item => tasks.push({
    key: item.id, bad: item.overdue, soon: item.soon, kmLeft: item.kmLeft, icon: Wrench, title: `${item.label} Service`, sub: `${item.label} replacement`,
    dueValue: item.overdue ? (item.kmLeft < 0 ? `${fmtKm(Math.abs(item.kmLeft))} km overdue` : 'Due now') : `${fmtKm(Math.max(0, item.kmLeft))} km`,
    dueDate: fmtDate(item.dueDate),
    actionLabel: 'Log service', shortLabel: 'Log', onAction: onLogService,
  }));
  tasks.sort((a, b) => (a.bad === b.bad ? (a.kmLeft ?? Infinity) - (b.kmLeft ?? Infinity) : a.bad ? -1 : 1));
  const shown = tasks.slice(0, 4);
  return (
    <section className="gl-card">
      <SectionTitle icon={AlertTriangle} tone="warn" title="Upcoming Maintenance" badge={tasks.length} action="View all" onAction={onViewAll} />
      <div className="gl-task-list">
        {shown.length === 0 && <div className="gl-empty-small"><CircleCheck size={18}/> Nothing urgent. You're on track.</div>}
        {shown.map(t => {
          const Icon = t.icon;
          const status = taskStatus(t.bad, t.soon);
          return (
            <div className={`gl-task ${status.tone !== 'ok' ? status.tone : ''}`} key={t.key}>
              <StatusDot tone={status.tone} />
              <div className="gl-task-icon"><Icon size={16}/></div>
              <div className="gl-task-copy">
                <div className="gl-task-title-row"><b>{t.title}</b><span className={`gl-task-badge ${status.tone}`}>{status.label}</span></div>
                <span className="gl-task-sub-desktop">{t.sub}</span>
                <span className="gl-task-sub-mobile">{t.dueValue}{t.dueDate ? ` · ${t.bad ? 'was due' : 'due'} ${t.dueDate}` : ''}</span>
              </div>
              <div className="gl-task-due"><b>{t.dueValue}</b>{t.dueDate && <span>{t.dueDate}</span>}</div>
              <button className="gl-outline-action" onClick={t.onAction}>
                <span className="gl-task-action-full">{t.actionLabel}</span>
                <span className="gl-task-action-short">{t.shortLabel}</span>
              </button>
              <ChevronRight size={15} className="gl-chevron"/>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuickActions({ onService, onFuel, onExpense, onDocument }) {
  const actions = [
    ['Add Fuel', Fuel, onFuel],
    ['Log Service', Wrench, onService],
    ['Add Expense', Receipt, onExpense],
    ['Add Document', FileText, onDocument],
  ];
  return (
    <section className="gl-card"><SectionTitle icon={Sparkles} title="Quick Actions" />
      <div className="gl-quick-grid">
        {actions.map(([label, Icon, fn]) => (
          <button key={label} className="gl-quick" onClick={fn}>
            <span><Icon size={20}/></span><b>{label}</b><ArrowRight size={14} className="gl-quick-arrow"/>
          </button>
        ))}
      </div>
    </section>
  );
}

function DocumentsPreview({ active, onEdit }) {
  const docs = [
    { label: 'Road Tax', icon: Calendar, expiry: active.roadTaxExpiry, tone: 'ok' },
    { label: 'Insurance', icon: ShieldCheck, expiry: active.insuranceExpiry, tone: 'ok' },
  ];
  return (
    <section className="gl-card gl-documents-card">
      <SectionTitle icon={FileText} title="Documents" action="View all" onAction={onEdit} />
      <div className="gl-doc-list">
        {docs.map(d => {
          const Icon = d.icon;
          return (
            <div className="gl-document" key={d.label} onClick={onEdit} role="button" tabIndex={0}>
              <div className="gl-doc-big"><Icon size={17}/></div>
              <div><b>{d.label}</b><span>{d.expiry ? `Valid until ${fmtDate(d.expiry)}` : 'Not set'}</span></div>
              {d.expiry && <span className="gl-doc-valid-pill"><CircleCheck size={12}/> Valid</span>}
              <ChevronRight size={14} className="gl-chevron"/>
            </div>
          );
        })}
      </div>
    </section>
  );
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

  return <section className="gl-card"><SectionTitle icon={Clock3} title="Recent activity" action="View all" onAction={onHistory}/>
    <div className="gl-activity gl-activity-timeline">{entries.map((w,i)=>{
      const r = w.item;
      const Icon = w.kind==='service'?typeMeta(r.type).icon:w.kind==='fuel'?Fuel:expenseCategoryMeta(r.category).icon;
      const title = w.kind==='service'?typeMeta(r.type).label:w.kind==='fuel'?'Fuel refill':expenseCategoryMeta(r.category).label;
      const kindLabel = w.kind==='service'?'Maintenance':w.kind==='fuel'?'Fuel':expenseCategoryMeta(r.category).label;
      const cost = w.kind==='fuel'?r.totalCost:w.kind==='expense'?r.amount:r.cost;
      const subtitle = r.odometer ? `${fmtKm(r.odometer)} km` : (w.kind==='expense' && r.description) ? r.description : '';
      return (
        <div className="gl-activity-row" key={`${w.kind}-${r.id||i}`} onClick={() => onRowClick(w)} role="button" tabIndex={0}>
          <span className={`gl-activity-icon ${w.kind}`}><Icon size={17} style={{ display: 'block' }}/></span>
          <div><b>{title}</b><span>{fmtDate(r.date)}{subtitle ? ` · ${subtitle}` : ''}</span></div>
          <div className="gl-activity-amount"><small>{kindLabel}</small><strong>{fmtRM(cost||0)}</strong></div>
        </div>
      );
    })}</div>
  </section>;
}

// Fuel is the most frequently-logged, most volatile cost, so it's the
// clearest single "what changed" signal to lead with. The bar chart below
// always shows a rolling 6 months, independent of the period picker above.
function InsightsBar({ active, month, prevMonth, onOpen }) {
  const fuelLogs = active.fuelLogs || [];
  const fuelFor = (m) => sumByDatePrefix(fuelLogs, 'totalCost', m);
  const cur = fuelFor(month), prev = fuelFor(prevMonth);
  const delta = computeDelta(cur, prev);
  const diff = Math.abs(cur - prev);
  const prevMonthName = monthLabel(prevMonth).split(' ')[0];

  const headline = delta.dir === 'flat'
    ? 'Fuel spending is steady'
    : `Fuel spending is ${delta.dir === 'down' ? 'down' : 'up'} ${Math.abs(delta.pct).toFixed(0)}%`;
  const sub = delta.dir === 'flat'
    ? `No significant change vs ${prevMonthName}.`
    : `You spent ${fmtRM(diff)} ${delta.dir === 'down' ? 'less' : 'more'} on fuel compared to ${prevMonthName}.`;

  // The chart tracks the same metric as the headline above it (fuel) —
  // total spending would be dominated by one-off costs like an annual
  // insurance payment, drowning out the actual fuel trend being discussed.
  const series6 = useMemo(() => lastNMonthsAsc(6), []);
  const bars = series6.map(m => ({ key: m, label: monthLabel(m).split(' ')[0], total: fuelFor(m) }));
  // Round the axis ceiling up to a multiple of 300 so both the max and the
  // two intermediate gridlines (at 1/3 and 2/3) land on round numbers.
  const axisMax = Math.max(300, Math.ceil(Math.max(...bars.map(b => b.total), 1) / 300) * 300);

  return (
    <section className="gl-card">
      <SectionTitle icon={Lightbulb} title="Insights" action="Open analytics" onAction={onOpen} />
      <div className="gl-insight-split">
        <div className="gl-insight-callout">
          <span className={`gl-insight-icon ${delta.dir}`}>{delta.dir === 'down' ? <ArrowDownRight size={26}/> : delta.dir === 'up' ? <ArrowUpRight size={26}/> : <Minus size={26}/>}</span>
          <div>
            <b>{headline}</b>
            {delta.dir !== 'flat' && <span className="gl-insight-sub1">vs last month</span>}
            <span className="gl-insight-sub2">{sub}</span>
          </div>
        </div>
        <div className="gl-insight-chart">
          <div className="gl-insight-bars-label">Monthly Spending</div>
          <div className="gl-bar-chart">
            <div className="gl-bar-axis">
              <span>{fmtRM(axisMax)}</span>
              <span>{fmtRM(Math.round(axisMax * 2 / 3))}</span>
              <span>{fmtRM(Math.round(axisMax / 3))}</span>
              <span>RM 0</span>
            </div>
            <div className="gl-bar-plot-wrap">
              <div className="gl-bar-plot">
                {bars.map(b => {
                  const isActive = b.key === month;
                  return (
                    <div className="gl-bar-col" key={b.key}>
                      {isActive && <div className="gl-bar-tooltip">{fmtRM(b.total)}</div>}
                      <div className={`gl-bar ${isActive ? 'active' : ''}`} style={{ height: `${Math.max(3, (b.total / axisMax) * 100)}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="gl-bar-labels">{bars.map(b => <span key={b.key} className={b.key === month ? 'active' : ''}>{b.label}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GarageOverviewV2({ active, reminder, roadTax, insurance, schedule, onEditDocument, onService, onFuel, onExpense, onDocument, onHistory, onInsights, onEditRecord, onEditFuel, onEditExpense, onEditVehicle, onCarInfo }) {
  const month = todayISO().slice(0, 7);
  const prevMonth = prevMonthKey(month);

  return <div className="gl-overview-v2">
    <DashboardGreeting />
    <VehicleHero active={active} reminder={reminder} roadTax={roadTax} insurance={insurance} onEditVehicle={onEditVehicle} onCarInfo={onCarInfo} onNextService={onService} />
    <div className="gl-overview-grid">
      <div className="gl-main-column">
        <KpiRow active={active} month={month} prevMonth={prevMonth} />
        <UpcomingMaintenance active={active} schedule={schedule} roadTax={roadTax} insurance={insurance} onEditSchedule={onEditDocument} onLogService={onService} onViewAll={onHistory}/>
        <QuickActions onService={onService} onFuel={onFuel} onExpense={onExpense} onDocument={onDocument}/>
        <InsightsBar active={active} month={month} prevMonth={prevMonth} onOpen={onInsights}/>
      </div>
      <div className="gl-side-column">
        <CostBreakdown active={active} month={month} />
        <DocumentsPreview active={active} onEdit={onEditDocument}/>
        <RecentActivity active={active} onHistory={onHistory} onEditRecord={onEditRecord} onEditFuel={onEditFuel} onEditExpense={onEditExpense}/>
      </div>
    </div>
  </div>;
}
