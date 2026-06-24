import { useState } from 'react';
import './app.css';
import { ResourcesPage, type PageActions } from './components/ResourcesPage';
import { Concept1 } from './components/Concept1';
import { Concept2 } from './components/Concept2';
import { ResourceEditor } from './components/ResourceEditor';
import { ReferencesPanel } from './components/ReferencesPanel';
import { ArchiveModal } from './components/ArchiveModal';
import { Toggle } from './components/ui';
import {
  HomeIcon,
  LayersIcon,
  TemplateIcon,
  FlowIcon,
  ThemeIcon,
  SettingsIcon,
  ChevronRightIcon,
} from './components/ui/Icon';
import { sets, type Resource, type ResourceType } from './data/resources';

type Panel =
  | { kind: 'create'; type: ResourceType }
  | { kind: 'edit'; resource: Resource }
  | { kind: 'refs'; resource: Resource }
  | { kind: 'archive'; resource: Resource }
  | null;

export default function App() {
  const [singleSetOrg, setSingleSetOrg] = useState(false);
  const [concept1, setConcept1] = useState(false);
  const [concept2, setConcept2] = useState(false);
  const [concept3, setConcept3] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  const pickConcept1 = (v: boolean) => {
    setConcept1(v);
    if (v) { setConcept2(false); setConcept3(false); }
  };
  const pickConcept2 = (v: boolean) => {
    setConcept2(v);
    if (v) { setConcept1(false); setConcept3(false); }
  };
  const pickConcept3 = (v: boolean) => {
    setConcept3(v);
    if (v) { setConcept1(false); setConcept2(false); }
  };

  // No concept selected → show the empty state by default.
  const isDefault = !concept1 && !concept2 && !concept3;

  const actions: PageActions = {
    onCreate: (type) => setPanel({ kind: 'create', type }),
    onEdit: (resource) => setPanel({ kind: 'edit', resource }),
    onRefs: (resource) => setPanel({ kind: 'refs', resource }),
    onArchive: (resource) => setPanel({ kind: 'archive', resource }),
  };
  const close = () => setPanel(null);

  return (
    <div className="shell">
      <Sidebar />

      <main className="main">
        <header className="page-head">
          <div className="breadcrumb">
            <span>Acme Inc</span>
            <ChevronRightIcon size={14} />
            <span>Resources</span>
          </div>
          <div className="page-head__row">
            <div>
              <div className="page-title">Resources{concept1 ? ' · Concept 1' : concept2 ? ' · Concept 2' : concept3 ? ' · Concept 3' : ''}</div>
              <div className="page-sub">
                {concept1 ? (
                  <>Preset resource types within customizable sets. Pick a set, fill in preset types, and define each resource in the inspector.</>
                ) : concept2 ? (
                  <>Browse resources by type or by set. Select “All Resource sets” for an overview of every set, then open a resource to edit it in the inspector.</>
                ) : (
                  <>
                    Define reusable values once and reference them everywhere with{' '}
                    <span className="t-mono" style={{ fontSize: 12 }}>resource.&lt;key&gt;</span>. Colors, fonts, and assets stay in sync across every template, theme, and workflow.
                  </>
                )}
              </div>
            </div>
            <DemoControls
              singleSetOrg={singleSetOrg}
              setSingleSetOrg={setSingleSetOrg}
              concept1={concept1}
              setConcept1={pickConcept1}
              concept2={concept2}
              setConcept2={pickConcept2}
              concept3={concept3}
              setConcept3={pickConcept3}
            />
          </div>
        </header>

        {concept1 ? (
          <Concept1 />
        ) : concept2 ? (
          <Concept2 />
        ) : (
          <div className="page-body">
            <ResourcesPage actions={actions} singleSetOrg={singleSetOrg} showEmpty={isDefault} />
          </div>
        )}
      </main>

      {panel?.kind === 'create' && (
        <ResourceEditor mode="create" type={panel.type} sets={sets} currentSetId="default" onClose={close} />
      )}
      {panel?.kind === 'edit' && (
        <ResourceEditor
          mode="edit"
          type={panel.resource.type}
          existing={panel.resource}
          sets={sets}
          currentSetId="default"
          onClose={close}
        />
      )}
      {panel?.kind === 'refs' && <ReferencesPanel resource={panel.resource} onClose={close} />}
      {panel?.kind === 'archive' && <ArchiveModal resource={panel.resource} onClose={close} />}
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">A</div>
        <div>
          <div className="sidebar__org">Acme Inc</div>
          <div className="sidebar__org-sub">Production</div>
        </div>
      </div>

      <button className="nav-item"><HomeIcon /> Overview</button>
      <button className="nav-item"><TemplateIcon /> Templates</button>
      <button className="nav-item"><FlowIcon /> Workflows</button>

      <div className="sidebar__section">Build</div>
      <button className="nav-item nav-item--active"><LayersIcon /> Resources</button>
      <button className="nav-item"><ThemeIcon /> Themes</button>
      <button className="nav-item"><SettingsIcon /> Settings</button>

      <div style={{ flex: 1 }} />
      <div className="sidebar__section">Resource sets</div>
      {sets.map((s) => (
        <button key={s.id} className="nav-item" style={{ fontSize: 13 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: s.isDefault ? 'var(--brand)' : 'var(--color-core-teal-600)',
              flex: 'none',
            }}
          />
          {s.name}
        </button>
      ))}
    </aside>
  );
}

function DemoControls({
  singleSetOrg,
  setSingleSetOrg,
  concept1,
  setConcept1,
  concept2,
  setConcept2,
  concept3,
  setConcept3,
}: {
  singleSetOrg: boolean;
  setSingleSetOrg: (v: boolean) => void;
  concept1: boolean;
  setConcept1: (v: boolean) => void;
  concept2: boolean;
  setConcept2: (v: boolean) => void;
  concept3: boolean;
  setConcept3: (v: boolean) => void;
}) {
  // Single-set org only applies to the table layout (default / Concept 3).
  const treeConcept = concept1 || concept2;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        border: '1px solid var(--border-divider)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        background: 'var(--bg-raised)',
        minWidth: 232,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
        Demo controls
      </div>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, fontWeight: 500 }}>
        <span>Concept 1</span>
        <Toggle checked={concept1} onChange={setConcept1} aria-label="Concept 1" />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, fontWeight: 500 }}>
        <span>Concept 2</span>
        <Toggle checked={concept2} onChange={setConcept2} aria-label="Concept 2" />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, fontWeight: 500 }}>
        <span>Concept 3</span>
        <Toggle checked={concept3} onChange={setConcept3} aria-label="Concept 3" />
      </label>
      <hr className="divider" />
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 13,
          opacity: treeConcept ? 0.4 : 1,
        }}
      >
        <span>Single-set org</span>
        <Toggle checked={singleSetOrg} onChange={(v) => !treeConcept && setSingleSetOrg(v)} aria-label="Single set org" />
      </label>
    </div>
  );
}
