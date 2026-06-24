import { Fragment, useMemo, useRef, useState } from 'react';
import { Sheet, SheetHeader, Button, Field, Input, PrefixInput, Select, Pill, Tooltip } from './ui';
import {
  ColorIcon,
  FontIcon,
  AssetIcon,
  LockIcon,
  CheckIcon,
  WarningIcon,
  InfoIcon,
  UploadIcon,
  HistoryIcon,
  ArrowRightIcon,
  PlusIcon,
} from './ui/Icon';
import {
  type Resource,
  type ResourceType,
  type ResourceSet,
  resourcesBySet,
  typeMeta,
} from '../data/resources';
import { normalizeHex, bestTextOn, formatBytes } from '../lib/color';

type Mode = 'create' | 'edit';

const TYPE_ICON: Record<ResourceType, React.ReactNode> = {
  color: <ColorIcon />,
  font: <FontIcon />,
  asset: <AssetIcon />,
};

const FONT_FAMILIES = [
  'ABC Monument Grotesk',
  'ABC Monument Grotesk Mono',
  'Inter',
  'Playfair Display',
  'Georgia',
  'IBM Plex Mono',
];
const FONT_WEIGHTS = [
  { value: '300', label: 'Light · 300' },
  { value: '400', label: 'Regular · 400' },
  { value: '500', label: 'Medium · 500' },
  { value: '700', label: 'Bold · 700' },
];

function suggestKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.');
}

const KEY_RE = /^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/;

export function ResourceEditor({
  mode,
  type,
  existing,
  sets,
  currentSetId,
  onClose,
}: {
  mode: Mode;
  type: ResourceType;
  existing?: Resource;
  sets: ResourceSet[];
  currentSetId: string;
  onClose: () => void;
}) {
  const isEdit = mode === 'edit';
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  // value state
  const [hex, setHex] = useState(existing?.color?.hex ?? '#3F48FD');
  const [hexInput, setHexInput] = useState(existing?.color?.hex ?? '#3F48FD');
  const [family, setFamily] = useState(existing?.font?.family ?? 'ABC Monument Grotesk');
  const [weight, setWeight] = useState(String(existing?.font?.weight ?? 400));
  const [italic, setItalic] = useState(existing?.font?.style === 'italic');
  const [asset, setAsset] = useState<{ url: string; name: string; bytes: number; format: 'SVG' | 'PNG'; w: number; h: number } | null>(
    existing?.asset ? { url: existing.asset.url, name: existing.label, bytes: existing.asset.bytes, format: existing.asset.format, w: existing.asset.w, h: existing.asset.h } : null,
  );

  // identity
  const [label, setLabel] = useState(existing?.label ?? '');
  const [keyTouched, setKeyTouched] = useState(isEdit);
  const [key, setKey] = useState(existing?.key ?? '');

  // scope
  const [scopeSetId, setScopeSetId] = useState(currentSetId === 'default' ? 'default' : currentSetId);

  const effectiveKey = keyTouched ? key : suggestKey(label);
  const existingKeys = useMemo(
    () => new Set(resourcesBySet[scopeSetId]?.map((r) => r.key).filter((k) => k !== existing?.key)),
    [scopeSetId, existing?.key],
  );
  const keyFormatOk = KEY_RE.test(effectiveKey);
  const keyUnique = !existingKeys.has(effectiveKey);
  const keyError = !effectiveKey ? null : !keyFormatOk ? 'Use lowercase, dot-namespaced (e.g. brand.primary)' : !keyUnique ? 'A resource with this key already exists in this set' : null;

  const valueValid = type === 'color' ? !!normalizeHex(hexInput) : type === 'font' ? !!family : !!asset;
  const identityValid = label.trim().length > 0 && keyFormatOk && keyUnique;

  // Has the user actually changed anything in edit mode?
  const dirty =
    isEdit &&
    !!existing &&
    (label !== existing.label ||
      (type === 'color' && (normalizeHex(hexInput)?.slice(0, 7) ?? hex) !== existing.color?.hex) ||
      (type === 'font' &&
        (family !== existing.font?.family ||
          Number(weight) !== existing.font?.weight ||
          (italic ? 'italic' : 'normal') !== existing.font?.style)) ||
      (type === 'asset' && asset?.url !== existing.asset?.url));

  function handleEditSave() {
    if (dirty && (existing?.usedBy ?? 0) > 0) {
      setConfirmSave(true);
    } else {
      setDone(true);
    }
  }

  const totalSteps = 4;

  function commitHex(v: string) {
    setHexInput(v);
    const n = normalizeHex(v);
    if (n) setHex(n.slice(0, 7));
  }

  const goNext = () => setStep((s) => Math.min(totalSteps, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const scopeSet = sets.find((s) => s.id === scopeSetId)!;
  const keyInDefault = resourcesBySet.default.some((r) => r.key === effectiveKey);
  const subBusinessLocalWarning = scopeSetId !== 'default' && !keyInDefault && !!effectiveKey && keyFormatOk;

  if (done) {
    return (
      <SuccessView
        type={type}
        label={label || existing?.label || 'Resource'}
        keyName={effectiveKey}
        hex={hex}
        family={family}
        weight={weight}
        italic={italic}
        asset={asset}
        setName={scopeSet.name}
        isOverride={scopeSetId !== 'default'}
        onClose={onClose}
        onAddAnother={() => {
          setDone(false);
          setStep(1);
          setLabel('');
          setKey('');
          setKeyTouched(false);
        }}
      />
    );
  }

  const title = isEdit ? `Edit ${typeMeta[type].label.toLowerCase()}` : `New ${typeMeta[type].label.toLowerCase()}`;

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        icon={TYPE_ICON[type]}
        title={title}
        subtitle={isEdit ? <span className="t-mono" style={{ fontSize: 12 }}>resource.{existing?.key}</span> : `Define the value first, then name it`}
        onClose={onClose}
      />

      {!isEdit && (
        <div className="steps">
          {[
            { n: 1, label: 'Value' },
            { n: 2, label: 'Identity' },
            { n: 3, label: 'Scope' },
            { n: 4, label: 'Save' },
          ].map((s, i) => (
            <Fragment key={s.n}>
              {i > 0 && <span className="step-sep" />}
              <button
                className={`step-dot ${step === s.n ? 'step-dot--active' : ''} ${step > s.n ? 'step-dot--done' : ''}`}
                onClick={() => (step > s.n ? setStep(s.n) : undefined)}
                style={{ background: 'none', border: 'none', cursor: step > s.n ? 'pointer' : 'default' }}
              >
                <span className="step-dot__num">{step > s.n ? <CheckIcon size={12} /> : s.n}</span>
                {s.label}
              </button>
            </Fragment>
          ))}
        </div>
      )}

      <div className="sheet__body">
        {/* ---------- VALUE (step 1) ---------- */}
        {(isEdit || step === 1) && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="section-label">Value</div>
              <div className="section-help">
                {type === 'color' && 'Pick a color and fine-tune the hex.'}
                {type === 'font' && 'Choose family, weight, and style — not a single text box.'}
                {type === 'asset' && 'Upload first. We validate format and size, and flag duplicates.'}
              </div>
            </div>

            {type === 'color' && (
              <ColorEditor hex={hex} hexInput={hexInput} onPick={(v) => { setHex(v); setHexInput(v); }} onHexInput={commitHex} />
            )}
            {type === 'font' && (
              <FontEditor
                family={family}
                weight={weight}
                italic={italic}
                onFamily={setFamily}
                onWeight={setWeight}
                onItalic={setItalic}
              />
            )}
            {type === 'asset' && <AssetEditor asset={asset} onChange={setAsset} />}

            {isEdit && (
              <ImpactAndHistory existing={existing!} />
            )}
          </section>
        )}

        {/* ---------- IDENTITY (step 2) ---------- */}
        {(isEdit || step === 2) && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isEdit && <hr className="divider" />}
            <div>
              <div className="section-label">Identity</div>
              <div className="section-help">A human label you can change anytime, and an immutable key.</div>
            </div>

            <Field label="Label">
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Brand Primary" autoFocus={!isEdit} />
            </Field>

            <Field
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Key
                  {isEdit && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontWeight: 400 }}>
                      <LockIcon size={13} /> locked
                    </span>
                  )}
                </span>
              }
              hint={
                isEdit
                  ? 'Keys can never be renamed — consumers reference it directly.'
                  : 'Auto-suggested from the label. Keys can’t be renamed after saving.'
              }
              error={!isEdit ? keyError : undefined}
              trailing={
                !isEdit && !keyTouched && label ? (
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>auto-suggested</span>
                ) : undefined
              }
            >
              {isEdit ? (
                <div className="input-affix" style={{ background: 'var(--bg-input-disabled)' }}>
                  <span className="input-affix__prefix">resource.</span>
                  <input className="t-mono" value={existing?.key} disabled style={{ fontSize: 13, color: 'var(--text-secondary)' }} />
                  <span style={{ paddingRight: 10, color: 'var(--text-tertiary)' }}>
                    <LockIcon size={14} />
                  </span>
                </div>
              ) : (
                <PrefixInput
                  prefix="resource."
                  value={effectiveKey}
                  invalid={!!keyError}
                  onChange={(e) => {
                    setKeyTouched(true);
                    setKey(e.target.value);
                  }}
                  placeholder="brand.primary"
                />
              )}
            </Field>

            {!isEdit && keyFormatOk && keyUnique && effectiveKey && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--color-core-green-700)' }}>
                  <CheckIcon size={14} />
                </span>
                Referenced in code as{' '}
                <span className="kbd">resource.{effectiveKey}</span>
                {!effectiveKey.includes('.') && (
                  <Tooltip label="Namespacing keeps keys organized and avoids collisions">
                    <span style={{ color: 'var(--text-brand)', cursor: 'help' }}>· try a namespace</span>
                  </Tooltip>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---------- SCOPE (step 3) ---------- */}
        {!isEdit && step === 3 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="section-label">Scope</div>
              <div className="section-help">Which set does this belong to?</div>
            </div>

            <div
              className={`scope-card ${scopeSetId === 'default' ? 'scope-card--active' : ''}`}
              onClick={() => setScopeSetId('default')}
            >
              <span className="scope-radio" />
              <div>
                <div className="scope-card__title">Add to Default <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>· all sets inherit</span></div>
                <div className="scope-card__desc">
                  Available org-wide. Every named set inherits this unless it overrides the key.
                </div>
              </div>
            </div>

            {sets
              .filter((s) => !s.isDefault)
              .map((s) => (
                <div
                  key={s.id}
                  className={`scope-card ${scopeSetId === s.id ? 'scope-card--active' : ''}`}
                  onClick={() => setScopeSetId(s.id)}
                >
                  <span className="scope-radio" />
                  <div>
                    <div className="scope-card__title">
                      Override in {s.name} only
                    </div>
                    <div className="scope-card__desc">{s.description}</div>
                  </div>
                </div>
              ))}

            {subBusinessLocalWarning && (
              <div className="callout callout--warn">
                <span className="callout__icon"><WarningIcon /></span>
                <span>
                  <b>This key doesn’t exist in Default.</b> Creating <span className="t-mono">{effectiveKey}</span> only
                  in {scopeSet.name} makes it <b>local-only</b> and breaks interchangeability between sets. Consider
                  adding it to Default instead.
                </span>
              </div>
            )}
          </section>
        )}

        {/* ---------- SAVE (step 4) ---------- */}
        {!isEdit && step === 4 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="section-label">Review &amp; save</div>
              <div className="section-help">New resources have zero references, so saving is safe.</div>
            </div>

            <ReviewCard
              type={type}
              label={label}
              keyName={effectiveKey}
              hex={hex}
              family={family}
              weight={weight}
              italic={italic}
              asset={asset}
            />

            <div className="success-summary" style={{ background: 'var(--bg-secondary)' }}>
              <span style={{ color: 'var(--text-brand)' }}><InfoIcon /></span>
              <div style={{ fontSize: 13 }}>
                Saving to <b>{scopeSet.name}</b>{scopeSetId === 'default' ? ' — all sets will inherit it.' : ' as an override.'} No versioning; you can edit the value anytime.
              </div>
            </div>
          </section>
        )}
      </div>

      {/* footer */}
      <div
        className="sheet__foot"
        style={isEdit && confirmSave ? { flexDirection: 'column', alignItems: 'stretch', gap: 12 } : undefined}
      >
        {isEdit ? (
          confirmSave ? (
            <>
              <div className="callout callout--feature">
                <span className="callout__icon"><InfoIcon /></span>
                <span>
                  <b>Editing the base value cascades.</b> Saving updates{' '}
                  <b>{existing!.usedBy} consumers</b> across templates, themes, and workflows that
                  inherit <span className="t-mono">resource.{existing!.key}</span>.
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="outline" full onClick={() => setConfirmSave(false)}>
                  Keep editing
                </Button>
                <Button full prefix={<CheckIcon />} onClick={() => setDone(true)}>
                  Save changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <div style={{ flex: 1 }} />
              <Button prefix={<CheckIcon />} disabled={!valueValid || !label.trim() || !dirty} onClick={handleEditSave}>
                Save changes
              </Button>
            </>
          )
        ) : (
          <>
            {step > 1 ? (
              <Button variant="outline" onClick={goBack}>Back</Button>
            ) : (
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            )}
            <div style={{ flex: 1 }} />
            {step < totalSteps ? (
              <Button
                suffix={<ArrowRightIcon />}
                disabled={(step === 1 && !valueValid) || (step === 2 && !identityValid)}
                onClick={goNext}
              >
                Continue
              </Button>
            ) : (
              <Button prefix={<CheckIcon />} onClick={() => setDone(true)}>
                Save resource
              </Button>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}

/* ===================== Color editor ===================== */
function ColorEditor({
  hex,
  hexInput,
  onPick,
  onHexInput,
}: {
  hex: string;
  hexInput: string;
  onPick: (v: string) => void;
  onHexInput: (v: string) => void;
}) {
  const valid = !!normalizeHex(hexInput);

  return (
    <div className="color-stage">
      <div className="color-bigswatch">
        <div className="color-bigswatch__fill" style={{ background: valid ? hex : 'transparent' }}>
          <span
            className="t-mono"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: bestTextOn(valid ? hex : '#ffffff'),
              background: 'rgba(0,0,0,0.0)',
            }}
          >
            {hex}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 'none' }}>
          <input
            type="color"
            className="color-native"
            value={normalizeHex(hexInput)?.slice(0, 7) ?? '#3f48fd'}
            onChange={(e) => onPick(e.target.value.toUpperCase())}
            aria-label="Color picker"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Hex / RGBA" error={!valid && hexInput ? 'Enter a valid hex (e.g. #3F48FD)' : undefined}>
            <Input mono value={hexInput} invalid={!valid && !!hexInput} onChange={(e) => onHexInput(e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ===================== Font editor ===================== */
function FontEditor({
  family,
  weight,
  italic,
  onFamily,
  onWeight,
  onItalic,
}: {
  family: string;
  weight: string;
  italic: boolean;
  onFamily: (v: string) => void;
  onWeight: (v: string) => void;
  onItalic: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="font-sample" style={{ fontFamily: `'${family}', sans-serif`, fontWeight: Number(weight), fontStyle: italic ? 'italic' : 'normal' }}>
        <div className="font-sample__big">Verify with confidence</div>
        <div className="font-sample__small">The quick brown fox jumps over the lazy dog · 0123456789</div>
      </div>

      <Field label="Family">
        <Select value={family} onChange={onFamily} options={FONT_FAMILIES.map((f) => ({ value: f, label: f }))} />
      </Field>

      <div className="row-2">
        <Field label="Weight">
          <Select value={weight} onChange={onWeight} options={FONT_WEIGHTS} />
        </Field>
        <Field label="Style">
          <Select
            value={italic ? 'italic' : 'normal'}
            onChange={(v) => onItalic(v === 'italic')}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'italic', label: 'Italic' },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

/* ===================== Asset editor ===================== */
function AssetEditor({
  asset,
  onChange,
}: {
  asset: { url: string; name: string; bytes: number; format: 'SVG' | 'PNG'; w: number; h: number } | null;
  onChange: (a: { url: string; name: string; bytes: number; format: 'SVG' | 'PNG'; w: number; h: number } | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dup, setDup] = useState(false);

  function handleFiles(files: FileList | null) {
    setError(null);
    setDup(false);
    const f = files?.[0];
    if (!f) return;
    const isSvg = f.type === 'image/svg+xml' || f.name.endsWith('.svg');
    const isPng = f.type === 'image/png' || f.name.endsWith('.png');
    if (!isSvg && !isPng) {
      setError('Unsupported format. Use SVG or PNG.');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError('File is too large. Max 2 MB.');
      return;
    }
    // simulate near-duplicate detection
    if (/logo/i.test(f.name)) setDup(true);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      onChange({ url, name: f.name, bytes: f.size, format: isSvg ? 'SVG' : 'PNG', w: img.naturalWidth || 240, h: img.naturalHeight || 120 });
    };
    img.onerror = () => onChange({ url, name: f.name, bytes: f.size, format: isSvg ? 'SVG' : 'PNG', w: 240, h: 120 });
    img.src = url;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!asset ? (
        <div
          className="dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="dropzone__icon"><UploadIcon size={20} /></div>
          <div style={{ fontWeight: 500 }}>Drop an image, or click to upload</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>SVG or PNG · up to 2 MB</div>
        </div>
      ) : (
        <div className="asset-preview">
          <div className="asset-preview__canvas">
            <img src={asset.url} alt={asset.name} />
          </div>
          <div className="asset-preview__meta">
            <span><b>{asset.format}</b></span>
            <span>{asset.w}×{asset.h}</span>
            <span>{formatBytes(asset.bytes)}</span>
            <div style={{ flex: 1 }} />
            <button className="btn btn--text btn--sm" onClick={() => { onChange(null); setDup(false); }}>Replace</button>
          </div>
        </div>
      )}

      {error && (
        <div className="callout callout--danger">
          <span className="callout__icon"><WarningIcon /></span>
          <span>{error}</span>
        </div>
      )}

      {dup && (
        <div className="callout callout--warn">
          <span className="callout__icon"><WarningIcon /></span>
          <span>
            <b>Possible duplicate.</b> A similar file is already saved as <span className="t-mono">asset.logo</span>.
            Reference the existing resource instead of uploading a copy?
          </span>
        </div>
      )}
    </div>
  );
}

/* ===================== Edit-mode impact + history ===================== */
function ImpactAndHistory({ existing }: { existing: Resource }) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        className="btn btn--text btn--sm"
        style={{ alignSelf: 'flex-start', gap: 6 }}
        onClick={() => setShowHistory((s) => !s)}
      >
        <HistoryIcon /> {showHistory ? 'Hide' : 'View'} edit history
      </button>

      {showHistory && (
        <div className="history" style={{ border: '1px solid var(--border-divider)', borderRadius: 'var(--radius-md)', padding: '4px 14px' }}>
          {[
            { when: existing.updatedAt, who: existing.updatedBy, what: 'Updated value' },
            { when: '2026-02-14', who: 'Maya Chen', what: 'Updated label' },
            { when: '2026-01-03', who: 'Devon Park', what: 'Created resource' },
          ].map((h, i) => (
            <div className="history__item" key={i}>
              <span className="history__dot" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{h.what}</div>
                <div className="history__when">{h.who} · {h.when}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 0 6px' }}>
            No versioning — history is the safety net for value changes.
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Review card ===================== */
function ReviewCard(props: {
  type: ResourceType;
  label: string;
  keyName: string;
  hex: string;
  family: string;
  weight: string;
  italic: boolean;
  asset: { url: string; format: string; w: number; h: number; bytes: number } | null;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--border-divider)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
      <Preview {...props} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{props.label || 'Untitled'}</div>
        <div className="t-mono" style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
          resource.{props.keyName}
        </div>
      </div>
      <Pill type="neutral">0 references</Pill>
    </div>
  );
}

function Preview({
  type,
  hex,
  family,
  weight,
  italic,
  asset,
  size = 44,
}: {
  type: ResourceType;
  hex: string;
  family: string;
  weight: string;
  italic: boolean;
  asset: { url: string } | null;
  size?: number;
}) {
  if (type === 'color') return <div className="swatch" style={{ width: size, height: size }}><div className="swatch__fill" style={{ background: hex }} /></div>;
  if (type === 'font')
    return (
      <div className="font-preview" style={{ width: size, height: size, fontFamily: `'${family}', sans-serif`, fontWeight: Number(weight), fontStyle: italic ? 'italic' : 'normal' }}>
        Ag
      </div>
    );
  return (
    <div className="asset-thumb" style={{ width: size, height: size }}>
      {asset && <img src={asset.url} alt="" />}
    </div>
  );
}

/* ===================== Success view ===================== */
function SuccessView({
  type,
  label,
  keyName,
  hex,
  family,
  weight,
  italic,
  asset,
  setName,
  isOverride,
  onClose,
  onAddAnother,
}: {
  type: ResourceType;
  label: string;
  keyName: string;
  hex: string;
  family: string;
  weight: string;
  italic: boolean;
  asset: { url: string; format: string; w: number; h: number; bytes: number } | null;
  setName: string;
  isOverride: boolean;
  onClose: () => void;
  onAddAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const snippet = `resource.${keyName}`;
  return (
    <Sheet onClose={onClose}>
      <SheetHeader title="Saved" onClose={onClose} icon={<CheckIcon />} />
      <div className="sheet__body">
        <div className="success-stage">
          <div className="success-check"><CheckIcon size={26} /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{label} is live</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              Saved to <b style={{ color: 'var(--text-primary)' }}>{setName}</b>
              {isOverride ? ' as an override.' : ' — every set inherits it.'}
            </div>
          </div>
        </div>

        <div className="success-summary">
          <Preview type={type} hex={hex} family={family} weight={weight} italic={italic} asset={asset} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{label}</div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{snippet}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 6 }}>Reference it anywhere</div>
          <div className="input-affix" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard?.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1400); }}>
            <input className="t-mono" readOnly value={snippet} style={{ fontSize: 13, paddingLeft: 10 }} />
            <button className="btn btn--text btn--sm" style={{ marginRight: 4 }}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
      </div>
      <div className="sheet__foot">
        <Button variant="outline" prefix={<PlusIcon />} onClick={onAddAnother}>Add another</Button>
        <div style={{ flex: 1 }} />
        <Button suffix={<ArrowRightIcon />} onClick={onClose}>Use it</Button>
      </div>
    </Sheet>
  );
}
