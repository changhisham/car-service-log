// Fuel economy is only meaningful between two consecutive FULL-TANK
// fill-ups — a partial fill understates consumption for that stretch.
// We compute one economy figure per full-to-full gap and average them.
export function calculateFuelStats(vehicle) {
  const logs = [...(vehicle?.fuelLogs || [])].sort((a, b) => a.date.localeCompare(b.date));
  if (logs.length === 0) {
    return { entries: [], segments: [], avgKmPerL: null, avgLPer100km: null, avgCostPerKm: null, totalSpent: 0, totalLitres: 0 };
  }

  const totalSpent = logs.reduce((sum, l) => sum + (l.totalCost || 0), 0);
  const totalLitres = logs.reduce((sum, l) => sum + (l.litres || 0), 0);

  const fullTankIndexes = logs.map((l, i) => l.fullTank ? i : -1).filter(i => i !== -1);
  const segments = [];
  for (let i = 1; i < fullTankIndexes.length; i++) {
    const prevIdx = fullTankIndexes[i - 1];
    const idx = fullTankIndexes[i];
    const km = logs[idx].odometer - logs[prevIdx].odometer;
    // litres used = everything logged after the previous full tank, up to and including this one
    const litres = logs.slice(prevIdx + 1, idx + 1).reduce((s, l) => s + (l.litres || 0), 0);
    const cost = logs.slice(prevIdx + 1, idx + 1).reduce((s, l) => s + (l.totalCost || 0), 0);
    if (km > 0 && litres > 0) {
      segments.push({
        fromDate: logs[prevIdx].date, toDate: logs[idx].date,
        km, litres, cost,
        kmPerL: km / litres,
        lPer100km: (litres / km) * 100,
        costPerKm: cost / km,
      });
    }
  }

  const avg = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;

  return {
    entries: logs,
    segments,
    avgKmPerL: avg(segments.map(s => s.kmPerL)),
    avgLPer100km: avg(segments.map(s => s.lPer100km)),
    avgCostPerKm: avg(segments.map(s => s.costPerKm)),
    totalSpent,
    totalLitres,
  };
}
