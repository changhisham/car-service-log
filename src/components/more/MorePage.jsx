import React from 'react';
import { Car, FileText, History, Wrench, BarChart3, Bell, Settings, HelpCircle, ChevronRight, Gauge } from 'lucide-react';
import { fmtKm } from '../../utils/format';

function MoreRow({ icon: Icon, title, desc, pill, onClick }) {
  return (
    <button className="gl-more-row" onClick={onClick}>
      <span className="gl-more-icon"><Icon size={18} /></span>
      <span className="gl-more-row-text"><b>{title}</b><small>{desc}</small></span>
      {pill != null && <span className="gl-more-pill">{pill}</span>}
      <ChevronRight size={16} className="gl-chevron" />
    </button>
  );
}

export function MorePage({ active, dueCount, onCarDetails, onDocuments, onComponentHistory, onServiceHistory, onInsights, onReminders, onSettings, onHelp }) {
  if (!active) return null;
  const title = [active.brand, active.model, active.profile?.trim].filter(Boolean).join(' ');

  return (
    <div className="gl-section-page gl-more-page">
      <div className="gl-page-heading"><div><h1>More</h1><p>Manage your vehicle and app</p></div></div>

      <button className="gl-more-vehicle" onClick={onCarDetails}>
        {active.photo ? <img className="gl-more-vehicle-photo" src={active.photo} alt="" /> : <div className="gl-more-vehicle-photo gl-more-vehicle-photo-empty"><Car size={22} /></div>}
        <div className="gl-more-vehicle-info">
          <b>{title || 'Your vehicle'}</b>
          <span className="gl-more-vehicle-plate"><Car size={12} /> {active.plate}</span>
          <span className="gl-more-vehicle-odo"><Gauge size={12} /> {fmtKm(active.odometer)} km</span>
        </div>
        <ChevronRight size={18} className="gl-chevron" />
      </button>

      <div className="gl-more-group">
        <div className="gl-more-group-label"><Car size={14} /> VEHICLE</div>
        <div className="gl-more-list">
          <MoreRow icon={Car} title="Car Details" desc="Specifications, tyres and parts" onClick={onCarDetails} />
          <MoreRow icon={FileText} title="Documents & Expiry" desc="Road tax, insurance and warranties" onClick={onDocuments} />
          <MoreRow icon={History} title="Component History" desc="Battery, tyres and replacement records" onClick={onComponentHistory} />
        </div>
      </div>

      <div className="gl-more-group">
        <div className="gl-more-group-label"><BarChart3 size={14} /> TRACKING &amp; REPORTS</div>
        <div className="gl-more-list">
          <MoreRow icon={Wrench} title="Service History" desc="All maintenance records" onClick={onServiceHistory} />
          <MoreRow icon={BarChart3} title="Insights & Reports" desc="Spending trends and vehicle costs" onClick={onInsights} />
          <MoreRow icon={Bell} title="Reminders" desc="Upcoming maintenance and renewals" pill={dueCount > 0 ? `${dueCount} due` : null} onClick={onReminders} />
        </div>
      </div>

      <div className="gl-more-group">
        <div className="gl-more-group-label"><Settings size={14} /> APP</div>
        <div className="gl-more-list">
          <MoreRow icon={Settings} title="Settings" desc="Preferences and data" onClick={onSettings} />
          <MoreRow icon={HelpCircle} title="Help & Support" desc="FAQs and contact" onClick={onHelp} />
        </div>
      </div>
    </div>
  );
}
