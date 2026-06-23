import { useState } from 'react';
import { Modal, Button, Pill } from './ui';
import { ResourcePreview } from './Previews';
import { ArchiveIcon, WarningIcon, TemplateIcon, ThemeIcon, FlowIcon } from './ui/Icon';
import { type Resource, referencesFor, type ConsumerGroup } from '../data/resources';

const GROUP_META: Record<ConsumerGroup, { label: string; icon: React.ReactNode }> = {
  templates: { label: 'Templates', icon: <TemplateIcon /> },
  themes: { label: 'Themes', icon: <ThemeIcon /> },
  workflows: { label: 'Workflows', icon: <FlowIcon /> },
};

export function ArchiveModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const refs = referencesFor[resource.id] ?? [];
  const referenced = resource.usedBy > 0;
  const [confirmText, setConfirmText] = useState('');
  const groups: ConsumerGroup[] = ['templates', 'workflows', 'themes'];
  const crossSet = refs.some((r) => r.mode === 'overrides');

  return (
    <Modal onClose={onClose} width={520}>
      <div className="modal__head">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: referenced ? 'var(--color-core-red-100)' : 'var(--bg-active)',
            color: referenced ? 'var(--color-core-red-800)' : 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
            flex: 'none',
          }}
        >
          {referenced ? <WarningIcon /> : <ArchiveIcon />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            Archive “{resource.label}”?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Archiving keeps history and lets you restore later. We prefer it over hard-delete.
          </div>
        </div>
      </div>

      <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            border: '1px solid var(--border-divider)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <ResourcePreview resource={resource} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{resource.label}</div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              resource.{resource.key}
            </div>
          </div>
          <Pill type={referenced ? 'critical' : 'neutral'}>
            {resource.usedBy} {resource.usedBy === 1 ? 'reference' : 'references'}
          </Pill>
        </div>

        {referenced ? (
          <>
            <div className="callout callout--danger">
              <span className="callout__icon">
                <WarningIcon />
              </span>
              <span>
                <b>This resource is still referenced.</b> Archiving it now will break the following
                consumers — they’ll fall back to a missing value.
              </span>
            </div>

            <div className="break-list">
              {groups.map((g) => {
                const rows = refs.filter((r) => r.group === g);
                if (rows.length === 0) return null;
                return (
                  <div className="break-list__group" key={g}>
                    <div className="break-list__ghead">
                      {GROUP_META[g].label} · {rows.length}
                    </div>
                    {rows.slice(0, 4).map((r, i) => (
                      <div className="break-list__item" key={i}>
                        <span className="menu__icon">{GROUP_META[g].icon}</span>
                        <span style={{ flex: 1 }}>{r.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.context}</span>
                      </div>
                    ))}
                    {rows.length > 4 && (
                      <div className="break-list__item" style={{ color: 'var(--text-secondary)' }}>
                        + {rows.length - 4} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {crossSet && (
              <div className="callout callout--warn">
                <span className="callout__icon">
                  <WarningIcon />
                </span>
                <span>
                  <b>Cross-set impact.</b> Other sets override this key. Archiving it in Default
                  removes the value they inherit and can break interchangeability.
                </span>
              </div>
            )}

            <div className="field">
              <label className="field__label">
                Type <span className="t-mono">{resource.key}</span> to confirm
              </label>
              <input
                className="input input--mono"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={resource.key}
              />
            </div>
          </>
        ) : (
          <div className="callout callout--info">
            <span className="callout__icon">
              <ArchiveIcon />
            </span>
            <span>
              This resource has <b>zero references</b>, so archiving is safe. You can restore it from
              the archive at any time.
            </span>
          </div>
        )}
      </div>

      <div className="modal__foot">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {referenced ? (
          <Button
            variant="danger"
            disabled={confirmText.trim() !== resource.key}
            onClick={onClose}
          >
            Archive anyway
          </Button>
        ) : (
          <Button prefix={<ArchiveIcon />} onClick={onClose}>
            Archive resource
          </Button>
        )}
      </div>
    </Modal>
  );
}
