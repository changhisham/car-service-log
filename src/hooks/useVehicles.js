import { useState, useEffect, useRef, useMemo } from 'react';
import { storageGet, storageSet, storageGetCached } from '../storage';
import { migrateVehicle } from '../domain/migrate';
import { DEFAULT_MAINTENANCE_ITEMS } from '../constants/maintenanceItems';
import { RECORD_TYPE_TO_SCHEDULE_KEY } from '../domain/maintenanceSchedule';
import { uid } from '../utils/format';

const STORAGE_KEY = 'csl-data-v1';

// Parsed once, used to seed both the vehicles and activeId initial state
// below so a returning user's first render already has real data instead
// of the loading skeleton.
function readCachedVehicles() {
  const cached = storageGetCached(STORAGE_KEY);
  if (!cached) return null;
  try {
    const data = JSON.parse(cached.value);
    return (data.vehicles || []).map(migrateVehicle);
  } catch (e) {
    return null;
  }
}

// Owns loading, debounced saving, and all vehicle/record/fuel/expense CRUD.
// The UI components don't know or care that this is backed by Firestore —
// they just get data and functions.
export function useVehicles() {
  const [vehicles, setVehicles] = useState(() => readCachedVehicles()); // null = nothing cached yet, still loading
  const [activeId, setActiveId] = useState(() => {
    const cached = readCachedVehicles();
    return cached && cached[0] ? cached[0].id : null;
  });
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  // Load — always runs, even when the cache above already rendered
  // something, so the on-screen data gets confirmed/refreshed from the
  // server. A transient fetch failure keeps whatever's already showing
  // (cached or otherwise) rather than wiping it to an empty garage.
  // suppressSave marks the next vehicles change as "just loaded, not a
  // real edit" so the save effect below doesn't immediately write the
  // data straight back to Firestore right after reading it.
  const suppressSave = useRef(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await storageGet(STORAGE_KEY);
        const data = res ? JSON.parse(res.value) : { vehicles: [] };
        const migrated = (data.vehicles || []).map(migrateVehicle);
        suppressSave.current = true;
        setVehicles(migrated);
        setActiveId(prev => (prev && migrated.some(v => v.id === prev)) ? prev : (migrated[0] ? migrated[0].id : null));
      } catch (e) {
        setVehicles(prev => (prev === null ? [] : prev));
      }
    })();
  }, []);

  // Save (debounced-ish via effect on vehicles change, skip loads)
  useEffect(() => {
    if (vehicles === null) return;
    if (suppressSave.current) { suppressSave.current = false; return; }
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
      fuelLogs: [],
      expenses: [],
      maintenanceSchedule: DEFAULT_MAINTENANCE_ITEMS.map(item => ({
        id: uid(), key: item.key, label: item.label,
        intervalKm: item.intervalKm, intervalMonths: item.intervalMonths,
        lastDate: '', lastOdo: null,
      })),
    };
    setVehicles(vs => [...(vs || []), clean]);
    setActiveId(clean.id);
  };

  const saveEditedVehicle = (v) => {
    updateVehicle(v.id, {
      ...v, odometer: Number(v.odometer) || 0, intervalKm: Number(v.intervalKm) || 10000, intervalMonths: Number(v.intervalMonths) || 6,
      lastServiceDate: v.lastServiceDate || '', lastServiceOdo: v.lastServiceOdo !== '' ? Number(v.lastServiceOdo) : null,
    });
  };

  const deleteVehicle = (id) => {
    setVehicles(vs => vs.filter(v => v.id !== id));
    if (activeId === id) {
      const rest = (vehicles || []).filter(v => v.id !== id);
      setActiveId(rest[0] ? rest[0].id : null);
    }
  };

  // --- Service records ---------------------------------------------------

  // If a record's type matches a maintenance schedule item (e.g. an "oil"
  // record matches the "engine_oil" schedule item), bump that item's
  // baseline automatically so the schedule stays current without a
  // separate manual step.
  const applyRecordToSchedule = (vehicle, record) => {
    const scheduleKey = RECORD_TYPE_TO_SCHEDULE_KEY[record.type];
    if (!scheduleKey) return vehicle.maintenanceSchedule || [];
    return (vehicle.maintenanceSchedule || []).map(item =>
      item.key === scheduleKey ? { ...item, lastDate: record.date, lastOdo: record.odometer } : item
    );
  };

  const addRecord = (r) => {
    if (!active) return;
    const clean = { ...r, odometer: Number(r.odometer) || 0, cost: Number(r.cost) || 0, photos: r.photos || [] };
    const records = [...(active.records || []), clean].sort((a, b) => b.date.localeCompare(a.date));
    const newOdo = Math.max(active.odometer, clean.odometer);
    const maintenanceSchedule = applyRecordToSchedule(active, clean);
    updateVehicle(active.id, { records, odometer: newOdo, maintenanceSchedule });
  };

  const saveEditedRecord = (r) => {
    if (!active) return;
    const clean = { ...r, odometer: Number(r.odometer) || 0, cost: Number(r.cost) || 0, photos: r.photos || [] };
    const records = (active.records || []).map(x => x.id === r.id ? clean : x).sort((a, b) => b.date.localeCompare(a.date));
    const newOdo = Math.max(active.odometer, clean.odometer);
    updateVehicle(active.id, { records, odometer: newOdo });
  };

  const deleteRecord = (id) => {
    if (!active) return;
    updateVehicle(active.id, { records: (active.records || []).filter(r => r.id !== id) });
  };

  // --- Fuel logs -----------------------------------------------------------

  const addFuelLog = (f) => {
    if (!active) return;
    const clean = { ...f, odometer: Number(f.odometer) || 0, litres: Number(f.litres) || 0, pricePerLitre: Number(f.pricePerLitre) || 0, totalCost: Number(f.totalCost) || 0 };
    const fuelLogs = [...(active.fuelLogs || []), clean].sort((a, b) => b.date.localeCompare(a.date));
    const newOdo = Math.max(active.odometer, clean.odometer);
    updateVehicle(active.id, { fuelLogs, odometer: newOdo });
  };

  const saveEditedFuelLog = (f) => {
    if (!active) return;
    const clean = { ...f, odometer: Number(f.odometer) || 0, litres: Number(f.litres) || 0, pricePerLitre: Number(f.pricePerLitre) || 0, totalCost: Number(f.totalCost) || 0 };
    const fuelLogs = (active.fuelLogs || []).map(x => x.id === f.id ? clean : x).sort((a, b) => b.date.localeCompare(a.date));
    const newOdo = Math.max(active.odometer, clean.odometer);
    updateVehicle(active.id, { fuelLogs, odometer: newOdo });
  };

  const deleteFuelLog = (id) => {
    if (!active) return;
    updateVehicle(active.id, { fuelLogs: (active.fuelLogs || []).filter(f => f.id !== id) });
  };

  // --- Expenses --------------------------------------------------------------

  const addExpense = (e) => {
    if (!active) return;
    const clean = { ...e, amount: Number(e.amount) || 0 };
    const expenses = [...(active.expenses || []), clean].sort((a, b) => b.date.localeCompare(a.date));
    updateVehicle(active.id, { expenses });
  };

  const saveEditedExpense = (e) => {
    if (!active) return;
    const clean = { ...e, amount: Number(e.amount) || 0 };
    const expenses = (active.expenses || []).map(x => x.id === e.id ? clean : x).sort((a, b) => b.date.localeCompare(a.date));
    updateVehicle(active.id, { expenses });
  };

  const deleteExpense = (id) => {
    if (!active) return;
    updateVehicle(active.id, { expenses: (active.expenses || []).filter(e => e.id !== id) });
  };

  // --- Maintenance schedule ---------------------------------------------------

  const saveMaintenanceSchedule = (items) => {
    if (!active) return;
    updateVehicle(active.id, { maintenanceSchedule: items });
  };

  // --- Car Info sections --------------------------------------------------
  // Each section (profile, tyres, engineSpecs, documents, parts, ownership)
  // is its own object on the vehicle, saved independently so filling in
  // one doesn't require touching the others.

  const saveCarInfoSection = (sectionKey, data) => {
    if (!active) return;
    updateVehicle(active.id, { [sectionKey]: data });
  };

  return {
    vehicles, activeId, setActiveId, active, saveState,
    addVehicle, saveEditedVehicle, deleteVehicle,
    addRecord, saveEditedRecord, deleteRecord,
    addFuelLog, saveEditedFuelLog, deleteFuelLog,
    addExpense, saveEditedExpense, deleteExpense,
    saveMaintenanceSchedule,
    saveCarInfoSection,
  };
}
