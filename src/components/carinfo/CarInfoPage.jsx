import React, { useState } from 'react';
import { Car, Disc3, Cog, FileStack, Wrench, Image as ImageIcon } from 'lucide-react';
import { COLORS, FONT_BODY } from '../../styles/theme';
import { Modal } from '../common/Modal';
import { CarDetailsHero } from './CarDetailsHero';
import { InfoSectionCard } from './InfoSectionCard';
import { VehicleInfoPanel } from './VehicleInfoPanel';
import { DocumentsPanel } from './DocumentsPanel';
import { SectionEditForm } from './SectionEditForm';
import { CAR_INFO_SECTIONS } from '../../constants/carInfoSections';

const sectionByKey = Object.fromEntries(CAR_INFO_SECTIONS.map(s => [s.key, s]));

const TABS = [
  { key: 'overview', label: 'Overview', icon: Car },
  { key: 'tyres', label: 'Tyres & Wheels', icon: Disc3 },
  { key: 'engineSpecs', label: 'Fluids & Parts', icon: Cog },
  { key: 'documents', label: 'Documents & Expiry', icon: FileStack },
  { key: 'parts', label: 'Component History', icon: Wrench },
  { key: 'photos', label: 'Photos & Notes', icon: ImageIcon },
];

export function CarInfoPage({ active, reminder, roadTax, insurance, onSaveSection }) {
  const [tab, setTab] = useState('overview');
  const [editingKey, setEditingKey] = useState(null);
  const editingSection = sectionByKey[editingKey];

  const openEdit = (key) => setEditingKey(key);
  const closeEdit = () => setEditingKey(null);
  const save = (key, data) => { onSaveSection(key, data); closeEdit(); };

  return (
    <div className="gl-section-page">
      <CarDetailsHero active={active} reminder={reminder} roadTax={roadTax} insurance={insurance} />

      <div className="gl-cd-tabs">
        {TABS.map(t => {
          const Icon = t.icon;
          return <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}><Icon size={15} /> {t.label}</button>;
        })}
      </div>

      {tab === 'overview' && (
        <div className="gl-cd-overview-grid">
          <div className="gl-cd-col">
            <VehicleInfoPanel active={active} onEdit={() => openEdit('profile')} />
            <InfoSectionCard section={sectionByKey.tyres} data={active.tyres || {}} onEdit={() => openEdit('tyres')} />
            <InfoSectionCard section={sectionByKey.engineSpecs} data={active.engineSpecs || {}} onEdit={() => openEdit('engineSpecs')} />
          </div>
          <div className="gl-cd-col">
            <DocumentsPanel active={active} onEdit={() => openEdit('documents')} onSaveSection={onSaveSection} />
            <InfoSectionCard section={sectionByKey.parts} data={active.parts || {}} onEdit={() => openEdit('parts')} />
            <InfoSectionCard section={sectionByKey.ownership} data={active.ownership || {}} onEdit={() => openEdit('ownership')} />
          </div>
        </div>
      )}

      {tab === 'tyres' && <div className="gl-cd-single-col"><InfoSectionCard section={sectionByKey.tyres} data={active.tyres || {}} onEdit={() => openEdit('tyres')} /></div>}
      {tab === 'engineSpecs' && <div className="gl-cd-single-col"><InfoSectionCard section={sectionByKey.engineSpecs} data={active.engineSpecs || {}} onEdit={() => openEdit('engineSpecs')} /></div>}
      {tab === 'documents' && <div className="gl-cd-single-col"><DocumentsPanel active={active} onEdit={() => openEdit('documents')} onSaveSection={onSaveSection} /></div>}
      {tab === 'parts' && <div className="gl-cd-single-col"><InfoSectionCard section={sectionByKey.parts} data={active.parts || {}} onEdit={() => openEdit('parts')} /></div>}

      {tab === 'photos' && (
        <div className="gl-cd-single-col" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="csl-card" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15.5, color: COLORS.paper, marginBottom: 10 }}>Photos & Documents</div>
            {(active.documents?.attachments || []).length === 0 ? (
              <div style={{ fontSize: 14, color: COLORS.steelDim }}>No photos uploaded yet. Add some from the Documents & Expiry tab.</div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {active.documents.attachments.map((src, i) => <img key={i} src={src} alt="" style={{ width: 90, height: 90, borderRadius: 10, objectFit: 'cover', border: `1px solid ${COLORS.line}` }} />)}
              </div>
            )}
          </div>
          <InfoSectionCard
            section={{ ...sectionByKey.ownership, title: 'Notes', description: 'Modifications, accessories and anything else worth remembering', fields: sectionByKey.ownership.fields.filter(f => ['modifications', 'notes'].includes(f.key)) }}
            data={active.ownership || {}}
            onEdit={() => openEdit('ownership')}
          />
        </div>
      )}

      {editingSection && (
        <Modal title={editingSection.title} subtitle={editingSection.description} icon={editingSection.icon} twoCol onClose={closeEdit}>
          <SectionEditForm section={editingSection} initial={active[editingSection.key]} onCancel={closeEdit} onSave={(data) => save(editingSection.key, data)} />
        </Modal>
      )}
    </div>
  );
}
