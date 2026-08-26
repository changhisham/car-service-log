import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../styles/theme';

export function Header({ active, saveState }) {
  return (
    <div style={{ padding: '20px 18px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, fontWeight: 600, letterSpacing: 0.3 }}>GARAGE LOG</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
            {active ? (active.brand || active.model || 'Vehicle') : 'No vehicle'}
          </div>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: saveState === 'error' ? COLORS.rust : COLORS.steelDim, display: 'flex', alignItems: 'center', gap: 5 }}>
          {saveState === 'saving' && <>SYNCING<Loader2 size={11} className="csl-spin" /></>}
          {saveState === 'saved' && <>SYNCED <CheckCircle2 size={12} color={COLORS.green} /></>}
          {saveState === 'error' && <>SYNC FAILED</>}
        </div>
      </div>
    </div>
  );
}
