import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Car, Bell, Settings, Info, ArrowLeft, Wrench, Fuel, Receipt, X } from 'lucide-react';
import { COLORS, ensureFonts } from './styles/theme';
import { useAuth } from './hooks/useAuth';
import { useVehicles } from './hooks/useVehicles';
import { calculateReminder, expiryStatus } from './domain/reminder';
import { calculateCostSummary } from './domain/cost';
import { calculateSchedule } from './domain/maintenanceSchedule';
import { TopBarV2 } from './components/layout/TopBarV2';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNavV2 } from './components/layout/MobileBottomNavV2';
import { GarageOverviewV2 } from './components/dashboard/GarageOverviewV2';
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
import { SettingsPage } from './components/settings/SettingsPage';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { PrimaryButton } from './components/common/PrimaryButton';
import { SkeletonLoader } from './components/common/SkeletonLoader';
import { Toast } from './components/common/Toast';
import LoginPage from './components/auth/LoginPage';
import { signOutUser } from './auth';
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
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [costView, setCostView] = useState('category');
  const [serviceFilters, setServiceFilters] = useState({ category: null, year: null, search: '' });
  const [toast, setToast] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => { ensureFonts(); }, []);
  useEffect(() => { setSection('overview'); setServiceFilters({ category: null, year: null, search: '' }); }, [activeId]);

  const sawFirstSave = useRef(false);
  useEffect(() => {
    if (saveState === 'saved') {
      if (!sawFirstSave.current) { sawFirstSave.current = true; return; }
      setToast({ tone: 'ok', message: 'Saved' });
    } else if (saveState === 'error') setToast({ tone: 'error', message: 'Sync failed — will retry' });
  }, [saveState]);
  useEffect(() => { if (!toast) return; const t=setTimeout(()=>setToast(null),1800); return ()=>clearTimeout(t); }, [toast]);

  const filteredRecords = useMemo(() => active ? filterRecords(active.records || [], serviceFilters) : [], [active, serviceFilters]);

  if (vehicles === null) return <div className="gl-loading"><SkeletonLoader /></div>;

  const reminder = calculateReminder(active);
  const costSummary = calculateCostSummary(active);
  const schedule = calculateSchedule(active);
  const roadTax = active ? expiryStatus(active.roadTaxExpiry) : { tone:'neutral', text:'Not set' };
  const insurance = active ? expiryStatus(active.insuranceExpiry) : { tone:'neutral', text:'Not set' };

  const selectSection = (next) => setSection(next);

  const addQuick = () => setShowQuickAdd(true);

  return (
    <div className="gl-app-shell">
      <Sidebar section={section} vehicles={vehicles} activeId={activeId} onSelect={selectSection} onVehicle={setActiveId} onAddVehicle={()=>setShowAddVehicle(true)} onSettings={()=>setSection('settings')} onReminders={()=>setShowManageSchedule(true)} saveState={saveState} userEmail={userEmail} />
      <div className="gl-app-main">
        <TopBarV2 vehicles={vehicles} activeId={activeId} onVehicle={setActiveId} onAddVehicle={()=>setShowAddVehicle(true)} />
        <main className="gl-content">
          {section === 'settings' ? (
            <SettingsPage userEmail={userEmail} />
          ) : active ? (
            <>
              {section === 'overview' && <GarageOverviewV2
                active={active} reminder={reminder} roadTax={roadTax} insurance={insurance} costSummary={costSummary} schedule={schedule}
                onEditVehicle={()=>setEditVehicle(active)} onManageSchedule={()=>setShowManageSchedule(true)} onEditDocument={()=>setEditVehicle(active)}
                onService={()=>setShowAddRecord(true)} onFuel={()=>setShowAddFuel(true)} onExpense={()=>setShowAddExpense(true)} onDocument={()=>setEditVehicle(active)} onHistory={()=>setSection('logbook')}
              />}
              {section === 'logbook' && <div className="gl-section-page"><div className="gl-page-heading"><div><span>Maintenance</span><h1>Service history</h1><p>Every service record, cost and mileage in one timeline.</p></div></div><CostSummaryCard costSummary={costSummary} costView={costView} setCostView={setCostView}/><ServiceFilters records={active.records || []} filters={serviceFilters} setFilters={setServiceFilters}/><ServiceTimeline records={filteredRecords} totalCount={(active.records || []).length} onAdd={()=>setShowAddRecord(true)} onEditRecord={setEditRecord} onDeleteRecord={(id)=>setConfirmDelete({kind:'record',id})}/></div>}
              {section === 'fuel' && <div className="gl-section-page"><div className="gl-page-heading"><div><span>Fuel</span><h1>Fuel tracking</h1><p>Track fill-ups, consumption and fuel costs.</p></div><button className="gl-primary" onClick={()=>setShowAddFuel(true)}>+ Add fill-up</button></div><FuelLogList vehicle={active} onAdd={()=>setShowAddFuel(true)} onEdit={setEditFuel} onDelete={(id)=>setConfirmDelete({kind:'fuel',id})}/></div>}
              {section === 'expenses' && <div className="gl-section-page"><div className="gl-page-heading"><div><span>Expenses</span><h1>Vehicle expenses</h1><p>Keep every ownership cost organized.</p></div><button className="gl-primary" onClick={()=>setShowAddExpense(true)}>+ Add expense</button></div><ExpenseList expenses={active.expenses || []} onAdd={()=>setShowAddExpense(true)} onEdit={setEditExpense} onDelete={(id)=>setConfirmDelete({kind:'expense',id})}/></div>}
              {section === 'insights' && <div className="gl-section-page"><div className="gl-page-heading"><div><span>Insights</span><h1>Ownership analytics</h1><p>A clearer view of how your car costs and performs over time.</p></div></div><CostSummaryCard costSummary={costSummary} costView="trend" setCostView={()=>{}}/><div className="gl-analytics-grid"><div className="gl-analytics-card"><span>Total mileage</span><strong>{active.odometer?.toLocaleString() || 0} km</strong><small>Current odometer</small></div><div className="gl-analytics-card"><span>Service records</span><strong>{active.records?.length || 0}</strong><small>Logged services</small></div><div className="gl-analytics-card"><span>Fuel logs</span><strong>{active.fuelLogs?.length || 0}</strong><small>Fill-ups recorded</small></div><div className="gl-analytics-card"><span>Tracked spend</span><strong>RM {(costSummary.total || 0).toLocaleString()}</strong><small>Service costs</small></div></div></div>}
              {section === 'history' && <div className="gl-section-page"><div className="gl-page-heading"><div><span>History</span><h1>Vehicle timeline</h1><p>Your complete maintenance history.</p></div></div><ServiceTimeline records={active.records || []} totalCount={(active.records || []).length} onAdd={()=>setShowAddRecord(true)} onEditRecord={setEditRecord} onDeleteRecord={(id)=>setConfirmDelete({kind:'record',id})}/></div>}
            </>
          ) : <div className="gl-empty"><Car size={36}/><h2>Your garage is empty</h2><p>Add your first vehicle to start logging services, fuel and expenses.</p><PrimaryButton onClick={()=>setShowAddVehicle(true)}>Add a vehicle</PrimaryButton></div>}
        </main>
        <MobileBottomNavV2 section={section} onSelect={selectSection} onAdd={addQuick} onSignOut={()=>signOutUser()}/>
      </div>

      {showQuickAdd && <div className="gl-quickadd-backdrop" onClick={()=>setShowQuickAdd(false)}><div className="gl-quickadd-menu" onClick={e=>e.stopPropagation()}>
        <button className="gl-quickadd-item" onClick={()=>{setShowQuickAdd(false);setShowAddRecord(true)}}><i><Wrench size={14}/></i>Add service</button>
        <button className="gl-quickadd-item" onClick={()=>{setShowQuickAdd(false);setShowAddFuel(true)}}><i><Fuel size={14}/></i>Add fill-up</button>
        <button className="gl-quickadd-item" onClick={()=>{setShowQuickAdd(false);setShowAddExpense(true)}}><i><Receipt size={14}/></i>Add expense</button>
      </div></div>}

      {showAddVehicle && <Modal title="Add vehicle" subtitle="A few details to start tracking it" icon={Car} twoCol onClose={()=>setShowAddVehicle(false)}><VehicleForm onSave={v=>{addVehicle(v);setShowAddVehicle(false)}} onCancel={()=>setShowAddVehicle(false)}/></Modal>}
      {editVehicle && <Modal title="Edit vehicle" subtitle={`${editVehicle.plate} · ${editVehicle.model || 'Vehicle'}`} icon={Car} twoCol onClose={()=>setEditVehicle(null)}><VehicleForm initial={editVehicle} onSave={v=>{saveEditedVehicle(v);setEditVehicle(null)}} onCancel={()=>setEditVehicle(null)}/></Modal>}
      {showAddRecord && active && <Modal title="Add service record" subtitle="Engine oil, brakes, tyres and more" icon={Wrench} twoCol onClose={()=>setShowAddRecord(false)}><RecordForm currentOdo={active.odometer} onSave={r=>{addRecord(r);setShowAddRecord(false)}} onCancel={()=>setShowAddRecord(false)}/></Modal>}
      {editRecord && <Modal title="Edit service record" subtitle="Engine oil, brakes, tyres and more" icon={Wrench} twoCol onClose={()=>setEditRecord(null)}><RecordForm initial={editRecord} onSave={r=>{saveEditedRecord(r);setEditRecord(null)}} onCancel={()=>setEditRecord(null)}/></Modal>}
      {showAddFuel && active && <Modal title="Add fill-up" subtitle="Log litres, price and mileage" icon={Fuel} onClose={()=>setShowAddFuel(false)}><FuelForm currentOdo={active.odometer} onSave={f=>{addFuelLog(f);setShowAddFuel(false)}} onCancel={()=>setShowAddFuel(false)}/></Modal>}
      {editFuel && <Modal title="Edit fill-up" subtitle="Log litres, price and mileage" icon={Fuel} onClose={()=>setEditFuel(null)}><FuelForm initial={editFuel} onSave={f=>{saveEditedFuelLog(f);setEditFuel(null)}} onCancel={()=>setEditFuel(null)}/></Modal>}
      {showAddExpense && <Modal title="Add expense" subtitle="Parking, tolls, road tax and more" icon={Receipt} onClose={()=>setShowAddExpense(false)}><ExpenseForm onSave={e=>{addExpense(e);setShowAddExpense(false)}} onCancel={()=>setShowAddExpense(false)}/></Modal>}
      {editExpense && <Modal title="Edit expense" subtitle="Parking, tolls, road tax and more" icon={Receipt} onClose={()=>setEditExpense(null)}><ExpenseForm initial={editExpense} onSave={e=>{saveEditedExpense(e);setEditExpense(null)}} onCancel={()=>setEditExpense(null)}/></Modal>}
      {showManageSchedule && active && <Modal title="Manage schedule" subtitle="Per-item service intervals" icon={Settings} onClose={()=>setShowManageSchedule(false)} wide><MaintenanceScheduleForm items={active.maintenanceSchedule || []} onSave={items=>{saveMaintenanceSchedule(items);setShowManageSchedule(false)}} onCancel={()=>setShowManageSchedule(false)}/></Modal>}
      {confirmDelete && <ConfirmDeleteModal kind={confirmDelete.kind} onCancel={()=>setConfirmDelete(null)} onConfirm={()=>{if(confirmDelete.kind==='vehicle')deleteVehicle(confirmDelete.id);else if(confirmDelete.kind==='record')deleteRecord(confirmDelete.id);else if(confirmDelete.kind==='fuel')deleteFuelLog(confirmDelete.id);else if(confirmDelete.kind==='expense')deleteExpense(confirmDelete.id);setConfirmDelete(null)}}/>}
      {toast && <Toast tone={toast.tone} message={toast.message}/>} 
    </div>
  );
}
