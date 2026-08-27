import { ShieldCheck, FileText, Disc, MapPin, ArrowLeftRight, Sparkles, Package, MoreHorizontal, Wrench } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { key: 'insurance', label: 'Insurance', icon: ShieldCheck },
  { key: 'road_tax', label: 'Road tax', icon: FileText },
  { key: 'tyre', label: 'Tyres', icon: Disc },
  { key: 'parking', label: 'Parking', icon: MapPin },
  { key: 'toll', label: 'Toll', icon: ArrowLeftRight },
  { key: 'car_wash', label: 'Car wash', icon: Sparkles },
  { key: 'accessories', label: 'Accessories', icon: Package },
  { key: 'repair', label: 'Repair', icon: Wrench },
  { key: 'other', label: 'Other', icon: MoreHorizontal },
];

export const expenseCategoryMeta = (key) =>
  EXPENSE_CATEGORIES.find(c => c.key === key) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
