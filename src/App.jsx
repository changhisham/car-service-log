import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Car } from 'lucide-react';
import { COLORS, ensureFonts } from './styles/theme';
import { useAuth } from './hooks/useAuth';
import { useVehicles } from './hooks/useVehicles';
import { calculateReminder, expiryStatus } from './domain/reminder';
import { calculateCostSummary } from './domain/cost';
import { Header } from './components/layout/Header';
import { SectionTabs } from './components/layout/SectionTabs';
import { VehicleTabs } from './components/vehicle/VehicleTabs';
import { VehicleHeroCard } from './components/vehicle/VehicleHeroCard';
import { VehicleForm } from './components/vehicle/VehicleForm';
import { CostSummaryCard } from './components/dashboard/CostSummaryCard';
import { MaintenanceScheduleCard } from './components/dashboard/MaintenanceScheduleCard';
import { ServiceTimeline } from './components/service/ServiceTimeline';
import { ServiceFilters, filterRecords } from './components/service/ServiceFilters';
import { RecordForm } from './components/service/RecordForm';
import { FuelLogList } from './components/fuel/FuelLogList';
import { FuelForm } from './components/fuel/FuelForm';
import { ExpenseList } from './components/expense/ExpenseList';
import { ExpenseForm } from './components/expense/ExpenseForm';
import { MaintenanceScheduleForm } from './components/maintenance/MaintenanceScheduleForm';
import { Modal } from './components/common/Modal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { PrimaryButton } from './components/common/PrimaryButton';
import { SkeletonLoader } from './components/common/SkeletonLoader';
import { Toast } from './components/common/Toast';
import LoginPage from './components/auth/LoginPage';

const SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'logbook', label: 'Logbook' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'expenses', label: 'Expenses' },
];

// Top-level: gate everything behind auth state. Garage (below) is only
// ever mounted once a real user is signed in, so useVehicles/storage.js
// can safely assume auth.currentUser exists.
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 480 }}>
        <SkeletonLoader />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Garage userEmail={user.email} />;
}

// Garage is page-level composition only: which modal/section is open, and
// wiring the useVehicles() hook's data into presentational components. All
// data loading/saving lives in hooks/useVehicles.js, all reminder/cost math
// lives in domain/, and every visual piece lives in components/.
function Garage({ userEmail }) {
  const {
    vehicles, activeId, setActiveId, active, saveState,
    addVehicle, saveEditedVehicle, deleteVehicle,
    addRecord, saveEditedRecord, deleteRecord,
    addFuelLog, saveEditedFuelLog, deleteFuelLog,
    addExpense, saveEditedExpense, deleteExpense,
    saveMaintenanceSchedule,
  } = useVehicles();

  const [section, setSection] = useState('overview');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [editFuel, setEditFuel] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [showManageSchedule, setShowManageSchedule] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // {kind, id}
  const [costView, setCostView] = useState('category');
  const [serviceFilters, setServiceFilters] = useState({ category: null, year: null, search: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => { ensureFonts(); }, []);
  useEffect(() => { setSection('overview'); setServiceFilters({ category: null, year: null, search: '' }); }, [activeId]);

  // Toast on save — a small confirmation beyond the header's SYNCED text.
  // Skips the very first "saved" that can fire right after initial load.
  const sawFirstSave = useRef(false);
  useEffect(() => {
    if (saveState === 'saved') {
      if (!sawFirstSave.current) { sawFirstSave.current = true; return; }
      setToast({ tone: 'ok', message: 'Saved' });
    } else if (saveState === 'error') {
      setToast({ tone: 'error', message: 'Sync failed — will retry' });
    }
  }, [saveState]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredRecords = useMemo(
    () => active ? filterRecords(active.records || [], serviceFilters) : [],
    [active, serviceFilters]
  );

  if (vehicles === null) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 480 }}>
        <SkeletonLoader />
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
      <Header active={active} saveState={saveState} userEmail={userEmail} />

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
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: COLORS.panel2, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
          }}>
            <Car size={26} color={COLORS.steelDim} />
          </div>
          <div style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: 18, color: COLORS.paper, textTransform: 'uppercase', marginBottom: 6 }}>Empty garage</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add your first vehicle to start logging services.</div>
          <PrimaryButton onClick={() => setShowAddVehicle(true)}>Add a vehicle</PrimaryButton>
        </div>
      ) : (
        <>
          <SectionTabs sections={SECTIONS} active={section} onSelect={setSection} />

          <div key={`${activeId}-${section}`} className="csl-fade-switch">
          {section === 'overview' && (
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
              <MaintenanceScheduleCard vehicle={active} onManage={() => setShowManageSchedule(true)} />
            </>
          )}

          {section === 'logbook' && (
            <>
              <CostSummaryCard costSummary={costSummary} costView={costView} setCostView={setCostView} />
              <ServiceFilters records={active.records || []} filters={serviceFilters} setFilters={setServiceFilters} />
              <ServiceTimeline
                records={filteredRecords}
                totalCount={(active.records || []).length}
                onAdd={() => setShowAddRecord(true)}
                onEditRecord={setEditRecord}
                onDeleteRecord={(id) => setConfirmDelete({ kind: 'record', id })}
              />
            </>
          )}

          {section === 'fuel' && (
            <FuelLogList
              vehicle={active}
              onAdd={() => setShowAddFuel(true)}
              onEdit={setEditFuel}
              onDelete={(id) => setConfirmDelete({ kind: 'fuel', id })}
            />
          )}

          {section === 'expenses' && (
            <ExpenseList
              expenses={active.expenses || []}
              onAdd={() => setShowAddExpense(true)}
              onEdit={setEditExpense}
              onDelete={(id) => setConfirmDelete({ kind: 'expense', id })}
            />
          )}
          </div>
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
      {showAddFuel && active && (
        <Modal title="Add fill-up" onClose={() => setShowAddFuel(false)}>
          <FuelForm currentOdo={active.odometer} onSave={(f) => { addFuelLog(f); setShowAddFuel(false); }} />
        </Modal>
      )}
      {editFuel && (
        <Modal title="Edit fill-up" onClose={() => setEditFuel(null)}>
          <FuelForm initial={editFuel} onSave={(f) => { saveEditedFuelLog(f); setEditFuel(null); }} />
        </Modal>
      )}
      {showAddExpense && (
        <Modal title="Add expense" onClose={() => setShowAddExpense(false)}>
          <ExpenseForm onSave={(e) => { addExpense(e); setShowAddExpense(false); }} />
        </Modal>
      )}
      {editExpense && (
        <Modal title="Edit expense" onClose={() => setEditExpense(null)}>
          <ExpenseForm initial={editExpense} onSave={(e) => { saveEditedExpense(e); setEditExpense(null); }} />
        </Modal>
      )}
      {showManageSchedule && active && (
        <Modal title="Manage schedule" onClose={() => setShowManageSchedule(false)} wide>
          <MaintenanceScheduleForm
            items={active.maintenanceSchedule || []}
            onSave={(items) => { saveMaintenanceSchedule(items); setShowManageSchedule(false); }}
          />
        </Modal>
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          kind={confirmDelete.kind}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.kind === 'vehicle') deleteVehicle(confirmDelete.id);
            else if (confirmDelete.kind === 'record') deleteRecord(confirmDelete.id);
            else if (confirmDelete.kind === 'fuel') deleteFuelLog(confirmDelete.id);
            else if (confirmDelete.kind === 'expense') deleteExpense(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      {toast && <Toast tone={toast.tone} message={toast.message} />}
    </div>
  );
}
