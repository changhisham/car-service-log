import React from 'react';
import { Car, Gauge, FileText, ShieldCheck, AlertTriangle, Clock3, CircleCheck, HelpCircle } from 'lucide-react';
import { fmtKm, fmtRM } from '../../utils/format';
import { fmtDate } from '../../utils/date';

function latestOdometerDate(vehicle) {
  const dates = [...(vehicle.records || []), ...(vehicle.fuelLogs || [])].map(x => x.date);
  return dates.length ? dates.reduce((a, b) => (b > a ? b : a)) : null;
}

export function CarDetailsHero({ active, reminder, roadTax, insurance }) {
  const serviceTone = !reminder?.known ? 'neutral' : reminder.overdue ? 'bad' : reminder.soon ? 'warn' : 'ok';
  const ServiceIcon = serviceTone === 'bad' ? AlertTriangle : serviceTone === 'warn' ? Clock3 : serviceTone === 'neutral' ? HelpCircle : CircleCheck;
  const lastOdoDate = latestOdometerDate(active);
  const pct = reminder?.known ? Math.max(0, Math.min(100, 100 - (reminder.kmLeft / (reminder.dueOdo - (active.lastServiceOdo ?? 0) || 1)) * 100)) : 0;

  return (
    <section className="gl-cd-hero">
      <div className="gl-cd-hero-left">
        {active.photo ? <img className="gl-cd-hero-photo" src={active.photo} alt="" /> : <div className="gl-cd-hero-photo gl-cd-hero-photo-empty"><Car size={28} /></div>}
        <div className="gl-cd-hero-copy">
          <div className="gl-eyebrow">{active.brand || 'Vehicle'}</div>
          <h1>{active.model || 'Your vehicle'}</h1>
          <div className="gl-hero-meta"><Car size={13} /> {active.plate}<span className="gl-hero-dot">·</span><Gauge size={13} /> {fmtKm(active.odometer)} km</div>
          <div className="gl-hero-updated">Last updated: {lastOdoDate ? fmtDate(lastOdoDate) : '—'}</div>
        </div>
      </div>
      <div className="gl-cd-hero-stats">
        <div className={`gl-cd-stat primary ${serviceTone !== 'ok' ? serviceTone : ''}`}>
          <div className={`gl-status-icon ${serviceTone !== 'ok' ? serviceTone : ''}`}><ServiceIcon size={18} /></div>
          <div className="gl-cd-stat-body">
            <b>Next service</b>
            <strong>{reminder?.known ? <>{fmtKm(Math.max(0, reminder.kmLeft))} <small>km remaining</small></> : 'Add service'}</strong>
            {reminder?.known && <div className="gl-cd-progress"><i style={{ width: `${pct}%` }} /></div>}
          </div>
        </div>
        <div className={`gl-cd-stat ${roadTax.tone === 'bad' ? 'bad' : roadTax.tone === 'warn' ? 'warn' : ''}`}>
          <FileText size={18} />
          <div><b>Road tax</b><span>{active.roadTaxExpiry ? `Valid until ${fmtDate(active.roadTaxExpiry)}` : 'Not set'}</span></div>
        </div>
        <div className={`gl-cd-stat ${insurance.tone === 'bad' ? 'bad' : insurance.tone === 'warn' ? 'warn' : ''}`}>
          <ShieldCheck size={18} />
          <div><b>Insurance</b><span>{active.insuranceExpiry ? `Valid until ${fmtDate(active.insuranceExpiry)}` : 'Not set'}</span></div>
        </div>
      </div>
    </section>
  );
}
