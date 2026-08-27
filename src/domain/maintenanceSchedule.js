import { todayISO, daysBetween, addMonths } from '../utils/date';

// Same "whichever comes first" logic as domain/reminder.js's calculateReminder,
// but per named maintenance item (oil, brake fluid, air filter, ...) instead of
// one global interval. The hero card's single ring (domain/reminder.js) is left
// untouched — this powers a separate, itemized schedule panel.
export function calculateItemStatus(item, vehicle) {
  const hasBaseline = !!item.lastDate && item.lastOdo !== null && item.lastOdo !== undefined && item.lastOdo !== '';
  if (!hasBaseline) {
    return { ...item, known: false };
  }
  const baseOdo = Number(item.lastOdo);
  const baseDate = item.lastDate;
  const dueOdo = baseOdo + Number(item.intervalKm || 10000);
  const dueDate = addMonths(baseDate, Number(item.intervalMonths || 6));
  const kmLeft = dueOdo - vehicle.odometer;
  const daysLeft = daysBetween(todayISO(), dueDate);
  const overdue = kmLeft <= 0 || daysLeft <= 0;
  const soon = !overdue && (kmLeft <= Number(item.intervalKm || 10000) * 0.15 || daysLeft <= 14);
  return { ...item, known: true, dueOdo, dueDate, kmLeft, daysLeft, overdue, soon };
}

export function calculateSchedule(vehicle) {
  const items = vehicle?.maintenanceSchedule || [];
  return items.map(item => calculateItemStatus(item, vehicle));
}

// If a service record's type matches an item's key (e.g. "oil" record vs.
// the "engine_oil" schedule item), applying it updates that item's baseline
// automatically instead of requiring a separate manual "mark as done" step.
export const RECORD_TYPE_TO_SCHEDULE_KEY = {
  oil: 'engine_oil',
  brake: 'brake_fluid',
  tire: null,
  battery: null,
  aircon: null,
  general: null,
  other: null,
};
