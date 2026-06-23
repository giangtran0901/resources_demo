import { useEffect, useState } from 'react';
import './app.css';
import { ResourcesPage, type PageActions } from './components/ResourcesPage';
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
  SunIcon,
  MoonIcon,
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [singleSetOrg, setSingleSetOrg] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
              <div className="page-title">Resources</div>
              <div className="page-sub">
                Define reusable values once and reference them everywhere with{' '}
                <span className="t-mono" style={{ fontSize: 12 }}>resource.&lt;key&gt;</span>. Colors, fonts, and assets stay in sync across every template, theme, and workflow.
              </div>
            </div>
            <DemoControls
              theme={theme}
              setTheme={setTheme}
              singleSetOrg={singleSetOrg}
              setSingleSetOrg={setSingleSetOrg}
              showEmpty={showEmpty}
              setShowEmpty={setShowEmpty}
            />
          </div>
        </header>

        <div className="page-body">
          <ResourcesPage actions={actions} singleSetOrg={singleSetOrg} showEmpty={showEmpty} />
        </div>
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
  theme,
  setTheme,
  singleSetOrg,
  setSingleSetOrg,
  showEmpty,
  setShowEmpty,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  singleSetOrg: boolean;
  setSingleSetOrg: (v: boolean) => void;
  showEmpty: boolean;
  setShowEmpty: (v: boolean) => void;
}) {
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
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {theme === 'light' ? <SunIcon /> : <MoonIcon />} Dark mode
        </span>
        <Toggle checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} aria-label="Dark mode" />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
        <span>Single-set org</span>
        <Toggle checked={singleSetOrg} onChange={setSingleSetOrg} aria-label="Single set org" />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
        <span>Empty state</span>
        <Toggle checked={showEmpty} onChange={setShowEmpty} aria-label="Empty state" />
      </label>
    </div>
  );
}
