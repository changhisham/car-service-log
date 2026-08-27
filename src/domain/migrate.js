// Upgrades a vehicle object from the pre-Phase-2 shape to the current
// shape, non-destructively. Old fields are left in place (harmless) —
// the app just reads the new fields going forward. Runs on every read
// so it's always safe to call, whether the vehicle is old or new.
import { DEFAULT_MAINTENANCE_ITEMS } from '../constants/maintenanceItems';
import { uid } from '../utils/format';

export function migrateVehicle(v) {
  if (!v) return v;
  const out = { ...v };

  if (!Array.isArray(out.maintenanceSchedule)) {
    out.maintenanceSchedule = DEFAULT_MAINTENANCE_ITEMS.map(item => ({
      id: uid(),
      key: item.key,
      label: item.label,
      intervalKm: item.intervalKm,
      intervalMonths: item.intervalMonths,
      lastDate: '',
      lastOdo: null,
    }));
  }

  if (!Array.isArray(out.fuelLogs)) out.fuelLogs = [];
  if (!Array.isArray(out.expenses)) out.expenses = [];

  // Old: single `photo` per record. New: `photos` array (supports multiple).
  out.records = (out.records || []).map(r => {
    if (Array.isArray(r.photos)) return r;
    return { ...r, photos: r.photo ? [r.photo] : [] };
  });

  return out;
}
