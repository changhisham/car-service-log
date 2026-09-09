import React from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Terminal } from 'lucide-react';
import { COLORS, FONT_BODY, FONT_DISPLAY } from '../../styles/theme';

export default function FirebaseSetupPage() {
  const steps = [
    'Copy .env.example to .env',
    'Open your Firebase Console and register a Web app',
    'Copy the six Firebase config values into .env',
    'Restart the Vite dev server',
  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.paper, fontFamily: FONT_BODY, padding: 24, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 620, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: COLORS.rustDim, color: COLORS.rust }}>
            <AlertTriangle size={25} />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 25, textTransform: 'uppercase' }}>Garage Log</div>
            <div style={{ color: COLORS.steel, fontSize: 13 }}>Firebase configuration is missing</div>
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, background: COLORS.rustDim, border: `1px solid ${COLORS.rust}55`, color: '#FFD2D2', fontSize: 13, lineHeight: 1.55, marginBottom: 22 }}>
          The application is running, but it cannot connect to Firebase yet. This screen replaces the previous blank-page failure and tells you exactly what to fix.
        </div>

        <div style={{ fontWeight: 700, marginBottom: 12 }}>Setup checklist</div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
          {steps.map((step, i) => (
            <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: COLORS.steel }}>
              <CheckCircle2 size={17} color={COLORS.blue} style={{ flexShrink: 0 }} />
              <span><b style={{ color: COLORS.paper }}>{i + 1}.</b> {step}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#0B1020', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 15, marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: COLORS.blue, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Terminal size={15} /> TERMINAL
          </div>
          <code style={{ color: COLORS.paper, fontSize: 12, lineHeight: 1.7 }}>
            cp .env.example .env<br />
            npm install<br />
            npm run dev
          </code>
        </div>

        <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: COLORS.blue, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          Open Firebase Console <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
