import { useState, useEffect, useRef, useMemo } from 'react';
import { storageGet, storageSet } from '../storage';

const STORAGE_KEY = 'csl-data-v1';

// Owns loading, debounced saving, and all vehicle/record CRUD. The UI
// components below don't know or care that this is backed by Firestore —
// they just get data and functions.
export function useVehicles() {
  const [vehicles, setVehicles] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

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

  const addRecord = (r) => {
    if (!active) return;
    const clean = { ...r, odometer: Number(r.odometer) || 0, cost: Number(r.cost) || 0 };
    const records = [...(active.records || []), clean].sort((a, b) => b.date.localeCompare(a.date));
    const newOdo = Math.max(active.odometer, clean.odometer);
    updateVehicle(active.id, { records, odometer: newOdo });
  };

  const saveEditedRecord = (r) => {
    if (!active) return;
    const clean = { ...r, odometer: Number(r.odometer) || 0, cost: Number(r.cost) || 0 };
    const records = (active.records || []).map(x => x.id === r.id ? clean : x).sort((a, b) => b.date.localeCompare(a.date));
    updateVehicle(active.id, { records });
  };

  const deleteRecord = (id) => {
    if (!active) return;
    updateVehicle(active.id, { records: (active.records || []).filter(r => r.id !== id) });
  };

  return {
    vehicles, activeId, setActiveId, active, saveState,
    addVehicle, saveEditedVehicle, deleteVehicle,
    addRecord, saveEditedRecord, deleteRecord,
  };
}
