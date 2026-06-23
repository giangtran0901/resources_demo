import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDownIcon, CheckIcon, CloseIcon } from './Icon';
import './ui.css';

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'basic' | 'outline' | 'text' | 'danger';
export function Button({
  variant = 'primary',
  size = 'md',
  full,
  iconOnly,
  prefix,
  suffix,
  children,
  className = '',
  ...props
}: {
  variant?: Variant;
  size?: 'md' | 'sm';
  full?: boolean;
  iconOnly?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix' | 'color'>) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''} ${
        iconOnly ? 'btn--icon' : ''
      } ${className}`}
      {...props}
    >
      {prefix}
      {children}
      {suffix}
    </button>
  );
}

/* ---------------- StatusIndicator (pill) ---------------- */
type PillType = 'neutral' | 'feature' | 'success' | 'warning' | 'informational' | 'critical';
export function Pill({
  type = 'neutral',
  dot = true,
  children,
}: {
  type?: PillType;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`pill pill--${type}`}>
      {dot && <span className="pill__dot" />}
      {children}
    </span>
  );
}

/* ---------------- Card ---------------- */
export function Card({
  children,
  className = '',
  style,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/* ---------------- Field wrapper ---------------- */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  trailing,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="field">
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="field__label" htmlFor={htmlFor}>
            {label}
          </label>
          {trailing}
        </div>
      )}
      {children}
      {error ? (
        <span className="field__error">{error}</span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

/* ---------------- Input ---------------- */
export function Input({
  invalid,
  mono,
  className = '',
  ...props
}: { invalid?: boolean; mono?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`input ${invalid ? 'input--error' : ''} ${mono ? 'input--mono' : ''} ${className}`}
      {...props}
    />
  );
}

export function PrefixInput({
  prefix,
  invalid,
  ...props
}: { prefix: string; invalid?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className="input-affix"
      style={invalid ? { borderColor: 'var(--color-core-red-600)' } : undefined}
    >
      <span className="input-affix__prefix">{prefix}</span>
      <input className="t-mono" style={{ fontSize: 13 }} {...props} />
    </div>
  );
}

/* ---------------- Select ---------------- */
export type SelectOption = { value: string; label: ReactNode; sublabel?: string };
export function Select({
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: {
  value?: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="select" ref={ref}>
      <button
        type="button"
        className="select__btn"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="select__menu" role="listbox">
          {options.map((o) => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`select__option ${o.value === value ? 'select__option--active' : ''}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{o.label}</span>
                {o.sublabel && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.sublabel}</span>
                )}
              </span>
              {o.value === value && <CheckIcon />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Segmented control ---------------- */
export function Segmented<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: ReactNode }[];
}) {
  return (
    <div className="segmented" role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          className={`segmented__item ${value === it.value ? 'segmented__item--selected' : ''}`}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Toggle ---------------- */
export function Toggle({
  checked,
  onChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className="toggle"
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  );
}

/* ---------------- Tooltip ---------------- */
export function Tooltip({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <span className="tip">
      {children}
      <span className="tip__bubble">{label}</span>
    </span>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({
  onClose,
  children,
  width,
}: {
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay overlay--center" onMouseDown={onClose}>
      <div className="modal" style={width ? { width } : undefined} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Side panel / sheet ---------------- */
export function Sheet({
  onClose,
  children,
  wide,
}: {
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay overlay--right" onMouseDown={onClose}>
      <div className={`sheet ${wide ? 'sheet--wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  title,
  subtitle,
  onClose,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '18px 20px',
        borderBottom: '1px solid var(--border-divider)',
      }}
    >
      {icon && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-highlight)',
            color: 'var(--text-brand)',
            display: 'grid',
            placeItems: 'center',
            flex: 'none',
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      <button className="icon-btn" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
    </div>
  );
}
