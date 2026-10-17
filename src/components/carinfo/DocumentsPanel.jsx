import React, { useRef, useState } from 'react';
import { FileStack, FileText, ShieldCheck, ClipboardCheck, Hash, ChevronRight, Paperclip, Upload, Loader2 } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { expiryStatus } from '../../domain/reminder';
import { fmtDate } from '../../utils/date';
import { compressImage } from '../../utils/image';

function StatusPill({ tone, text }) {
  const map = {
    ok: { bg: COLORS.greenDim, fg: COLORS.green },
    warn: { bg: COLORS.amberDim, fg: COLORS.amber },
    bad: { bg: COLORS.rustDim, fg: COLORS.rust },
    neutral: { bg: COLORS.panel2, fg: COLORS.steelDim },
  };
  const c = map[tone] || map.neutral;
  return <span style={{ background: c.bg, color: c.fg, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, flexShrink: 0 }}>{text}</span>;
}

// Road tax / insurance expiry stay on the top-level vehicle record (edited
// via Edit Vehicle, and used elsewhere for reminders) — this panel just
// displays them alongside the extra document fields that only live here.
export function DocumentsPanel({ active, onEdit, onSaveSection }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);
  const docs = active.documents || {};
  const roadTax = expiryStatus(active.roadTaxExpiry);
  const insurance = expiryStatus(active.insuranceExpiry);
  const inspection = expiryStatus(docs.inspectionExpiry);
  const attachments = docs.attachments || [];

  const rows = [
    { icon: FileText, label: 'Road tax', value: active.roadTaxExpiry ? fmtDate(active.roadTaxExpiry) : 'Not set', tone: active.roadTaxExpiry ? roadTax.tone : 'neutral', pill: active.roadTaxExpiry ? (roadTax.tone === 'ok' ? 'Valid' : roadTax.text) : 'N/A' },
    { icon: ShieldCheck, label: 'Insurance', value: active.insuranceExpiry ? fmtDate(active.insuranceExpiry) : 'Not set', tone: active.insuranceExpiry ? insurance.tone : 'neutral', pill: active.insuranceExpiry ? (insurance.tone === 'ok' ? 'Valid' : insurance.text) : 'N/A' },
    { icon: ClipboardCheck, label: 'Vehicle inspection (PUSPAKOM)', value: docs.inspectionExpiry ? fmtDate(docs.inspectionExpiry) : 'Not applicable', tone: docs.inspectionExpiry ? inspection.tone : 'neutral', pill: docs.inspectionExpiry ? (inspection.tone === 'ok' ? 'Valid' : inspection.text) : 'N/A' },
    { icon: Hash, label: 'Insurance policy number', value: docs.insurancePolicyNumber || 'Not provided', tone: 'neutral', pill: docs.insurancePolicyNumber ? null : null },
  ];

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const compressed = await Promise.all(Array.from(files).map(f => compressImage(f)));
      onSaveSection('documents', { ...docs, attachments: [...attachments, ...compressed] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="csl-card" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.rustDim, color: COLORS.rust, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileStack size={16} /></div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15.5, color: COLORS.paper }}>Documents & Expiry Dates</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: COLORS.steelDim }}>Important dates and vehicle documents</div>
          </div>
        </div>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: COLORS.blue, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', flexShrink: 0 }}>Edit</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
        {rows.map(r => {
          const Icon = r.icon;
          return (
            <button key={r.label} onClick={onEdit} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${COLORS.bg}`,
              background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
              width: '100%', textAlign: 'left', cursor: 'pointer'
            }}>
              <Icon size={15} color={COLORS.steelDim} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: COLORS.paper, fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 12.5, color: COLORS.steelDim, marginTop: 1 }}>{r.value}</div>
              </div>
              {r.pill && <StatusPill tone={r.tone} text={r.pill} />}
              <ChevronRight size={14} color={COLORS.line} />
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: 12,
        background: COLORS.bg, border: `1px dashed ${COLORS.line}`, borderRadius: 11
      }}>
        <Paperclip size={16} color={COLORS.steelDim} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.paper }}>Keep your important documents here</div>
          <div style={{ fontSize: 12, color: COLORS.steelDim, marginTop: 1 }}>
            {attachments.length > 0 ? `${attachments.length} attached · ` : ''}Upload insurance, road tax and vehicle documents for easy access.
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        <button onClick={() => inputRef.current.click()} disabled={busy} style={{
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, padding: '8px 13px', borderRadius: 9,
          border: `1px solid ${COLORS.green}`, background: 'transparent', color: COLORS.green, fontFamily: FONT_BODY,
          fontWeight: 700, fontSize: 12.5, cursor: 'pointer'
        }}>{busy ? <Loader2 size={14} className="csl-spin" /> : <Upload size={14} />} Upload</button>
      </div>
      {attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {attachments.map((src, i) => <img key={i} src={src} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${COLORS.line}` }} />)}
        </div>
      )}
    </div>
  );
}
