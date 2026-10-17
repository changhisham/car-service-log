import { BadgeCheck, Disc3, Cog, FileStack, Wrench, NotebookText } from 'lucide-react';

// Drives both the read-only display cards and the per-section edit forms
// on the Car Info page. Each section is its own object on the vehicle
// (vehicle[key]) so one section can be filled in without touching the
// others. Fields already living top-level on the vehicle (brand, model,
// plate, year, color, odometer, roadTaxExpiry, insuranceExpiry — all
// edited via the existing Edit Vehicle form) are deliberately left out
// here to avoid a second, conflicting place to edit the same value.
export const CAR_INFO_SECTIONS = [
  {
    key: 'profile',
    title: 'Vehicle Profile',
    description: 'Essential identification information',
    icon: BadgeCheck,
    tone: 'green',
    fields: [
      { key: 'trim', label: 'Variant / Trim', placeholder: 'e.g. 1.8L E' },
      { key: 'registrationDate', label: 'Registration date', type: 'date' },
      { key: 'vin', label: 'VIN / Chassis number' },
      { key: 'engineNumber', label: 'Engine number' },
    ],
  },
  {
    key: 'tyres',
    title: 'Tyre & Wheel Specifications',
    description: 'Useful when replacing tyres or wheels',
    icon: Disc3,
    tone: 'amber',
    fields: [
      { key: 'tyreSize', label: 'Tyre size', placeholder: 'e.g. 215/55 R17' },
      { key: 'frontPsi', label: 'Front tyre pressure', suffix: 'PSI', type: 'number' },
      { key: 'rearPsi', label: 'Rear tyre pressure', suffix: 'PSI', type: 'number' },
      { key: 'wheelSize', label: 'Wheel / rim size', placeholder: 'e.g. 17 x 7J' },
      { key: 'spareTyreSize', label: 'Spare tyre size' },
      { key: 'spareTyreType', label: 'Spare tyre type', placeholder: 'Full-size / Temporary' },
      { key: 'tyreBrand', label: 'Tyre brand & model (installed)' },
      { key: 'tyreInstallDate', label: 'Date installed', type: 'date' },
      { key: 'tyreInstallOdo', label: 'Mileage at installation', suffix: 'km', type: 'number' },
    ],
  },
  {
    key: 'engineSpecs',
    title: 'Engine & Mechanical Specifications',
    description: 'Helps identify compatible fluids and parts',
    icon: Cog,
    tone: 'green',
    fields: [
      { key: 'engineCapacity', label: 'Engine capacity', placeholder: 'e.g. 1.8L' },
      { key: 'engineType', label: 'Engine type' },
      { key: 'fuelType', label: 'Fuel type', placeholder: 'Petrol / Diesel / Hybrid' },
      { key: 'transmission', label: 'Transmission type' },
      { key: 'oilGrade', label: 'Engine oil grade', placeholder: 'e.g. 0W-20' },
      { key: 'oilCapacity', label: 'Engine oil capacity', suffix: 'L' },
      { key: 'coolantSpec', label: 'Coolant specification' },
      { key: 'brakeFluidSpec', label: 'Brake fluid specification' },
      { key: 'batterySpec', label: 'Battery specification' },
      { key: 'airFilterPartNo', label: 'Air filter part number' },
      { key: 'cabinFilterPartNo', label: 'Cabin filter part number' },
    ],
  },
  {
    key: 'documents',
    title: 'Documents & Expiry Dates',
    description: 'Important for ownership and renewal reminders',
    icon: FileStack,
    tone: 'red',
    note: 'Road tax and insurance expiry dates are set from Edit Vehicle — only the extra details below live here.',
    fields: [
      { key: 'insuranceProvider', label: 'Insurance provider' },
      { key: 'insurancePolicyNumber', label: 'Insurance policy number' },
      { key: 'inspectionExpiry', label: 'Vehicle inspection expiry', type: 'date' },
    ],
    hasAttachments: true,
  },
  {
    key: 'parts',
    title: 'Parts & Components',
    description: 'Track replacement parts and their compatibility',
    icon: Wrench,
    tone: 'amber',
    fields: [
      { key: 'batteryBrand', label: 'Battery brand & model' },
      { key: 'batterySize', label: 'Battery size' },
      { key: 'batteryInstallDate', label: 'Battery installation date', type: 'date' },
      { key: 'wiperBladeSize', label: 'Wiper blade sizes' },
      { key: 'headlightBulbType', label: 'Headlight bulb type' },
      { key: 'sparkPlugSpec', label: 'Spark plug specification' },
      { key: 'brakePadPartNo', label: 'Brake pad part number' },
      { key: 'brakeDiscPartNo', label: 'Brake disc part number' },
      { key: 'customParts', label: 'Other custom parts & accessories', multiline: true },
    ],
  },
  {
    key: 'ownership',
    title: 'Ownership & Notes',
    description: 'Personal information that helps with long-term tracking',
    icon: NotebookText,
    tone: 'green',
    fields: [
      { key: 'purchaseDate', label: 'Purchase date', type: 'date' },
      { key: 'purchasePrice', label: 'Purchase price', suffix: 'RM', type: 'number' },
      { key: 'previousOwner', label: 'Previous owner / purchase source' },
      { key: 'warrantyDetails', label: 'Warranty details' },
      { key: 'warrantyExpiry', label: 'Warranty expiry', type: 'date' },
      { key: 'preferredWorkshop', label: 'Preferred workshop' },
      { key: 'workshopContact', label: 'Workshop contact number' },
      { key: 'modifications', label: 'Modifications / accessories', multiline: true },
      { key: 'notes', label: 'General notes', multiline: true },
    ],
  },
];
