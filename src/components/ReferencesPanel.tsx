import { Sheet, SheetHeader, Pill, Button } from './ui';
import { ResourcePreview } from './Previews';
import { LinkIcon, TemplateIcon, ThemeIcon, FlowIcon, ArrowRightIcon } from './ui/Icon';
import {
  type Resource,
  type ConsumerGroup,
  referencesFor,
  type Reference,
} from '../data/resources';

const GROUP_META: Record<ConsumerGroup, { label: string; icon: React.ReactNode }> = {
  templates: { label: 'Templates', icon: <TemplateIcon /> },
  themes: { label: 'Themes', icon: <ThemeIcon /> },
  workflows: { label: 'Workflows', icon: <FlowIcon /> },
};

export function ReferencesPanel({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const refs: Reference[] = referencesFor[resource.id] ?? syntheticRefs(resource);
  const byGroup = (g: ConsumerGroup) => refs.filter((r) => r.group === g);
  const groups: ConsumerGroup[] = ['templates', 'workflows', 'themes'];
  const counts = groups.map((g) => ({ g, n: byGroup(g).length })).filter((x) => x.n > 0);
  const isLow = refs.length <= 3;

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        icon={<LinkIcon />}
        title="Used by"
        subtitle={
          <span className="t-mono" style={{ fontSize: 12 }}>
            resource.{resource.key}
          </span>
        }
        onClose={onClose}
      />
      <div className="sheet__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ResourcePreview resource={resource} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{resource.label}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              {resource.type === 'color' && resource.color?.hex}
              {resource.type === 'font' && `${resource.font?.family} · ${resource.font?.weight}`}
              {resource.type === 'asset' && `${resource.asset?.format} · ${resource.asset?.w}×${resource.asset?.h}`}
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid var(--border-divider)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 16px',
            background: 'var(--bg-secondary)',
          }}
        >
          <div className="refs-magnitude">
            Used in{' '}
            {counts.map((c, i) => (
              <span key={c.g}>
                <b>
                  {c.n} {c.n === 1 ? GROUP_META[c.g].label.replace(/s$/, '').toLowerCase() : GROUP_META[c.g].label.toLowerCase()}
                </b>
                {i < counts.length - 1 ? <span style={{ color: 'var(--text-tertiary)' }}> · </span> : ''}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
            Editing this resource updates every consumer below. {refs.filter((r) => r.mode === 'overrides').length} of
            them override it in another set.
          </div>
        </div>

        {isLow ? (
          <div>
            <div className="ref-group__head">References</div>
            {refs.map((r, i) => (
              <RefRow key={i} r={r} />
            ))}
          </div>
        ) : (
          groups.map((g) => {
            const rows = byGroup(g);
            if (rows.length === 0) return null;
            return (
              <div className="ref-group" key={g}>
                <div className="ref-group__head">
                  {GROUP_META[g].icon}
                  {GROUP_META[g].label}
                  <span className="ref-group__count">{rows.length}</span>
                </div>
                {rows.map((r, i) => (
                  <RefRow key={i} r={r} />
                ))}
              </div>
            );
          })
        )}
      </div>
      <div className="sheet__foot">
        <Button variant="outline" full onClick={onClose}>
          Close
        </Button>
        <Button full suffix={<ArrowRightIcon />}>
          Open impact report
        </Button>
      </div>
    </Sheet>
  );
}

function RefRow({ r }: { r: Reference }) {
  return (
    <div className="ref-row">
      <div className="ref-row__icon">{GROUP_META[r.group].icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ref-row__name">{r.name}</div>
        <div className="ref-row__ctx">
          {r.context} · {r.set}
        </div>
      </div>
      {r.mode === 'overrides' ? (
        <Pill type="feature">Overrides</Pill>
      ) : (
        <Pill type="neutral">Inherits</Pill>
      )}
    </div>
  );
}

function syntheticRefs(resource: Resource): Reference[] {
  const out: Reference[] = [];
  const t = Math.min(resource.usedBy, 6);
  for (let i = 0; i < t; i++) {
    out.push({
      group: i % 4 === 3 ? 'workflows' : i % 3 === 2 ? 'themes' : 'templates',
      name: ['Government ID', 'Document Verification', 'KYB Onboarding', 'Welcome Email', 'Light Theme', 'Reverification'][i % 6],
      context: ['Start screen', 'Header', 'CTA button', 'Body', 'accent token', 'Step 2'][i % 6],
      mode: i % 5 === 4 ? 'overrides' : 'inherits',
      set: i % 5 === 4 ? "Andrew's Bakery" : 'Default',
    });
  }
  return out;
}
