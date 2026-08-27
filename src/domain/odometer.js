// We don't store a separate "odometer readings" collection — every
// service record and fuel log already carries an odometer + date, so
// the history is derived from those, sorted chronologically.
export function getOdometerHistory(vehicle) {
  if (!vehicle) return [];
  const fromRecords = (vehicle.records || []).map(r => ({ date: r.date, odometer: r.odometer, source: 'service' }));
  const fromFuel = (vehicle.fuelLogs || []).map(l => ({ date: l.date, odometer: l.odometer, source: 'fuel' }));
  return [...fromRecords, ...fromFuel]
    .filter(e => e.odometer !== null && e.odometer !== undefined && !isNaN(e.odometer) && e.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Rough average monthly/yearly mileage from the logged history.
export function estimateMileageRate(vehicle) {
  const history = getOdometerHistory(vehicle);
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const days = Math.max(1, (new Date(last.date + 'T00:00:00') - new Date(first.date + 'T00:00:00')) / 86400000);
  const km = last.odometer - first.odometer;
  if (km <= 0) return null;
  return {
    perMonth: Math.round((km / days) * 30),
    perYear: Math.round((km / days) * 365),
  };
}
