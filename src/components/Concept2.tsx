import { useState } from 'react';
import '../concept.css';
import { Button, Field, Input, Pill } from './ui';
import {
  PlusIcon,
  FontIcon,
  AssetIcon,
  BracesIcon,
  ColorIcon,
  LayersIcon,
  LinkIcon,
  LockIcon,
  UploadIcon,
  DotsIcon,
} from './ui/Icon';

/* ---------------- Concept 2 data ---------------- */
type R2Type = 'color' | 'font' | 'asset' | 'string';

interface R2 {
  id: string;
  name: string;
  key: string;
  type: R2Type;
  value: string;
  usedBy: number;
  fileUrl?: string;
}

interface S2 {
  id: string;
  name: string;
  color: string;
  resources: R2[];
}

const LOGO = (text: string, bg: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="64"><rect width="120" height="64" rx="8" fill="${bg}"/><text x="60" y="38" font-family="Arial" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">${text}</text></svg>`,
  );

const SETS2: S2[] = [
  {
    id: 'set1',
    name: 'Set 1',
    color: 'var(--brand)',
    resources: [
      { id: 's1-logo', name: 'Primary Logo', key: 'asset.logo', type: 'asset', value: 'logo.svg', usedBy: 43, fileUrl: LOGO('Acme', '#3F48FD') },
      { id: 's1-hero', name: 'Onboarding Hero', key: 'asset.hero', type: 'asset', value: 'hero.png', usedBy: 12, fileUrl: LOGO('Hero', '#02B8CA') },
      { id: 's1-brand', name: 'Brand Primary', key: 'color.brand.primary', type: 'color', value: '#3F48FD', usedBy: 64 },
      { id: 's1-head', name: 'Heading', key: 'font.heading', type: 'font', value: 'ABC Monument Grotesk · 700', usedBy: 30 },
      { id: 's1-body', name: 'Body', key: 'font.body', type: 'font', value: 'ABC Monument Grotesk · 400', usedBy: 52 },
      { id: 's1-email', name: 'Support Email', key: 'string.support.email', type: 'string', value: 'help@acme.com', usedBy: 8 },
    ],
  },
  {
    id: 'set2',
    name: 'Set 2',
    color: 'var(--color-core-teal-600)',
    resources: [
      { id: 's2-logo', name: 'Primary Logo', key: 'asset.logo', type: 'asset', value: 'kraken.svg', usedBy: 21, fileUrl: LOGO('Kraken', '#020CD0') },
      { id: 's2-brand', name: 'Brand Primary', key: 'color.brand.primary', type: 'color', value: '#012862', usedBy: 33 },
      { id: 's2-head', name: 'Heading', key: 'font.heading', type: 'font', value: 'Playfair Display · 700', usedBy: 15 },
      { id: 's2-short', name: 'Short String', key: 'string.tagline', type: 'string', value: 'Bank without limits', usedBy: 12 },
    ],
  },
];

const TYPE_LABEL: Record<R2Type, string> = {
  color: 'Color',
  font: 'Font',
  asset: 'Asset',
  string: 'String',
};

const NAV_TYPES: { type: R2Type; label: string; icon: React.ReactNode }[] = [
  { type: 'color', label: 'Colors', icon: <ColorIcon /> },
  { type: 'font', label: 'Fonts', icon: <FontIcon /> },
  { type: 'asset', label: 'Assets', icon: <AssetIcon /> },
  { type: 'string', label: 'Strings', icon: <BracesIcon /> },
];

/* ---------------- Component ---------------- */
type Sel = { kind: 'all' } | { kind: 'set'; id: string } | { kind: 'type'; t: R2Type };

export function Concept2() {
  const [sel, setSel] = useState<Sel>({ kind: 'all' });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? SETS2.flatMap((s) => s.resources).find((r) => r.id === selectedId) ?? null
    : null;
  const selectedSetName = selectedId
    ? SETS2.find((s) => s.resources.some((r) => r.id === selectedId))?.name ?? ''
    : '';

  const setsToShow =
    sel.kind === 'set' ? SETS2.filter((s) => s.id === sel.id) : SETS2;
  const typeFilter = sel.kind === 'type' ? sel.t : null;

  const isActive = (s: Sel) =>
    sel.kind === s.kind &&
    (s.kind !== 'set' || sel.kind === 'set' && sel.id === s.id) &&
    (s.kind !== 'type' || sel.kind === 'type' && sel.t === s.t);

  return (
    <div className={`c2 ${selected ? '' : 'c2--noinspector'}`}>
      {/* ---- Left nav ---- */}
      <aside className="c2-nav">
        <div className="c2-nav__head">Nav</div>

        <div className="c2-nav__label">Resources</div>
        {NAV_TYPES.map((t) => (
          <button
            key={t.type}
            className={`c2-nav__item c2-nav__item--sub ${isActive({ kind: 'type', t: t.type }) ? 'c2-nav__item--active' : ''}`}
            onClick={() => {
              setSel({ kind: 'type', t: t.type });
              setSelectedId(null);
            }}
          >
            <span className="c2-nav__icon">{t.icon}</span>
            {t.label}
          </button>
        ))}

        <hr className="c2-nav__div" />

        <button
          className={`c2-nav__item ${isActive({ kind: 'all' }) ? 'c2-nav__item--active' : ''}`}
          onClick={() => {
            setSel({ kind: 'all' });
            setSelectedId(null);
          }}
        >
          <span className="c2-nav__icon"><LayersIcon /></span>
          All Resource sets
        </button>
        {SETS2.map((s) => (
          <button
            key={s.id}
            className={`c2-nav__item c2-nav__item--sub ${isActive({ kind: 'set', id: s.id }) ? 'c2-nav__item--active' : ''}`}
            onClick={() => {
              setSel({ kind: 'set', id: s.id });
              setSelectedId(null);
            }}
          >
            <span className="c2-nav__dot" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </aside>

      {/* ---- Middle: overview tables ---- */}
      <section className="c2-mid">
        {setsToShow.map((s) => {
          const rows = typeFilter ? s.resources.filter((r) => r.type === typeFilter) : s.resources;
          if (rows.length === 0) return null;
          return (
            <div className="c2-set" key={s.id}>
              <div className="c2-set__head">
                <div className="c2-set__title">
                  <span className="c2-nav__dot" style={{ background: s.color }} />
                  {s.name}
                  {typeFilter && <Pill type="feature">{TYPE_LABEL[typeFilter]}s</Pill>}
                </div>
                <Button variant="outline" size="sm" prefix={<PlusIcon size={14} />}>New resource</Button>
              </div>

              <div className="res-table">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className={`res-row ${selectedId === r.id ? 'res-row--selected' : ''}`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <Preview r={r} />
                    <div style={{ minWidth: 0 }}>
                      <div className="res-row__label">{r.name}</div>
                      <div className="res-row__sub">{valueSummary(r)}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span className="res-key">
                        <span style={{ color: 'var(--text-tertiary)' }}>resource.</span>
                        <b>{r.key}</b>
                      </span>
                    </div>
                    <span className="res-used">
                      <LinkIcon size={13} /> <b>{r.usedBy}</b> {r.usedBy === 1 ? 'use' : 'uses'}
                    </span>
                    <button
                      className="icon-btn"
                      aria-label="Open resource"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(r.id);
                      }}
                    >
                      <DotsIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ---- Right: inspector / editor (appears when a resource is opened) ---- */}
      {selected && (
        <aside className="c2-insp">
          <Inspector r={selected} setName={selectedSetName} onClose={() => setSelectedId(null)} />
        </aside>
      )}
    </div>
  );
}

function valueSummary(r: R2): string {
  return r.value;
}

function Preview({ r }: { r: R2 }) {
  if (r.type === 'color')
    return (
      <div className="swatch">
        <div className="swatch__fill" style={{ background: r.value }} />
      </div>
    );
  if (r.type === 'asset')
    return <div className="asset-thumb">{r.fileUrl && <img src={r.fileUrl} alt="" />}</div>;
  if (r.type === 'font') return <div className="font-preview">Ag</div>;
  return <div className="c2-strprev">""</div>;
}

/* ---------------- Inspector ---------------- */
function Inspector({ r, setName, onClose }: { r: R2; setName: string; onClose: () => void }) {
  return (
    <>
      <div className="c2-insp__head">
        <Preview r={r} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
          <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>resource.{r.key}</div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close inspector">✕</button>
      </div>

      <div className="c2-insp__body">
        <div className="c2-insp__scope">
          <LayersIcon size={13} /> In <b>{setName}</b>
        </div>

        {r.type === 'color' && (
          <Field label="Value">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" className="color-native" defaultValue={r.value.slice(0, 7)} aria-label="Color" />
              <Input mono defaultValue={r.value} />
            </div>
          </Field>
        )}
        {r.type === 'font' && (
          <Field label="Value">
            <Input defaultValue={r.value} />
          </Field>
        )}
        {r.type === 'string' && (
          <Field label="Value">
            <Input defaultValue={r.value} />
          </Field>
        )}
        {r.type === 'asset' && (
          <Field label="Upload">
            <div className="c1-upload">
              <span className="c1-upload__thumb">{r.fileUrl && <img src={r.fileUrl} alt="" />}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-mono" style={{ fontSize: 12.5 }}>{r.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>File · SVG/PNG</div>
              </div>
              <Button variant="outline" size="sm" prefix={<UploadIcon size={14} />}>File</Button>
            </div>
          </Field>
        )}

        <Field label="ID" hint="Immutable — referenced as resource.<key>.">
          <div className="input-affix" style={{ background: 'var(--bg-input-disabled)' }}>
            <span className="input-affix__prefix">resource.</span>
            <input className="t-mono" value={r.key} disabled style={{ fontSize: 13, color: 'var(--text-secondary)' }} />
            <span style={{ paddingRight: 10, color: 'var(--text-tertiary)' }}><LockIcon size={14} /></span>
          </div>
        </Field>

        <Field label="Type">
          <div className="c1-locked">
            {TYPE_LABEL[r.type]}
            <span className="c1-locked__tag"><LockIcon size={13} /></span>
          </div>
        </Field>

        <div className="c2-refs">
          <LinkIcon size={13} /> Referenced by <b>{r.usedBy}</b> {r.usedBy === 1 ? 'place' : 'places'}.
        </div>

        <Button full prefix={<span style={{ display: 'inline-flex' }}>✓</span>}>Save</Button>
      </div>
    </>
  );
}
