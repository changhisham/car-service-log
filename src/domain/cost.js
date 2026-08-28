import { typeMeta } from '../constants/serviceTypes';

export function calculateCostSummary(vehicle) {
  if (!vehicle) return { byCategory: [], byYear: [], byMonth: [], total: 0 };
  const records = vehicle.records || [];
  const byCategory = {};
  const byYear = {};
  const byMonthMap = {};
  let total = 0;
  records.forEach(r => {
    total += r.cost || 0;
    const cat = typeMeta(r.type).label;
    byCategory[cat] = (byCategory[cat] || 0) + (r.cost || 0);
    const yr = r.date.slice(0, 4);
    byYear[yr] = (byYear[yr] || 0) + (r.cost || 0);
    const month = r.date.slice(0, 7); // YYYY-MM
    byMonthMap[month] = (byMonthMap[month] || 0) + (r.cost || 0);
  });

  // Last 6 months, zero-filled, chronological — so a quiet month reads as
  // a real gap in the trend rather than just vanishing from the chart.
  const now = new Date();
  const byMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'short' });
    byMonth.push({ key, label, total: byMonthMap[key] || 0 });
  }

  return {
    total,
    byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
    byYear: Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0])),
    byMonth,
  };
}

