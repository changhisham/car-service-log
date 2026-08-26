import { typeMeta } from '../constants/serviceTypes';

export function calculateCostSummary(vehicle) {
  if (!vehicle) return { byCategory: [], byYear: [], total: 0 };
  const records = vehicle.records || [];
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
}
