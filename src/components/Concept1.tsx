import { useEffect, useRef, useState } from 'react';
import '../concept.css';
import { Button, Field, Input, Pill, Sheet, SheetHeader, PrefixInput, Segmented } from './ui';
import {
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon,
  LayersIcon,
  AssetIcon,
  ColorIcon,
  FontIcon,
  TokensIcon,
  BracesIcon,
  LockIcon,
  LinkIcon,
  UploadIcon,
  InfoIcon,
} from './ui/Icon';

/* ---------------- Concept data model ---------------- */
type CType = 'asset' | 'font' | 'color' | 'string';
type Origin = 'inherited' | 'overridden';

interface CItem {
  id: string;
  name: string;
  key: string;
  type: CType;
  value: string; // hex | font desc | file name | string value
  fileUrl?: string;
  origin?: Origin; // only meaningful inside a subset
}

interface CSet {
  id: string;
  name: string;
  parent?: string;
}

const SETS: CSet[] = [
  { id: 'set1', name: 'Set 1' },
  { id: 'kraken', name: 'Kraken B' },
];
const SUBSET: CSet = { id: 'subset1', name: 'Subset 1', parent: 'set1' };

const LOGO = (text: string, bg: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="64"><rect width="120" height="64" rx="8" fill="${bg}"/><text x="60" y="38" font-family="Arial" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">${text}</text></svg>`,
  );
const ICON = (bg: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="10" fill="${bg}"/><path d="M14 25l7 7 13-15" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  );

const SET1_ITEMS: CItem[] = [
  { id: 's1-logo', name: 'Primary Logo', key: 'asset.logo', type: 'asset', value: 'logo.svg', fileUrl: LOGO('Acme', '#3F48FD') },
  { id: 's1-hero', name: 'Onboarding Hero', key: 'asset.hero', type: 'asset', value: 'hero.png', fileUrl: LOGO('Hero', '#02B8CA') },
  { id: 's1-font-h', name: 'Heading', key: 'font.heading', type: 'font', value: 'ABC Monument Grotesk · 700' },
  { id: 's1-font-b', name: 'Body', key: 'font.body', type: 'font', value: 'ABC Monument Grotesk · 400' },
  { id: 's1-col-brand', name: 'Brand Primary', key: 'color.brand.primary', type: 'color', value: '#3F48FD' },
  { id: 's1-col-surface', name: 'Surface', key: 'color.surface', type: 'color', value: '#FFFFFF' },
  { id: 's1-col-text', name: 'Text', key: 'color.text', type: 'color', value: '#313131' },
  { id: 's1-ticon', name: 'Check Icon', key: 'asset.icon.check', type: 'asset', value: 'check.svg', fileUrl: ICON('#22966B') },
  { id: 's1-str-email', name: 'Support Email', key: 'string.support.email', type: 'string', value: 'help@acme.com' },
  { id: 's1-str-name', name: 'Brand Name', key: 'string.brand.name', type: 'string', value: 'Acme Inc' },
];

const KRAKEN_ITEMS: CItem[] = [
  { id: 'k-logo', name: 'Primary Logo', key: 'asset.logo', type: 'asset', value: 'kraken.svg', fileUrl: LOGO('Kraken', '#020CD0') },
  { id: 'k-font-h', name: 'Heading', key: 'font.heading', type: 'font', value: 'Playfair Display · 700' },
  { id: 'k-col-brand', name: 'Brand Primary', key: 'color.brand.primary', type: 'color', value: '#012862' },
  { id: 'k-col-surface', name: 'Surface', key: 'color.surface', type: 'color', value: '#FFFFFF' },
  { id: 'k-str-name', name: 'Brand Name', key: 'string.brand.name', type: 'string', value: 'Kraken B' },
];

// Subset 1 inherits Set 1, overriding two values.
const SUBSET_OVERRIDES: Record<string, Partial<CItem>> = {
  's1-col-brand': { value: '#C47802' },
  's1-logo': { value: 'bakery-logo.svg', fileUrl: LOGO('Bakery', '#C47802') },
};
const SUBSET_ITEMS: CItem[] = SET1_ITEMS.map((it) => {
  const ov = SUBSET_OVERRIDES[it.id];
  return ov ? { ...it, ...ov, origin: 'overridden' as Origin } : { ...it, origin: 'inherited' as Origin };
});

const ITEMS_BY_SET: Record<string, CItem[]> = {
  set1: SET1_ITEMS,
  kraken: KRAKEN_ITEMS,
  subset1: SUBSET_ITEMS,
};

/* preset type tree (fixed list) */
type GroupNode =
  | { kind: 'type'; type: CType; label: string; icon: React.ReactNode }
  | { kind: 'tokens'; label: string; icon: React.ReactNode; children: { type: CType; label: string; icon: React.ReactNode }[] };

const PRESET_TREE: GroupNode[] = [
  { kind: 'type', type: 'asset', label: 'Assets', icon: <AssetIcon /> },
  {
    kind: 'tokens',
    label: 'Tokens',
    icon: <TokensIcon />,
    children: [
      { type: 'font', label: 'Fonts', icon: <FontIcon /> },
      { type: 'color', label: 'Colors', icon: <ColorIcon /> },
      { type: 'asset', label: 'Assets', icon: <AssetIcon /> },
    ],
  },
  { kind: 'type', type: 'string', label: 'Custom string', icon: <BracesIcon /> },
];

const TYPE_LABEL: Record<CType, string> = {
  asset: 'File',
  font: 'Font',
  color: 'Color',
  string: 'Custom string',
};

/* ---------------- Component ---------------- */
type CreateGroup = CType | 'tokens';

export function Concept1() {
  const [activeSetId, setActiveSetId] = useState('set1');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createGroup, setCreateGroup] = useState<CreateGroup | null>(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'asset-top': true,
    tokens: true,
    'tokens-font': true,
    'tokens-color': true,
    'tokens-asset': false,
    string: true,
  });

  const items = ITEMS_BY_SET[activeSetId] ?? [];
  const q = query.trim().toLowerCase();
  const visibleItems = q
    ? items.filter((i) => i.name.toLowerCase().includes(q) || i.key.toLowerCase().includes(q))
    : items;
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const isSubset = activeSetId === 'subset1';
  const activeSet = activeSetId === 'subset1' ? SUBSET : SETS.find((s) => s.id === activeSetId)!;

  const toggle = (k: string) => setExpanded((e) => ({ ...e, [k]: !e[k] }));

  return (
    <div className="c1">
      <div className="c1-toolbar">
        <div className="search">
          <SearchIcon />
          <input
            className="input"
            placeholder="Search resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="c1-toolbar__spacer" />
        <C1NewResourceButton onCreate={(t) => setCreateGroup(t)} />
      </div>

      <div className={`c1-cols ${selected ? '' : 'c1-cols--noinspector'}`}>
        {/* ---- Left rail ---- */}
        <aside className="c1-rail">
          <div className="c1-rail__head">
            <span className="c1-rail__title">Resource sets</span>
            <button className="icon-btn" aria-label="Add resource set"><PlusIcon /></button>
          </div>

          {SETS.map((s) => (
            <div key={s.id}>
              <button
                className={`c1-set ${activeSetId === s.id ? 'c1-set--active' : ''}`}
                onClick={() => {
                  setActiveSetId(s.id);
                  setSelectedId(null);
                }}
              >
                <span
                  className="c1-set__dot"
                  style={{ background: s.id === 'set1' ? 'var(--brand)' : 'var(--color-core-teal-600)' }}
                />
                {s.name}
              </button>
              {s.id === 'set1' && (
                <div className="c1-subset">
                  <button
                    className={`c1-set ${activeSetId === 'subset1' ? 'c1-set--active' : ''}`}
                    onClick={() => {
                      setActiveSetId('subset1');
                      setSelectedId(null);
                    }}
                  >
                    <span className="c1-set__dot" style={{ background: 'var(--color-core-orange-600)' }} />
                    {SUBSET.name}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>B2B2C</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="c1-rail__subhead">Resources</div>
          {[
            { label: 'Assets', icon: <AssetIcon />, keys: ['asset-top'], count: items.filter((i) => topLevelOf(i) === 'asset').length },
            { label: 'Fonts', icon: <FontIcon />, keys: ['tokens', 'tokens-font'], count: items.filter((i) => i.type === 'font').length },
            { label: 'Colors', icon: <ColorIcon />, keys: ['tokens', 'tokens-color'], count: items.filter((i) => i.type === 'color').length },
            { label: 'Custom string', icon: <BracesIcon />, keys: ['string'], count: items.filter((i) => i.type === 'string').length },
          ].map((g) => (
            <button
              key={g.label}
              className="c1-set c1-set--nav"
              onClick={() => setExpanded((e) => ({ ...e, ...Object.fromEntries(g.keys.map((k) => [k, true])) }))}
            >
              <span className="c1-group__icon">{g.icon}</span>
              {g.label}
              <span className="c1-group__count">{g.count}</span>
            </button>
          ))}

        </aside>

        {/* ---- Middle column ---- */}
        <section className="c1-mid">
          <div className="c1-mid__head">
            <div className="c1-scope">
              <LayersIcon size={13} />
              {isSubset ? (
                <>
                  <span>Set 1</span>
                  <ChevronRightIcon size={13} />
                  <b>{activeSet.name}</b>
                  <Pill type="feature">Subset · B2B2C</Pill>
                </>
              ) : (
                <b>{activeSet.name}</b>
              )}
            </div>
            <div className="c1-mid__title">Resources</div>
          </div>

          <div className="c1-mid__body">
            {PRESET_TREE.map((node) => {
              if (node.kind === 'type') {
                const key = node.type === 'asset' ? 'asset-top' : node.type === 'string' ? 'string' : node.type;
                const groupItems = visibleItems.filter((i) => i.type === node.type && topLevelOf(i) === node.type);
                return (
                  <PresetGroup
                    key={node.label}
                    name={node.label}
                    icon={node.icon}
                    count={groupItems.length}
                    open={!!expanded[key]}
                    onToggle={() => toggle(key)}
                    onAdd={() => setCreateGroup(node.type)}
                  >
                    <ItemList items={groupItems} selectedId={selectedId} onSelect={setSelectedId} isSubset={isSubset} />
                  </PresetGroup>
                );
              }
              // tokens with sub-groups
              const tokenItems = visibleItems.filter((i) => topLevelOf(i) === 'tokens');
              return (
                <PresetGroup
                  key="tokens"
                  name={node.label}
                  icon={node.icon}
                  count={tokenItems.length}
                  open={!!expanded.tokens}
                  onToggle={() => toggle('tokens')}
                  onAdd={() => setCreateGroup('tokens')}
                >
                  {node.children.map((child) => {
                    const ck = `tokens-${child.type}`;
                    const ci = tokenItems.filter((i) => i.type === child.type);
                    return (
                      <div className="c1-group--sub" key={child.label}>
                        <div className="c1-group__row c1-group__row--sub" onClick={() => toggle(ck)}>
                          <span className={`c1-group__chevron ${expanded[ck] ? 'c1-group__chevron--open' : ''}`}>
                            <ChevronRightIcon size={14} />
                          </span>
                          <span className="c1-group__icon">{child.icon}</span>
                          <span className="c1-group__name">{child.label}</span>
                          <span className="c1-group__count">{ci.length}</span>
                          <button
                            className="icon-btn c1-group__add"
                            aria-label={`Add ${child.label}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreateGroup(child.type);
                            }}
                          >
                            <PlusIcon size={14} />
                          </button>
                        </div>
                        {expanded[ck] && (
                          <div className="c1-items c1-items--sub">
                            <ItemList items={ci} selectedId={selectedId} onSelect={setSelectedId} isSubset={isSubset} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </PresetGroup>
              );
            })}
          </div>
        </section>

        {/* ---- Right inspector ---- */}
        <aside className="c1-inspector">
          {selected ? (
            <Inspector item={selected} isSubset={isSubset} onClear={() => setSelectedId(null)} />
          ) : (
            <div className="c1-insp__empty">
              <InfoIcon size={22} />
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 220 }}>
                Select a resource to define it. Its type is a preset, so only identifying info needs filling in.
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ---- References footer ---- */}
      <div className="c1-refs">
        <span className="c1-refs__icon"><LinkIcon /></span>
        {selected ? (
          <span>
            <b>{selected.name}</b> — Referenced in <b>3 inquiry templates</b>, <b>1 theme</b>, <b>3 workflows</b>.
          </span>
        ) : (
          <span>References resolve once a resource is applied in inquiry templates, themes, or workflows.</span>
        )}
      </div>

      {createGroup && (
        <ConceptCreatePanel
          group={createGroup}
          setName={activeSet.name}
          isSubset={isSubset}
          onClose={() => setCreateGroup(null)}
        />
      )}
    </div>
  );
}

/* ---------------- New resource split button ---------------- */
function C1NewResourceButton({ onCreate }: { onCreate: (g: CreateGroup) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const opts: { type: CType; icon: React.ReactNode }[] = [
    { type: 'color', icon: <ColorIcon /> },
    { type: 'font', icon: <FontIcon /> },
    { type: 'asset', icon: <AssetIcon /> },
    { type: 'string', icon: <BracesIcon /> },
  ];
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <Button prefix={<PlusIcon />} suffix={<ChevronDownIcon />} onClick={() => setOpen((o) => !o)}>
        New resource
      </Button>
      {open && (
        <div className="menu">
          {opts.map((o) => (
            <button
              key={o.type}
              className="menu__item"
              onClick={() => {
                setOpen(false);
                onCreate(o.type);
              }}
            >
              <span className="menu__icon">{o.icon}</span>
              New {TYPE_LABEL[o.type].toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* group classification: assets top-level vs assets-under-tokens.
   We treat fonts/colors as tokens; the dedicated "asset.icon.*" goes under Tokens>Assets,
   logos/heroes stay top-level Assets; strings are custom strings. */
function topLevelOf(i: CItem): 'asset' | 'tokens' | 'string' {
  if (i.type === 'string') return 'string';
  if (i.type === 'font' || i.type === 'color') return 'tokens';
  // asset: icons live under tokens, others top-level
  return i.key.startsWith('asset.icon') ? 'tokens' : 'asset';
}

function PresetGroup({
  name,
  icon,
  count,
  open,
  onToggle,
  onAdd,
  children,
}: {
  name: string;
  icon: React.ReactNode;
  count: number;
  open: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="c1-group">
      <div className="c1-group__row" onClick={onToggle}>
        <span className={`c1-group__chevron ${open ? 'c1-group__chevron--open' : ''}`}>
          <ChevronRightIcon size={14} />
        </span>
        <span className="c1-group__icon">{icon}</span>
        <span className="c1-group__name">{name}</span>
        <span className="c1-group__count">{count} items</span>
        <button
          className="icon-btn c1-group__add"
          aria-label={`Add ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.();
          }}
        >
          <PlusIcon size={14} />
        </button>
      </div>
      {open && children}
    </div>
  );
}

function ItemList({
  items,
  selectedId,
  onSelect,
  isSubset,
}: {
  items: CItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isSubset: boolean;
}) {
  if (items.length === 0) {
    return <div style={{ padding: '6px 0 6px 34px', fontSize: 12.5, color: 'var(--text-tertiary)' }}>No items yet</div>;
  }
  return (
    <div className="c1-items">
      {items.map((it) => {
        const overridden = isSubset && it.origin === 'overridden';
        return (
          <div
            key={it.id}
            className={`c1-item ${selectedId === it.id ? 'c1-item--selected' : ''} ${overridden ? 'c1-item--overridden' : ''}`}
            onClick={() => onSelect(it.id)}
          >
            <ItemPreview item={it} />
            <div className="c1-item__main">
              <div className="c1-item__name">{it.name}</div>
              <div className="c1-item__sub">{it.value}</div>
            </div>
            <span className="res-key c1-item__key">
              <span style={{ color: 'var(--text-tertiary)' }}>resource.</span>
              <b>{it.key}</b>
            </span>
            <span className="c1-item__spacer" />
            {isSubset &&
              (overridden ? (
                <Pill type="feature">Overridden</Pill>
              ) : (
                <span className="c1-item__inherited">Inherited</span>
              ))}
          </div>
        );
      })}
    </div>
  );
}

function ItemPreview({ item }: { item: CItem }) {
  if (item.type === 'color')
    return (
      <div className="swatch">
        <div className="swatch__fill" style={{ background: item.value }} />
      </div>
    );
  if (item.type === 'asset')
    return <div className="asset-thumb">{item.fileUrl && <img src={item.fileUrl} alt="" />}</div>;
  if (item.type === 'font') return <div className="font-preview">Ag</div>;
  return <div className="c2-strprev">""</div>;
}

/* ---------------- Inspector ---------------- */
function Inspector({ item, isSubset, onClear }: { item: CItem; isSubset: boolean; onClear: () => void }) {
  const overridden = isSubset && item.origin === 'overridden';
  return (
    <>
      <div className="c1-insp__head">
        <ItemPreview item={item} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
          <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>resource.{item.key}</div>
        </div>
        <button className="icon-btn" onClick={onClear} aria-label="Close inspector">✕</button>
      </div>

      <div className="c1-insp__body">
        {isSubset && (
          <div className="c1-override-banner">
            <InfoIcon />
            {overridden ? (
              <span><b>Overridden in {SUBSET.name}.</b> This value differs from the parent Set 1.</span>
            ) : (
              <span><b>Inherited from Set 1.</b> Editing here creates an override for this subset only.</span>
            )}
          </div>
        )}

        <div className="c1-insp__note">
          Because <b>{TYPE_LABEL[item.type]}</b> is a preset type, its file-type and validation rules
          are already established. You mainly fill in identifying info.
        </div>

        {/* Value field — type-specific */}
        {item.type === 'asset' && <AssetForm item={item} />}
        {item.type === 'color' && <ColorForm item={item} />}
        {item.type === 'font' && <FontForm item={item} />}
        {item.type === 'string' && <StringForm item={item} />}

        {/* ID */}
        <Field label="ID" hint="Immutable — referenced as resource.<key>.">
          <div className="input-affix" style={{ background: 'var(--bg-input-disabled)' }}>
            <span className="input-affix__prefix">resource.</span>
            <input className="t-mono" value={item.key} disabled style={{ fontSize: 13, color: 'var(--text-secondary)' }} />
            <span style={{ paddingRight: 10, color: 'var(--text-tertiary)' }}><LockIcon size={14} /></span>
          </div>
        </Field>

        {/* Type (locked) */}
        <Field label="Type">
          <div className="c1-locked">
            {TYPE_LABEL[item.type]}
            <span className="c1-locked__tag"><LockIcon size={13} /></span>
          </div>
        </Field>

        {/* Upload (assets only) — last, matching the preset form order */}
        {item.type === 'asset' && <UploadField item={item} />}

        <div style={{ display: 'flex', gap: 8 }}>
          {overridden && <Button variant="outline" full>Reset to inherited</Button>}
          <Button full prefix={<span style={{ display: 'inline-flex' }}>✓</span>}>Save</Button>
        </div>
      </div>
    </>
  );
}

function AssetForm({ item }: { item: CItem }) {
  return (
    <Field label="Value" hint="Display name for this asset.">
      <Input defaultValue={item.name} />
    </Field>
  );
}

function UploadField({ item }: { item: CItem }) {
  return (
    <Field label="Upload">
      <div className="c1-upload">
        <span className="c1-upload__thumb">{item.fileUrl && <img src={item.fileUrl} alt="" />}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-mono" style={{ fontSize: 12.5 }}>{item.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>File · SVG/PNG (preset rule)</div>
        </div>
        <Button variant="outline" size="sm" prefix={<UploadIcon size={14} />}>File</Button>
      </div>
    </Field>
  );
}

function ColorForm({ item }: { item: CItem }) {
  return (
    <Field label="Value" hint="Color picker — established by the preset type.">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="color" className="color-native" defaultValue={item.value.slice(0, 7)} aria-label="Color" />
        <Input mono defaultValue={item.value} />
      </div>
    </Field>
  );
}

function FontForm({ item }: { item: CItem }) {
  const [family, weight] = item.value.split(' · ');
  return (
    <>
      <Field label="Value">
        <div className="font-sample" style={{ fontFamily: `'${family}', sans-serif`, fontWeight: Number(weight) || 400, padding: 14 }}>
          <div style={{ fontSize: 24 }}>Verify with confidence</div>
        </div>
      </Field>
      <div className="row-2">
        <Field label="Family"><Input defaultValue={family} /></Field>
        <Field label="Weight"><Input defaultValue={weight} /></Field>
      </div>
    </>
  );
}

function StringForm({ item }: { item: CItem }) {
  return (
    <Field label="Value" hint="Free-form string value.">
      <Input defaultValue={item.value} />
    </Field>
  );
}

/* ---------------- Create side panel ---------------- */
const NAMESPACE: Record<CType, string> = {
  asset: 'asset',
  font: 'font',
  color: 'color',
  string: 'string',
};

function slug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.');
}

function ConceptCreatePanel({
  group,
  setName,
  isSubset,
  onClose,
}: {
  group: CreateGroup;
  setName: string;
  isSubset: boolean;
  onClose: () => void;
}) {
  // For "tokens" the user picks which preset token type; otherwise the type is fixed.
  const fixed = group !== 'tokens';
  const [type, setType] = useState<CType>(group === 'tokens' ? 'color' : group);

  const [name, setName_] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [id, setId] = useState('');

  const [hex, setHex] = useState('#3F48FD');
  const [family, setFamily] = useState('ABC Monument Grotesk');
  const [weight, setWeight] = useState('400');
  const [str, setStr] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const base = slug(name);
  const effectiveId = idTouched ? id : base ? `${NAMESPACE[type]}.${base}` : '';
  const canCreate = name.trim().length > 0 && effectiveId.length > 0;

  const ICON_FOR: Record<CType, React.ReactNode> = {
    asset: <AssetIcon />,
    font: <FontIcon />,
    color: <ColorIcon />,
    string: <BracesIcon />,
  };

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        icon={ICON_FOR[type]}
        title={`New ${TYPE_LABEL[type].toLowerCase()}`}
        subtitle={
          <span>
            Adding to <b style={{ color: 'var(--text-primary)' }}>{setName}</b>
            {isSubset ? ' — creates a subset override' : ''}
          </span>
        }
        onClose={onClose}
      />

      <div className="c1-insp__body">
        {!fixed && (
          <Field label="Token type" hint="Choose which preset token to define.">
            <Segmented<CType>
              value={type}
              onChange={setType}
              items={[
                { value: 'color', label: 'Color' },
                { value: 'font', label: 'Font' },
                { value: 'asset', label: 'Asset' },
              ]}
            />
          </Field>
        )}

        <Field label="Name">
          <Input value={name} onChange={(e) => setName_(e.target.value)} placeholder="e.g. Brand Primary" autoFocus />
        </Field>

        {/* type-specific value */}
        {type === 'color' && (
          <Field label="Value" hint="Color picker — established by the preset type.">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" className="color-native" value={hex} onChange={(e) => setHex(e.target.value.toUpperCase())} aria-label="Color" />
              <Input mono value={hex} onChange={(e) => setHex(e.target.value)} />
            </div>
          </Field>
        )}
        {type === 'font' && (
          <>
            <Field label="Value">
              <div className="font-sample" style={{ fontFamily: `'${family}', sans-serif`, fontWeight: Number(weight) || 400, padding: 14 }}>
                <div style={{ fontSize: 24 }}>Verify with confidence</div>
              </div>
            </Field>
            <div className="row-2">
              <Field label="Family"><Input value={family} onChange={(e) => setFamily(e.target.value)} /></Field>
              <Field label="Weight"><Input value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
            </div>
          </>
        )}
        {type === 'string' && (
          <Field label="Value" hint="Free-form string value.">
            <Input value={str} onChange={(e) => setStr(e.target.value)} placeholder="e.g. help@acme.com" />
          </Field>
        )}

        {/* ID */}
        <Field label="ID" hint="Auto-suggested from the name. Keys can’t be renamed after saving.">
          <PrefixInput
            prefix="resource."
            value={effectiveId}
            onChange={(e) => {
              setIdTouched(true);
              setId(e.target.value);
            }}
            placeholder={`${NAMESPACE[type]}.key`}
          />
        </Field>

        {/* Type (locked) */}
        <Field label="Type">
          <div className="c1-locked">
            {TYPE_LABEL[type]}
            <span className="c1-locked__tag"><LockIcon size={13} /></span>
          </div>
        </Field>

        {/* Upload for assets */}
        {type === 'asset' && (
          <Field label="Upload">
            <div className="c1-upload">
              <span className="c1-upload__thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-mono" style={{ fontSize: 12.5 }}>{fileName ?? 'No file selected'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>File · SVG/PNG (preset rule)</div>
              </div>
              <Button variant="outline" size="sm" prefix={<UploadIcon size={14} />} onClick={() => setFileName('new-asset.svg')}>
                File
              </Button>
            </div>
          </Field>
        )}
      </div>

      <div className="sheet__foot">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <div style={{ flex: 1 }} />
        <Button disabled={!canCreate} onClick={onClose}>Create resource</Button>
      </div>
    </Sheet>
  );
}
