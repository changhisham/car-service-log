import { Droplet, Disc, CircleDot, Battery, Snowflake, Wrench, Settings2 } from 'lucide-react';

export const SERVICE_TYPES = [
  { key: 'oil', label: 'Engine oil change', icon: Droplet },
  { key: 'brake', label: 'Brake pad / disc', icon: Disc },
  { key: 'tire', label: 'Tyres', icon: CircleDot },
  { key: 'battery', label: 'Battery', icon: Battery },
  { key: 'aircon', label: 'Air-cond service', icon: Snowflake },
  { key: 'general', label: 'General service', icon: Wrench },
  { key: 'other', label: 'Other', icon: Settings2 },
];

export const typeMeta = (key) =>
  SERVICE_TYPES.find(t => t.key === key) || SERVICE_TYPES[SERVICE_TYPES.length - 1];
