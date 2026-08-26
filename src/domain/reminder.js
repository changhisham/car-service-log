import { todayISO, daysBetween, addMonths } from '../utils/date';

export function expiryStatus(iso) {
  if (!iso) return { tone: 'neutral', text: 'Not set' };
  const d = daysBetween(todayISO(), iso);
  if (d < 0) return { tone: 'bad', text: 'Expired' };
  if (d <= 30) return { tone: 'warn', text: `${d}d left` };
  return { tone: 'ok', text: 'Valid' };
}

// Baseline is: the most recent logged service record, else the
// "last service" info entered when the vehicle was added, else unknown.
// We never silently assume "serviced today" — that produced a false
// "on track" reading for a freshly added car.
export function calculateReminder(vehicle) {
  if (!vehicle) return null;
  const records = vehicle.records || [];
  const lastService = records[0] || null;
  const hasBaseline = !!lastService || (!!vehicle.lastServiceDate && vehicle.lastServiceOdo !== null && vehicle.lastServiceOdo !== undefined);
  if (!hasBaseline) {
    return { known: false };
  }
  const baseOdo = lastService ? lastService.odometer : vehicle.lastServiceOdo;
  const baseDate = lastService ? lastService.date : vehicle.lastServiceDate;
  const dueOdo = baseOdo + Number(vehicle.intervalKm || 10000);
  const dueDate = addMonths(baseDate, Number(vehicle.intervalMonths || 6));
  const kmLeft = dueOdo - vehicle.odometer;
  const daysLeft = daysBetween(todayISO(), dueDate);
  // whichever comes first drives the display
  const kmPct = vehicle.odometer >= baseOdo ? (vehicle.odometer - baseOdo) / Math.max(1, dueOdo - baseOdo) : 0;
  const timePct = 1 - (daysLeft / Math.max(1, Number(vehicle.intervalMonths || 6) * 30));
  const byKm = kmLeft <= (daysLeft / 30) * (Number(vehicle.intervalKm || 10000) / Math.max(1, Number(vehicle.intervalMonths || 6)));
  const pct = byKm ? kmPct : timePct;
  const overdue = kmLeft <= 0 || daysLeft <= 0;
  const soon = !overdue && (kmLeft <= Number(vehicle.intervalKm || 10000) * 0.15 || daysLeft <= 14);
  return { known: true, dueOdo, dueDate, kmLeft, daysLeft, pct, byKm, overdue, soon, fromRecord: !!lastService };
}
