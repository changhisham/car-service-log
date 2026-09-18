import React from 'react';
import { User, LogOut, Info, Palette, Bell as BellIcon } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_MONO } from '../../styles/theme';
import { signOutUser } from '../../auth';

function Row({ icon: Icon, label, value, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: `1px solid ${COLORS.line}` }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: COLORS.blueDim, border: `1px solid ${COLORS.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: COLORS.blue
      }}>
        <Icon size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: COLORS.steelDim, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 700 }}>{label}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14.5, color: COLORS.paper, marginTop: 2, wordBreak: 'break-all' }}>{value}</div>
      </div>
      {action}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="gl-card">
      <div className="gl-section-title">
        <div className="gl-section-heading"><span>{title}</span></div>
      </div>
      {children}
    </section>
  );
}

export function SettingsPage({ userEmail }) {
  return (
    <div className="gl-section-page">
      <div className="gl-page-heading">
        <div>
          <span>Settings</span>
          <h1>App settings</h1>
          <p>Your account, appearance, and app info.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionCard title="Account">
          <Row icon={User} label="Signed in as" value={userEmail || 'Unknown'} action={
            <button
              onClick={() => signOutUser()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${COLORS.line}`,
                borderRadius: 8, padding: '8px 12px', color: COLORS.rust, fontFamily: FONT_BODY, fontWeight: 700,
                fontSize: 12.5, cursor: 'pointer', flexShrink: 0
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          } />
        </SectionCard>

        <SectionCard title="Appearance">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: `1px solid ${COLORS.line}` }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: COLORS.blueDim, border: `1px solid ${COLORS.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: COLORS.blue
            }}>
              <Palette size={17} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14.5, fontWeight: 700, color: COLORS.paper }}>Emerald &amp; Ink</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.steelDim, marginTop: 2 }}>The current color theme. More themes are on the roadmap.</div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#16302A', '#059669', '#D4A94A'].map(c => (
                <span key={c} style={{ width: 18, height: 18, borderRadius: 6, background: c, border: `1px solid ${COLORS.line}` }} />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          <Row icon={BellIcon} label="Reminders" value="Overdue services, road tax and insurance expiry are shown on Overview and in the Reminders list." />
        </SectionCard>

        <SectionCard title="About">
          <Row icon={Info} label="Version" value="Garage Log v2.1.0" />
          <div style={{ fontSize: 12, color: COLORS.steelDim, fontFamily: FONT_MONO, lineHeight: 1.6, paddingTop: 14 }}>
            © 2026 Garage Log. A garage-logbook app for tracking service history, fuel, expenses, and reminders across your vehicles.
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
