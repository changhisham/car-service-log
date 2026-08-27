// Default schedule seeded onto every new vehicle. These are typical
// intervals — the user edits them per vehicle via "Manage schedule".
export const DEFAULT_MAINTENANCE_ITEMS = [
  { key: 'engine_oil', label: 'Engine oil', intervalKm: 10000, intervalMonths: 6 },
  { key: 'oil_filter', label: 'Oil filter', intervalKm: 10000, intervalMonths: 6 },
  { key: 'air_filter', label: 'Air filter', intervalKm: 20000, intervalMonths: 12 },
  { key: 'cabin_filter', label: 'Cabin filter', intervalKm: 20000, intervalMonths: 12 },
  { key: 'brake_fluid', label: 'Brake fluid', intervalKm: 40000, intervalMonths: 24 },
  { key: 'coolant', label: 'Coolant', intervalKm: 40000, intervalMonths: 24 },
];
