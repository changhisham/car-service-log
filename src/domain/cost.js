import { typeMeta } from '../constants/serviceTypes';
import { expenseCategoryMeta } from '../constants/expenseCategories';

// Last 6 months, zero-filled, chronological — so a quiet month reads as
// a real gap in the trend rather than just vanishing from the chart.
function fillLast6Months(byMonthMap) {
  const now = new Date();
  const byMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'short' });
    byMonth.push({ key, label, total: byMonthMap[key] || 0 });
  }
  return byMonth;
}

function summarize(entries) {
  const byCategory = {};
  const byYear = {};
  const byMonthMap = {};
  let total = 0;
  entries.forEach(({ date, cost, category }) => {
    total += cost;
    byCategory[category] = (byCategory[category] || 0) + cost;
    byYear[date.slice(0, 4)] = (byYear[date.slice(0, 4)] || 0) + cost;
    const month = date.slice(0, 7); // YYYY-MM
    byMonthMap[month] = (byMonthMap[month] || 0) + cost;
  });
  return {
    total,
    byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
    byYear: Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0])),
    byMonth: fillLast6Months(byMonthMap),
  };
}

// Service records only — powers the Service History page, where "cost"
// should mean workshop/parts spend, not the vehicle's total running cost.
export function calculateCostSummary(vehicle) {
  if (!vehicle) return { byCategory: [], byYear: [], byMonth: [], total: 0 };
  const entries = (vehicle.records || []).map(r => ({ date: r.date, cost: r.cost || 0, category: typeMeta(r.type).label }));
  return summarize(entries);
}

// Service records + fuel + other expenses — the full cost of owning the
// car, for the Insights/analytics page.
export function calculateOwnershipCostSummary(vehicle) {
  if (!vehicle) return { byCategory: [], byYear: [], byMonth: [], total: 0 };
  const entries = [
    ...(vehicle.records || []).map(r => ({ date: r.date, cost: r.cost || 0, category: typeMeta(r.type).label })),
    ...(vehicle.fuelLogs || []).map(f => ({ date: f.date, cost: f.totalCost || 0, category: 'Fuel' })),
    ...(vehicle.expenses || []).map(e => ({ date: e.date, cost: e.amount || 0, category: expenseCategoryMeta(e.category).label })),
  ];
  return summarize(entries);
}
