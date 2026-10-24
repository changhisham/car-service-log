import React from 'react';
import { Car, Gauge, Calendar, ShieldCheck, AlertTriangle, Clock3, CircleCheck, HelpCircle, ChevronRight } from 'lucide-react';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate } from '../../utils/date';

function latestOdometerDate(vehicle) {
  const dates = [...(vehicle.records || []), ...(vehicle.fuelLogs || [])].map(x => x.date);
  return dates.length ? dates.reduce((a, b) => (b > a ? b : a)) : null;
}

function toneIcon(tone) {
  return tone === 'bad' ? AlertTriangle : tone === 'warn' ? Clock3 : CircleCheck;
}

// onNextService is optional — only the Overview hero wires it (to jump
// straight into logging a service); the Car Details page's own hero leaves
// it unset so that row stays a plain status display there.
export function CarDetailsHero({ active, reminder, roadTax, insurance, actions, onNextService }) {
  const serviceTone = !reminder?.known ? 'neutral' : reminder.overdue ? 'bad' : reminder.soon ? 'warn' : 'ok';
  const ServiceIcon = serviceTone === 'bad' ? AlertTriangle : serviceTone === 'warn' ? Clock3 : serviceTone === 'neutral' ? HelpCircle : CircleCheck;
  const lastOdoDate = latestOdometerDate(active);
  const pct = reminder?.known ? Math.max(0, Math.min(100, 100 - (reminder.kmLeft / (reminder.dueOdo - (active.lastServiceOdo ?? 0) || 1)) * 100)) : 0;
  const roadTaxTone = roadTax.tone === 'bad' ? 'bad' : roadTax.tone === 'warn' ? 'warn' : 'ok';
  const insuranceTone = insurance.tone === 'bad' ? 'bad' : insurance.tone === 'warn' ? 'warn' : 'ok';
  const RoadTaxStatusIcon = toneIcon(roadTaxTone);
  const InsuranceStatusIcon = toneIcon(insuranceTone);

  return (
    <section className={`gl-cd-hero ${actions ? 'has-actions' : ''}`}>
      <div className="gl-cd-hero-left">
        {active.photo ? <img className="gl-cd-hero-photo" src={active.photo} alt="" /> : <div className="gl-cd-hero-photo gl-cd-hero-photo-empty"><Car size={28} /></div>}
        <div className="gl-cd-hero-copy">
          <div className="gl-eyebrow">{active.brand || 'Vehicle'}</div>
          <h1>{active.model || 'Your vehicle'}</h1>
          <div className="gl-cd-plate-chip"><Car size={13} /> {active.plate}</div>
          <div className="gl-cd-odo"><Gauge size={13} /> Odometer</div>
          <div className="gl-cd-odo-value">{fmtKm(active.odometer)} km</div>
          <div className="gl-hero-updated">Last updated: {lastOdoDate ? fmtDate(lastOdoDate) : '—'}</div>
          {actions && <div className="gl-hero-actions">{actions}</div>}
        </div>
      </div>
      <div className="gl-cd-hero-stats">
        <div
          className={`gl-cd-stat primary ${serviceTone !== 'ok' ? serviceTone : ''} ${onNextService ? 'clickable' : ''}`}
          onClick={onNextService}
          role={onNextService ? 'button' : undefined}
          tabIndex={onNextService ? 0 : undefined}
        >
          <div className={`gl-status-icon ${serviceTone !== 'ok' ? serviceTone : ''}`}><ServiceIcon size={18} /></div>
          <div className="gl-cd-stat-body">
            <b>Next Service</b>
            <strong>{reminder?.known ? <>{fmtKm(Math.max(0, reminder.kmLeft))} <small>km remaining</small></> : 'Add service'}</strong>
            {reminder?.known && <div className="gl-cd-progress"><i style={{ width: `${pct}%` }} /></div>}
            {reminder?.known && <em className="gl-cd-stat-due-text">Due: {fmtDate(reminder.dueDate)} (est.)</em>}
          </div>
          <ChevronRight size={18} className="gl-cd-stat-chevron" />
        </div>
        <div className={`gl-cd-stat ${roadTaxTone !== 'ok' ? roadTaxTone : ''}`}>
          <span className="gl-cd-stat-icon"><Calendar size={18} /></span>
          <div><b>Road Tax</b>{active.roadTaxExpiry ? <><span>Valid until</span><em>{fmtDate(active.roadTaxExpiry)}</em></> : <span>Not set</span>}</div>
          <span className={`gl-cd-stat-status ${roadTaxTone}`}><RoadTaxStatusIcon size={12} /></span>
        </div>
        <div className={`gl-cd-stat ${insuranceTone !== 'ok' ? insuranceTone : ''}`}>
          <span className="gl-cd-stat-icon"><ShieldCheck size={18} /></span>
          <div><b>Insurance</b>{active.insuranceExpiry ? <><span>Valid until</span><em>{fmtDate(active.insuranceExpiry)}</em></> : <span>Not set</span>}</div>
          <span className={`gl-cd-stat-status ${insuranceTone}`}><InsuranceStatusIcon size={12} /></span>
        </div>
      </div>
    </section>
  );
}
