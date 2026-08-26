import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Car, Plus, X, Wrench, Droplet, ShieldCheck, Bell, Calendar,
  Camera, Trash2, Pencil, ChevronRight, Gauge, TrendingUp,
  AlertTriangle, CheckCircle2, Disc, Fuel, Battery, Settings2,
  ImageOff, Loader2
} from 'lucide-react';
import { storageGet, storageSet } from './storage';

/* ----------------------------------------------------------------
   Tokens
   Palette: workshop / logbook — charcoal + steel, amber caution,
   green ok, rust danger. Display face: condensed industrial.
   Body: clean grotesk. Data: mono, like an odometer readout.
------------------------------------------------------------------- */
const COLORS = {
  bg: '#15171A',
  panel: '#1D2024',
  panel2: '#24272C',
  line: '#33373D',
  steel: '#8A919C',
  steelDim: '#5C626B',
  paper: '#F0EEE9',
  amber: '#E8A33D',
  amberDim: '#4A3A22',
  green: '#5FAE7E',
  greenDim: '#243A2C',
  rust: '#D9694F',
  rustDim: '#3F2620',
  blue: '#6E9CC7',
};

const FONT_DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

const FONT_LINK_ID = 'csl-fonts';
function ensureFonts() {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}

/* ----------------------------------------------------------------
   Service type presets
------------------------------------------------------------------- */
const SERVICE_TYPES = [
  { key: 'oil', label: 'Engine oil change', icon: Droplet },
  { key: 'brake', label: 'Brake pad / disc', icon: Disc },
  { key: 'tire', label: 'Tyres', icon: Settings2 },
  { key: 'battery', label: 'Battery', icon: Battery },
  { key: 'aircon', label: 'Air-cond service', icon: Fuel },
  { key: 'general', label: 'General service', icon: Wrench },
  { key: 'other', label: 'Other', icon: Settings2 },
];
const typeMeta = (key) => SERVICE_TYPES.find(t => t.key === key) || SERVICE_TYPES[SERVICE_TYPES.length - 1];

const STORAGE_KEY = 'csl-data-v1';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtKm = (n) => (n === null || n === undefined || isNaN(n)) ? '—' : Number(n).toLocaleString('en-MY');
const fmtRM = (n) => `RM ${Number(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const daysBetween = (fromISO, toISO) => {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  return Math.round((b - a) / 86400000);
};
const addMonths = (iso, months) => {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

/* ----------------------------------------------------------------
   Image handling — resize/compress before storing (storage is
   text/JSON with a 5MB per-key cap, and it holds ALL app data)
------------------------------------------------------------------- */
function compressImage(file, maxDim = 640, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ----------------------------------------------------------------
   Odometer-style ring gauge — the signature element
------------------------------------------------------------------- */
function DueRing({ pct, size = 92, stroke = 9, color, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  const dash = c * clamped;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.line} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 600, color: COLORS.paper, lineHeight: 1 }}>{label}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: COLORS.steel, marginTop: 3, letterSpacing: 0.3 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Small UI atoms
------------------------------------------------------------------- */
function Badge({ tone, icon: Icon, children }) {
  const tones = {
    ok: { bg: COLORS.greenDim, fg: COLORS.green },
    warn: { bg: COLORS.amberDim, fg: COLORS.amber },
    bad: { bg: COLORS.rustDim, fg: COLORS.rust },
    neutral: { bg: COLORS.panel2, fg: COLORS.steel },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px',
      borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600,
      fontFamily: FONT_BODY, whiteSpace: 'nowrap'
    }}>
      {Icon && <Icon size={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

function IconButton({ icon: Icon, onClick, tone = 'default', size = 34, title }) {
  const bg = tone === 'danger' ? COLORS.rustDim : COLORS.panel2;
  const fg = tone === 'danger' ? COLORS.rust : COLORS.steel;
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: size, height: size, borderRadius: 10, border: `1px solid ${COLORS.line}`,
        background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0
      }}
    >
      <Icon size={16} strokeWidth={2.2} />
    </button>
  );
}

function TextField({ label, value, onChange, type = 'text', placeholder, suffix, required }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>
        {label}{required && <span style={{ color: COLORS.rust }}> *</span>}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 14,
            outline: 'none', paddingRight: suffix ? 42 : 12
          }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: COLORS.steelDim, fontSize: 12, fontFamily: FONT_MONO
          }}>{suffix}</span>
        )}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
          borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 14, outline: 'none'
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,11,13,0.72)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.panel, width: '100%', maxWidth: wide ? 560 : 440, maxHeight: '88vh',
          borderRadius: '20px 20px 0 0', border: `1px solid ${COLORS.line}`, borderBottom: 'none',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${COLORS.line}`
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: COLORS.paper, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
          <IconButton icon={X} onClick={onClose} />
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? '100%' : 'auto', background: disabled ? COLORS.steelDim : COLORS.amber,
        color: '#1A1408', border: 'none', borderRadius: 10, padding: '13px 20px',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}
    </button>
  );
}

function PhotoPicker({ photo, onPick, onClear }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);
  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onPick(dataUrl);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>Photo / receipt</div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])} />
      {photo ? (
        <div style={{ position: 'relative', width: 120, height: 90, borderRadius: 10, overflow: 'hidden' }}>
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={onClear} style={{
            position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: 7,
            background: 'rgba(10,11,13,0.75)', border: 'none', color: COLORS.paper, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><X size={13} /></button>
        </div>
      ) : (
        <button onClick={() => inputRef.current.click()} disabled={busy} style={{
          width: 120, height: 90, borderRadius: 10, border: `1px dashed ${COLORS.line}`, background: COLORS.bg,
          color: COLORS.steel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 11
        }}>
          {busy ? <Loader2 size={18} className="csl-spin" /> : <Camera size={18} />}
          {busy ? 'Processing…' : 'Add photo'}
        </button>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   Vehicle form (add / edit)
------------------------------------------------------------------- */
function VehicleForm({ initial, onSave, onClose }) {
  const [v, setV] = useState(() => initial ? {
    ...initial,
    brand: initial.brand || '',
    lastServiceDate: initial.lastServiceDate || '',
    lastServiceOdo: (initial.lastServiceOdo === null || initial.lastServiceOdo === undefined) ? '' : initial.lastServiceOdo,
  } : {
    id: uid(), plate: '', brand: '', model: '', year: '', color: '', odometer: '',
    photo: null, roadTaxExpiry: '', insuranceExpiry: '',
    intervalKm: 10000, intervalMonths: 6,
    lastServiceDate: '', lastServiceOdo: '',
  });
  const set = (k) => (val) => setV(s => ({ ...s, [k]: val }));
  const canSave = v.plate.trim() && v.brand.trim() && v.model.trim() && v.odometer !== '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PhotoPicker photo={v.photo} onPick={set('photo')} onClear={() => set('photo')(null)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Plate number" required value={v.plate} onChange={(s) => set('plate')(s.toUpperCase())} placeholder="WXY 1234" />
        <TextField label="Odometer" required type="number" value={v.odometer} onChange={set('odometer')} suffix="km" placeholder="78420" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Brand" required value={v.brand} onChange={set('brand')} placeholder="Perodua" />
        <TextField label="Model" required value={v.model} onChange={set('model')} placeholder="Myvi 1.5 AV" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Year" value={v.year} onChange={set('year')} placeholder="2021" />
        <TextField label="Colour" value={v.color} onChange={set('color')} placeholder="Putih Mutiara" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Road tax expiry" type="date" value={v.roadTaxExpiry} onChange={set('roadTaxExpiry')} />
        <TextField label="Insurance expiry" type="date" value={v.insuranceExpiry} onChange={set('insuranceExpiry')} />
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 10, fontWeight: 600 }}>
          Service reminder interval — due at whichever comes first
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Every" type="number" value={v.intervalKm} onChange={set('intervalKm')} suffix="km" />
          <TextField label="Or every" type="number" value={v.intervalMonths} onChange={set('intervalMonths')} suffix="months" />
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 4, fontWeight: 600 }}>
          Last service (optional)
        </div>
        <div style={{ fontSize: 11.5, color: COLORS.steelDim, marginBottom: 10, lineHeight: 1.5 }}>
          Used as the starting point for the next-service reminder until you log a service record in the app. Leave blank if unknown — the reminder will show as unavailable until you add one.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField label="Date" type="date" value={v.lastServiceDate} onChange={set('lastServiceDate')} />
          <TextField label="Odometer" type="number" value={v.lastServiceOdo} onChange={set('lastServiceOdo')} suffix="km" />
        </div>
      </div>
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(v)}>
        {initial ? 'Save changes' : 'Add vehicle'}
      </PrimaryButton>
    </div>
  );
}

/* ----------------------------------------------------------------
   Service record form (add / edit)
------------------------------------------------------------------- */
function RecordForm({ initial, currentOdo, onSave, onClose }) {
  const [r, setR] = useState(initial || {
    id: uid(), date: todayISO(), odometer: currentOdo || '', type: 'oil', cost: '', notes: '', photo: null,
  });
  const set = (k) => (val) => setR(s => ({ ...s, [k]: val }));
  const canSave = r.date && r.odometer !== '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Date" required type="date" value={r.date} onChange={set('date')} />
        <TextField label="Odometer" required type="number" value={r.odometer} onChange={set('odometer')} suffix="km" />
      </div>
      <SelectField label="Service type" value={r.type} onChange={set('type')}
        options={SERVICE_TYPES.map(t => ({ value: t.key, label: t.label }))} />
      <TextField label="Cost" type="number" value={r.cost} onChange={set('cost')} suffix="RM" placeholder="185" />
      <label style={{ display: 'block' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLORS.steel, marginBottom: 6, fontWeight: 600 }}>Notes</div>
        <textarea
          value={r.notes} onChange={(e) => set('notes')(e.target.value)} rows={3}
          placeholder="Workshop, parts used, anything worth remembering"
          style={{
            width: '100%', boxSizing: 'border-box', background: COLORS.bg, border: `1px solid ${COLORS.line}`,
            borderRadius: 9, padding: '10px 12px', color: COLORS.paper, fontFamily: FONT_BODY, fontSize: 14,
            outline: 'none', resize: 'vertical'
          }}
        />
      </label>
      <PhotoPicker photo={r.photo} onPick={set('photo')} onClear={() => set('photo')(null)} />
      <PrimaryButton full disabled={!canSave} onClick={() => onSave(r)}>
        {initial ? 'Save changes' : 'Add record'}
      </PrimaryButton>
    </div>
  );
}

/* ----------------------------------------------------------------
   Expiry status helper
------------------------------------------------------------------- */
function expiryStatus(iso) {
  if (!iso) return { tone: 'neutral', text: 'Not set' };
  const d = daysBetween(todayISO(), iso);
  if (d < 0) return { tone: 'bad', text: 'Expired' };
  if (d <= 30) return { tone: 'warn', text: `${d}d left` };
  return { tone: 'ok', text: 'Valid' };
}

/* ----------------------------------------------------------------
   Main App
------------------------------------------------------------------- */
export default function CarServiceLog() {
  const [vehicles, setVehicles] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // {kind, id}
  const [costView, setCostView] = useState('category'); // category | year

  useEffect(() => { ensureFonts(); }, []);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const res = await storageGet(STORAGE_KEY);
        const data = res ? JSON.parse(res.value) : { vehicles: [] };
        setVehicles(data.vehicles || []);
        setActiveId((data.vehicles && data.vehicles[0]) ? data.vehicles[0].id : null);
      } catch (e) {
        setVehicles([]);
      }
    })();
  }, []);

  // Save (debounced-ish via effect on vehicles change, skip initial load)
  const firstRun = useRef(true);
  useEffect(() => {
    if (vehicles === null) return;
    if (firstRun.current) { firstRun.current = false; return; }
    setSaveState('saving');
    const t = setTimeout(async () => {
      try {
        const result = await storageSet(STORAGE_KEY, JSON.stringify({ vehicles }));
        setSaveState(result ? 'saved' : 'error');
      } catch (e) {
        setSaveState('error');
      }
    }, 350);
    return () => clearTimeout(t);
  }, [vehicles]);

  const active = useMemo(() => (vehicles || []).find(v => v.id === activeId) || null, [vehicles, activeId]);

  const updateVehicle = (id, patch) => {
    setVehicles(vs => vs.map(v => v.id === id ? { ...v, ...patch } : v));
  };
  const addVehicle = (v) => {
    const clean = {
      ...v, odometer: Number(v.odometer) || 0, intervalKm: Number(v.intervalKm) || 10000, intervalMonths: Number(v.intervalMonths) || 6,
      lastServiceDate: v.lastServiceDate || '', lastServiceOdo: v.lastServiceOdo !== '' ? Number(v.lastServiceOdo) : null,
      records: [],
    };
    setVehicles(vs => [...(vs || []), clean]);
    setActiveId(clean.id);
    setShowAddVehicle(false);
  };
  const saveEditedVehicle = (v) => {
    updateVehicle(v.id, {
      ...v, odometer: Number(v.odometer) || 0, intervalKm: Number(v.intervalKm) || 10000, intervalMonths: Number(v.intervalMonths) || 6,
      lastServiceDate: v.lastServiceDate || '', lastServiceOdo: v.lastServiceOdo !== '' ? Number(v.lastServiceOdo) : null,
    });
    setEditVehicle(null);
  };
  const deleteVehicle = (id) => {
    setVehicles(vs => vs.filter(v => v.id !== id));
    setConfirmDelete(null);
    if (activeId === id) {
      const rest = (vehicles || []).filter(v => v.id !== id);
      setActiveId(rest[0] ? rest[0].id : null);
    }
  };

  const addRecord = (r) => {
    if (!active) return;
    const clean = { ...r, odometer: Number(r.odometer) || 0, cost: Number(r.cost) || 0 };
    const records = [...(active.records || []), clean].sort((a, b) => b.date.localeCompare(a.date));
    const newOdo = Math.max(active.odometer, clean.odometer);
    updateVehicle(active.id, { records, odometer: newOdo });
    setShowAddRecord(false);
  };
  const saveEditedRecord = (r) => {
    if (!active) return;
    const clean = { ...r, odometer: Number(r.odometer) || 0, cost: Number(r.cost) || 0 };
    const records = (active.records || []).map(x => x.id === r.id ? clean : x).sort((a, b) => b.date.localeCompare(a.date));
    updateVehicle(active.id, { records });
    setEditRecord(null);
  };
  const deleteRecord = (id) => {
    if (!active) return;
    updateVehicle(active.id, { records: (active.records || []).filter(r => r.id !== id) });
    setConfirmDelete(null);
  };

  // Reminder calc — baseline is: the most recent logged service record, else
  // the "last service" info entered when the vehicle was added, else unknown
  // (we never silently assume "serviced today" — that's what produced the
  // false "on track" reading for a freshly added car).
  const reminder = useMemo(() => {
    if (!active) return null;
    const records = active.records || [];
    const lastService = records[0] || null;
    const hasBaseline = !!lastService || (!!active.lastServiceDate && active.lastServiceOdo !== null && active.lastServiceOdo !== undefined);
    if (!hasBaseline) {
      return { known: false };
    }
    const baseOdo = lastService ? lastService.odometer : active.lastServiceOdo;
    const baseDate = lastService ? lastService.date : active.lastServiceDate;
    const dueOdo = baseOdo + Number(active.intervalKm || 10000);
    const dueDate = addMonths(baseDate, Number(active.intervalMonths || 6));
    const kmLeft = dueOdo - active.odometer;
    const daysLeft = daysBetween(todayISO(), dueDate);
    // whichever comes first drives the display
    const kmPct = active.odometer >= baseOdo ? (active.odometer - baseOdo) / Math.max(1, dueOdo - baseOdo) : 0;
    const timePct = 1 - (daysLeft / Math.max(1, Number(active.intervalMonths || 6) * 30));
    const byKm = kmLeft <= (daysLeft / 30) * (Number(active.intervalKm || 10000) / Math.max(1, Number(active.intervalMonths || 6)));
    const pct = byKm ? kmPct : timePct;
    const overdue = kmLeft <= 0 || daysLeft <= 0;
    const soon = !overdue && (kmLeft <= Number(active.intervalKm || 10000) * 0.15 || daysLeft <= 14);
    return { known: true, dueOdo, dueDate, kmLeft, daysLeft, pct, byKm, overdue, soon, fromRecord: !!lastService };
  }, [active]);

  // Cost summary
  const costSummary = useMemo(() => {
    if (!active) return { byCategory: [], byYear: [], total: 0 };
    const records = active.records || [];
    const byCategory = {};
    const byYear = {};
    let total = 0;
    records.forEach(r => {
      total += r.cost || 0;
      const cat = typeMeta(r.type).label;
      byCategory[cat] = (byCategory[cat] || 0) + (r.cost || 0);
      const yr = r.date.slice(0, 4);
      byYear[yr] = (byYear[yr] || 0) + (r.cost || 0);
    });
    return {
      total,
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
      byYear: Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0])),
    };
  }, [active]);

  if (vehicles === null) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 color={COLORS.steel} className="csl-spin" size={26} />
      </div>
    );
  }

  const roadTax = active ? expiryStatus(active.roadTaxExpiry) : null;
  const insurance = active ? expiryStatus(active.insuranceExpiry) : null;
  const ringColor = (!reminder || !reminder.known) ? COLORS.steel : reminder.overdue ? COLORS.rust : reminder.soon ? COLORS.amber : COLORS.green;

  return (
    <div style={{ background: COLORS.bg, minHeight: 480, fontFamily: FONT_BODY, color: COLORS.paper, paddingBottom: 32 }}>
      <style>{`
        .csl-spin { animation: csl-spin 0.9s linear infinite; }
        @keyframes csl-spin { to { transform: rotate(360deg); } }
        .csl-tab::-webkit-scrollbar { display: none; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        input::placeholder, textarea::placeholder { color: ${COLORS.steelDim}; }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 2px solid ${COLORS.blue}; outline-offset: 1px;
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation-duration: 0.01ms !important; } }
      `}</style>

      {/* Header */}
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

      {/* Vehicle tabs */}
      <div className="csl-tab" style={{
        display: 'flex', gap: 8, padding: '14px 18px', overflowX: 'auto', scrollbarWidth: 'none'
      }}>
        {(vehicles || []).map(v => (
          <button key={v.id} onClick={() => setActiveId(v.id)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
            borderRadius: 10, border: `1px solid ${v.id === activeId ? COLORS.amber : COLORS.line}`,
            background: v.id === activeId ? COLORS.amberDim : COLORS.panel,
            color: v.id === activeId ? COLORS.amber : COLORS.steel, cursor: 'pointer',
            fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5
          }}>
            <Car size={13} /> {v.plate}
          </button>
        ))}
        <button onClick={() => setShowAddVehicle(true)} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 10, border: `1px dashed ${COLORS.line}`, background: 'transparent',
          color: COLORS.steel, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 600
        }}>
          <Plus size={14} /> Add vehicle
        </button>
      </div>

      {!active ? (
        <div style={{
          margin: '30px 18px', padding: '40px 20px', textAlign: 'center', border: `1px dashed ${COLORS.line}`,
          borderRadius: 16, color: COLORS.steel
        }}>
          <Car size={30} style={{ opacity: 0.5, marginBottom: 10 }} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: COLORS.paper, textTransform: 'uppercase', marginBottom: 6 }}>Empty garage</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add your first vehicle to start logging services.</div>
          <PrimaryButton onClick={() => setShowAddVehicle(true)}>Add a vehicle</PrimaryButton>
        </div>
      ) : (
        <>
          {/* Vehicle hero card */}
          <div style={{ margin: '0 18px 16px', background: COLORS.panel, borderRadius: 18, border: `1px solid ${COLORS.line}`, overflow: 'hidden' }}>
            <div style={{
              padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14,
              background: active.photo ? `linear-gradient(135deg, rgba(21,23,26,0.55), rgba(21,23,26,0.85)), url(${active.photo}) center/cover` : `linear-gradient(135deg, #23361F, #182417)`
            }}>
              <div style={{
                background: COLORS.paper, color: '#1A1A1A', fontFamily: FONT_MONO, fontWeight: 700,
                fontSize: 17, letterSpacing: 2, padding: '7px 14px', borderRadius: 6, border: '2px solid #1A1A1A'
              }}>{active.plate}</div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                <IconButton icon={Pencil} onClick={() => setEditVehicle(active)} />
                <IconButton icon={Trash2} tone="danger" onClick={() => setConfirmDelete({ kind: 'vehicle', id: active.id })} />
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: COLORS.amber, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {active.brand || '—'}
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 21, textTransform: 'uppercase', marginTop: 1 }}>{active.model}</div>
                  <div style={{ fontSize: 12.5, color: COLORS.steel, marginTop: 2 }}>
                    {active.year ? `${active.year} · ` : ''}{active.color || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>{fmtKm(active.odometer)}</div>
                  <div style={{ fontSize: 10.5, color: COLORS.steelDim }}>km on the clock</div>
                </div>
              </div>

              {/* Reminder ring */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: COLORS.panel2,
                borderRadius: 14, marginBottom: 14
              }}>
                {reminder.known ? (
                  <>
                    <DueRing
                      pct={reminder.pct} color={ringColor}
                      label={reminder.overdue ? 'DUE' : reminder.byKm ? fmtKm(Math.max(0, reminder.kmLeft)) : `${Math.max(0, reminder.daysLeft)}d`}
                      sub={reminder.overdue ? 'now' : reminder.byKm ? 'km left' : 'left'}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Bell size={13} color={ringColor} />
                        <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, color: ringColor }}>
                          {reminder.overdue ? 'Service overdue' : reminder.soon ? 'Service due soon' : 'Service on track'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.steel, lineHeight: 1.5 }}>
                        Due by <b style={{ color: COLORS.paper }}>{fmtKm(reminder.dueOdo)} km</b> or <b style={{ color: COLORS.paper }}>{fmtDate(reminder.dueDate)}</b>, whichever comes first.
                        {!reminder.fromRecord && <span style={{ color: COLORS.steelDim }}> Based on the last-service info you entered — add a service record to keep this accurate.</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: 92, height: 92, borderRadius: '50%', border: `2px dashed ${COLORS.line}`, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Gauge size={26} color={COLORS.steelDim} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Bell size={13} color={COLORS.steel} />
                        <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, color: COLORS.steel }}>
                          Service status unknown
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.steel, lineHeight: 1.5 }}>
                        No last-service info yet, so the next-service date can't be worked out. Log a service record, or edit this vehicle to fill in when it was last serviced.
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge tone={roadTax.tone} icon={ShieldCheck}>Road tax: {roadTax.text}</Badge>
                <Badge tone={insurance.tone} icon={ShieldCheck}>Insurance: {insurance.text}</Badge>
              </div>
            </div>
          </div>

          {/* Cost summary */}
          <div style={{ margin: '0 18px 16px', background: COLORS.panel, borderRadius: 18, border: `1px solid ${COLORS.line}`, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color={COLORS.amber} />
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Spend</span>
              </div>
              <div style={{ display: 'flex', gap: 4, background: COLORS.bg, borderRadius: 8, padding: 3 }}>
                {['category', 'year'].map(v => (
                  <button key={v} onClick={() => setCostView(v)} style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: costView === v ? COLORS.panel2 : 'transparent',
                    color: costView === v ? COLORS.paper : COLORS.steelDim,
                    fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize'
                  }}>{v}</button>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 600, marginBottom: 14 }}>{fmtRM(costSummary.total)}
              <span style={{ fontSize: 11, color: COLORS.steelDim, fontFamily: FONT_BODY, marginLeft: 8 }}>all-time</span>
            </div>
            {(costView === 'category' ? costSummary.byCategory : costSummary.byYear).length === 0 ? (
              <div style={{ fontSize: 12.5, color: COLORS.steelDim }}>No service records yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(costView === 'category' ? costSummary.byCategory : costSummary.byYear).map(([label, amt]) => {
                  const max = Math.max(...(costView === 'category' ? costSummary.byCategory : costSummary.byYear).map(x => x[1]));
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: COLORS.steel }}>{label}</span>
                        <span style={{ fontFamily: FONT_MONO, color: COLORS.paper }}>{fmtRM(amt)}</span>
                      </div>
                      <div style={{ height: 6, background: COLORS.bg, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(amt / max) * 100}%`, background: COLORS.amber, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service history timeline */}
          <div style={{ margin: '0 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Logbook</span>
              <button onClick={() => setShowAddRecord(true)} style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                color: COLORS.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer'
              }}>
                <Plus size={14} /> Add record
              </button>
            </div>

            {(active.records || []).length === 0 ? (
              <div style={{
                padding: '28px 16px', textAlign: 'center', border: `1px dashed ${COLORS.line}`, borderRadius: 14, color: COLORS.steelDim, fontSize: 12.5
              }}>Nothing logged yet. Add the first service record.</div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 17, top: 6, bottom: 6, width: 2, background: COLORS.line }} />
                {(active.records || []).map((r) => {
                  const meta = typeMeta(r.type);
                  const Icon = meta.icon;
                  return (
                    <div key={r.id} style={{ display: 'flex', gap: 12, marginBottom: 12, position: 'relative' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: COLORS.panel2, border: `1px solid ${COLORS.line}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, color: COLORS.amber
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{
                        flex: 1, minWidth: 0, background: COLORS.panel, border: `1px solid ${COLORS.line}`,
                        borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{meta.label}</div>
                          <div style={{ fontSize: 11.5, color: COLORS.steel, fontFamily: FONT_MONO }}>
                            {fmtDate(r.date)} · {fmtKm(r.odometer)} km
                          </div>
                          {r.notes && <div style={{ fontSize: 12, color: COLORS.steelDim, marginTop: 5 }}>{r.notes}</div>}
                        </div>
                        {r.photo && <img src={r.photo} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 15 }}>{fmtRM(r.cost)}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                            <IconButton icon={Pencil} size={26} onClick={() => setEditRecord(r)} />
                            <IconButton icon={Trash2} size={26} tone="danger" onClick={() => setConfirmDelete({ kind: 'record', id: r.id })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showAddVehicle && (
        <Modal title="Add vehicle" onClose={() => setShowAddVehicle(false)}>
          <VehicleForm onSave={addVehicle} onClose={() => setShowAddVehicle(false)} />
        </Modal>
      )}
      {editVehicle && (
        <Modal title="Edit vehicle" onClose={() => setEditVehicle(null)}>
          <VehicleForm initial={editVehicle} onSave={saveEditedVehicle} onClose={() => setEditVehicle(null)} />
        </Modal>
      )}
      {showAddRecord && active && (
        <Modal title="Add service record" onClose={() => setShowAddRecord(false)}>
          <RecordForm currentOdo={active.odometer} onSave={addRecord} onClose={() => setShowAddRecord(false)} />
        </Modal>
      )}
      {editRecord && (
        <Modal title="Edit service record" onClose={() => setEditRecord(null)}>
          <RecordForm initial={editRecord} onSave={saveEditedRecord} onClose={() => setEditRecord(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Modal title={confirmDelete.kind === 'vehicle' ? 'Delete vehicle?' : 'Delete record?'} onClose={() => setConfirmDelete(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: COLORS.steel, fontSize: 13.5, lineHeight: 1.5 }}>
              <AlertTriangle size={18} color={COLORS.rust} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                {confirmDelete.kind === 'vehicle'
                  ? 'This removes the vehicle and its entire service history. This cannot be undone.'
                  : 'This removes the service record permanently. This cannot be undone.'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, border: `1px solid ${COLORS.line}`,
                background: 'transparent', color: COLORS.paper, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13.5, cursor: 'pointer'
              }}>Cancel</button>
              <button
                onClick={() => confirmDelete.kind === 'vehicle' ? deleteVehicle(confirmDelete.id) : deleteRecord(confirmDelete.id)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: COLORS.rust, color: '#1A0E0A', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, cursor: 'pointer'
                }}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
