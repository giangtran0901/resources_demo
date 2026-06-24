import { useMemo, useRef, useState, useEffect } from 'react';
import { Button, Segmented, Select, Pill } from './ui';
import { ResourcePreview } from './Previews';
import {
  PlusIcon,
  SearchIcon,
  ColorIcon,
  FontIcon,
  AssetIcon,
  LayersIcon,
  GridIcon,
  ChevronDownIcon,
  LinkIcon,
  EditIcon,
  ArchiveIcon,
  DotsIcon,
  CheckIcon,
} from './ui/Icon';
import {
  type Resource,
  type ResourceType,
  type ResourceState,
  sets,
  resourcesBySet,
  typeMeta,
  stateMeta,
} from '../data/resources';

const TYPE_ICON: Record<ResourceType, React.ReactNode> = {
  color: <ColorIcon />,
  font: <FontIcon />,
  asset: <AssetIcon />,
};

type GroupMode = 'set' | 'type';

export interface PageActions {
  onCreate: (type: ResourceType) => void;
  onEdit: (r: Resource) => void;
  onRefs: (r: Resource) => void;
  onArchive: (r: Resource) => void;
}

export function ResourcesPage({
  actions,
  singleSetOrg,
  showEmpty,
}: {
  actions: PageActions;
  singleSetOrg: boolean;
  showEmpty: boolean;
}) {
  const [group, setGroup] = useState<GroupMode>('set');
  const [scopeSet, setScopeSet] = useState('default');
  const [query, setQuery] = useState('');
  const effGroup: GroupMode = singleSetOrg ? 'type' : group;

  const filter = (list: Resource[]) =>
    query.trim()
      ? list.filter(
          (r) =>
            r.label.toLowerCase().includes(query.toLowerCase()) ||
            r.key.toLowerCase().includes(query.toLowerCase()),
        )
      : list;

  const activeSets = singleSetOrg ? sets.filter((s) => s.isDefault) : sets;

  return (
    <>
      <div className="toolbar">
        {!singleSetOrg && (
          <Segmented<GroupMode>
            value={group}
            onChange={setGroup}
            items={[
              { value: 'set', label: <><LayersIcon /> By set</> },
              { value: 'type', label: <><GridIcon /> By type</> },
            ]}
          />
        )}

        {effGroup === 'type' && !singleSetOrg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="toolbar__label">Set</span>
            <div style={{ width: 200 }}>
              <Select
                value={scopeSet}
                onChange={setScopeSet}
                options={sets.map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>
          </div>
        )}

        <div className="toolbar__spacer" />

        <div className="search">
          <SearchIcon />
          <input
            className="input"
            placeholder="Search resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <NewResourceButton onCreate={actions.onCreate} />
      </div>

      {showEmpty ? (
        <EmptyState onCreate={actions.onCreate} />
      ) : effGroup === 'set' ? (
        activeSets.map((s) => (
          <SetGroup
            key={s.id}
            set={s}
            resources={filter(resourcesBySet[s.id])}
            singleSetOrg={singleSetOrg}
            actions={actions}
          />
        ))
      ) : (
        <TypeGroupedView
          resources={filter(resourcesBySet[singleSetOrg ? 'default' : scopeSet])}
          actions={actions}
        />
      )}
    </>
  );
}

/* ---------------- New resource split button ---------------- */
function NewResourceButton({ onCreate }: { onCreate: (t: ResourceType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <Button prefix={<PlusIcon />} suffix={<ChevronDownIcon />} onClick={() => setOpen((o) => !o)}>
        New resource
      </Button>
      {open && (
        <div className="menu">
          {(['color', 'font', 'asset'] as ResourceType[]).map((t) => (
            <button
              key={t}
              className="menu__item"
              onClick={() => {
                setOpen(false);
                onCreate(t);
              }}
            >
              <span className="menu__icon">{TYPE_ICON[t]}</span>
              New {typeMeta[t].label.toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Set group (table) ---------------- */
function SetGroup({
  set,
  resources,
  singleSetOrg,
  actions,
}: {
  set: (typeof sets)[number];
  resources: Resource[];
  singleSetOrg: boolean;
  actions: PageActions;
}) {
  const overrides = resources.filter((r) => r.state === 'overridden').length;
  const locals = resources.filter((r) => r.state === 'local-only').length;
  return (
    <div className="set-group">
      {!singleSetOrg && (
        <div className="set-group__head">
          <div className="set-group__title">
            <LayersIcon />
            {set.name}
            {set.isDefault && <span className="set-badge">Default</span>}
          </div>
          <div className="set-group__desc">
            {resources.length} resources
            {overrides > 0 && ` · ${overrides} overridden`}
            {locals > 0 && ` · ${locals} local-only`}
          </div>
        </div>
      )}
      <div className="res-table">
        {resources.map((r) => (
          <ResourceRow key={r.id} r={r} actions={actions} />
        ))}
      </div>
    </div>
  );
}

function ResourceRow({ r, actions }: { r: Resource; actions: PageActions }) {
  return (
    <div className="res-row" onClick={() => actions.onRefs(r)}>
      <ResourcePreview resource={r} />
      <div style={{ minWidth: 0 }}>
        <div className="res-row__label">{r.label}</div>
        <div className="res-row__sub">{valueSummary(r)}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <span className="res-key">
          <span style={{ color: 'var(--text-tertiary)' }}>resource.</span>
          <b>{r.key}</b>
        </span>
      </div>
      <span className="res-used">
        <LinkIcon size={13} />
        <b>{r.usedBy}</b> {r.usedBy === 1 ? 'use' : 'uses'}
      </span>
      <RowMenu r={r} actions={actions} />
    </div>
  );
}

export function StateTag({ state }: { state: ResourceState }) {
  const m = stateMeta[state];
  return <Pill type={m.pill}>{m.label}</Pill>;
}

function RowMenu({ r, actions }: { r: Resource; actions: PageActions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div style={{ position: 'relative' }} ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Actions">
        <DotsIcon />
      </button>
      {open && (
        <div className="menu">
          <button className="menu__item" onClick={() => { setOpen(false); actions.onEdit(r); }}>
            <span className="menu__icon"><EditIcon /></span> Edit value
          </button>
          <button className="menu__item" onClick={() => { setOpen(false); actions.onRefs(r); }}>
            <span className="menu__icon"><LinkIcon /></span> View references
          </button>
          <div className="menu__sep" />
          <button className="menu__item menu__item--danger" onClick={() => { setOpen(false); actions.onArchive(r); }}>
            <span className="menu__icon" style={{ color: 'inherit' }}><ArchiveIcon /></span> Archive…
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Type-grouped (cards) ---------------- */
function TypeGroupedView({ resources, actions }: { resources: Resource[]; actions: PageActions }) {
  const types: ResourceType[] = ['color', 'font', 'asset'];
  return (
    <>
      {types.map((t) => {
        const items = resources.filter((r) => r.type === t);
        if (items.length === 0) return null;
        return (
          <div key={t} style={{ marginBottom: 28 }}>
            <div className="type-subhead">
              {TYPE_ICON[t]} {typeMeta[t].plural}
              <span className="ref-group__count" style={{ textTransform: 'none', letterSpacing: 0 }}>{items.length}</span>
            </div>
            <div className="res-grid">
              {items.map((r) => (
                <ResourceCard key={r.id} r={r} actions={actions} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function ResourceCard({ r, actions }: { r: Resource; actions: PageActions }) {
  return (
    <div className="res-card" onClick={() => actions.onRefs(r)}>
      <div className="res-card__preview">
        {r.type === 'color' && r.color && (
          <div className="res-card__big-swatch" style={{ background: r.color.hex, borderRadius: 'var(--radius-md)' }} />
        )}
        {r.type === 'font' && r.font && (
          <div
            className="res-card__font"
            style={{ fontFamily: `'${r.font.family}', sans-serif`, fontWeight: r.font.weight, fontStyle: r.font.style }}
          >
            Ag
          </div>
        )}
        {r.type === 'asset' && r.asset && (
          <div className="res-card__asset">
            <img src={r.asset.url} alt="" />
          </div>
        )}
      </div>
      <div>
        <div className="res-card__row">
          <span style={{ fontWeight: 500 }}>{r.label}</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <span className="res-key">
            <span style={{ color: 'var(--text-tertiary)' }}>resource.</span>
            <b>{r.key}</b>
          </span>
        </div>
        <div className="res-card__row" style={{ marginTop: 10 }}>
          <span className="res-used"><LinkIcon size={13} /> <b>{r.usedBy}</b> {r.usedBy === 1 ? 'use' : 'uses'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{valueSummary(r)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */
function EmptyState({ onCreate }: { onCreate: (t: ResourceType) => void }) {
  return (
    <div className="empty">
      <div className="empty__icon"><LayersIcon size={24} /></div>
      <div className="empty__title">No resources yet</div>
      <div className="empty__line">Define a color or logo once, reference it everywhere with <span className="t-mono">resource.&lt;key&gt;</span>.</div>
      <div className="empty__actions">
        <Button prefix={<PlusIcon />} onClick={() => onCreate('color')}>New resource</Button>
        <Button variant="outline" prefix={<CheckIcon />}>Import from your current theme</Button>
      </div>
    </div>
  );
}

function valueSummary(r: Resource): string {
  if (r.type === 'color' && r.color) return r.color.hex;
  if (r.type === 'font' && r.font) return `${r.font.family} · ${r.font.weight}${r.font.style === 'italic' ? ' italic' : ''}`;
  if (r.type === 'asset' && r.asset) return `${r.asset.format} · ${r.asset.w}×${r.asset.h}`;
  return '';
}
