import React, { useEffect, useState } from 'react';
import { Car, Plus, Loader2 } from 'lucide-react';
import { COLORS, ensureFonts } from './styles/theme';
import { useVehicles } from './hooks/useVehicles';
import { calculateReminder, expiryStatus } from './domain/reminder';
import { calculateCostSummary } from './domain/cost';
import { Header } from './components/layout/Header';
import { VehicleTabs } from './components/vehicle/VehicleTabs';
import { VehicleHeroCard } from './components/vehicle/VehicleHeroCard';
import { VehicleForm } from './components/vehicle/VehicleForm';
import { CostSummaryCard } from './components/dashboard/CostSummaryCard';
import { ServiceTimeline } from './components/service/ServiceTimeline';
import { RecordForm } from './components/service/RecordForm';
import { Modal } from './components/common/Modal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { PrimaryButton } from './components/common/PrimaryButton';

// App.jsx is now just page-level composition: it owns which modal is open
// and which cost-view tab is selected, and wires the useVehicles() hook's
// data into the presentational components. All data loading/saving lives
// in hooks/useVehicles.js, all reminder/cost math lives in domain/, and
// every visual piece lives in components/.
export default function CarServiceLog() {
  const {
    vehicles, activeId, setActiveId, active, saveState,
    addVehicle, saveEditedVehicle, deleteVehicle,
    addRecord, saveEditedRecord, deleteRecord,
  } = useVehicles();

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // {kind, id}
  const [costView, setCostView] = useState('category');

  useEffect(() => { ensureFonts(); }, []);

  if (vehicles === null) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 color={COLORS.steel} className="csl-spin" size={26} />
      </div>
    );
  }

  const reminder = calculateReminder(active);
  const costSummary = calculateCostSummary(active);
  const roadTax = active ? expiryStatus(active.roadTaxExpiry) : null;
  const insurance = active ? expiryStatus(active.insuranceExpiry) : null;
  const ringColor = (!reminder || !reminder.known) ? COLORS.steel : reminder.overdue ? COLORS.rust : reminder.soon ? COLORS.amber : COLORS.green;

  return (
    <div style={{ background: COLORS.bg, minHeight: 480, fontFamily: "'Inter', -apple-system, sans-serif", color: COLORS.paper, paddingBottom: 32 }}>
      <Header active={active} saveState={saveState} />

      <VehicleTabs
        vehicles={vehicles}
        activeId={activeId}
        onSelect={setActiveId}
        onAdd={() => setShowAddVehicle(true)}
      />

      {!active ? (
        <div style={{
          margin: '30px 18px', padding: '40px 20px', textAlign: 'center', border: `1px dashed ${COLORS.line}`,
          borderRadius: 16, color: COLORS.steel
        }}>
          <Car size={30} style={{ opacity: 0.5, marginBottom: 10 }} />
          <div style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: 18, color: COLORS.paper, textTransform: 'uppercase', marginBottom: 6 }}>Empty garage</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add your first vehicle to start logging services.</div>
          <PrimaryButton onClick={() => setShowAddVehicle(true)}>Add a vehicle</PrimaryButton>
        </div>
      ) : (
        <>
          <VehicleHeroCard
            active={active}
            reminder={reminder}
            ringColor={ringColor}
            roadTax={roadTax}
            insurance={insurance}
            onEdit={() => setEditVehicle(active)}
            onDelete={() => setConfirmDelete({ kind: 'vehicle', id: active.id })}
          />

          <CostSummaryCard costSummary={costSummary} costView={costView} setCostView={setCostView} />

          <ServiceTimeline
            records={active.records || []}
            onAdd={() => setShowAddRecord(true)}
            onEditRecord={setEditRecord}
            onDeleteRecord={(id) => setConfirmDelete({ kind: 'record', id })}
          />
        </>
      )}

      {/* Modals */}
      {showAddVehicle && (
        <Modal title="Add vehicle" onClose={() => setShowAddVehicle(false)}>
          <VehicleForm onSave={(v) => { addVehicle(v); setShowAddVehicle(false); }} />
        </Modal>
      )}
      {editVehicle && (
        <Modal title="Edit vehicle" onClose={() => setEditVehicle(null)}>
          <VehicleForm initial={editVehicle} onSave={(v) => { saveEditedVehicle(v); setEditVehicle(null); }} />
        </Modal>
      )}
      {showAddRecord && active && (
        <Modal title="Add service record" onClose={() => setShowAddRecord(false)}>
          <RecordForm currentOdo={active.odometer} onSave={(r) => { addRecord(r); setShowAddRecord(false); }} />
        </Modal>
      )}
      {editRecord && (
        <Modal title="Edit service record" onClose={() => setEditRecord(null)}>
          <RecordForm initial={editRecord} onSave={(r) => { saveEditedRecord(r); setEditRecord(null); }} />
        </Modal>
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          kind={confirmDelete.kind}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.kind === 'vehicle') deleteVehicle(confirmDelete.id);
            else deleteRecord(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
