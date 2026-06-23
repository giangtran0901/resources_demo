export type ResourceType = 'color' | 'font' | 'asset';
export type ResourceState = 'inherited' | 'overridden' | 'local-only';

export type ColorValue = { hex: string };
export type FontValue = { family: string; weight: number; style: 'normal' | 'italic' };
export type AssetValue = { format: 'SVG' | 'PNG'; url: string; bytes: number; w: number; h: number };

export interface Resource {
  id: string;
  type: ResourceType;
  label: string;
  key: string;
  state: ResourceState;
  usedBy: number;
  color?: ColorValue;
  font?: FontValue;
  asset?: AssetValue;
  updatedAt: string;
  updatedBy: string;
}

export interface ResourceSet {
  id: string;
  name: string;
  isDefault: boolean;
  description: string;
}

export const sets: ResourceSet[] = [
  { id: 'default', name: 'Default', isDefault: true, description: 'Org-wide base. Every set inherits from here.' },
  { id: 'bakery', name: "Andrew's Bakery", isDefault: false, description: 'B2B2C sub-business · overrides 4 keys' },
  { id: 'northwind', name: 'Northwind Co', isDefault: false, description: 'B2B2C sub-business · overrides 2 keys' },
];

const PNG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f48fd"/><stop offset="1" stop-color="#36ebfd"/></linearGradient></defs><rect width="80" height="80" rx="14" fill="url(#g)"/><circle cx="40" cy="34" r="13" fill="#fff" opacity="0.92"/><rect x="18" y="50" width="44" height="9" rx="4.5" fill="#fff" opacity="0.85"/></svg>`,
  );

const LOGO = (text: string, bg: string, fg = '#fff') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="64"><rect width="120" height="64" rx="8" fill="${bg}"/><text x="60" y="38" font-family="Arial" font-size="20" font-weight="700" fill="${fg}" text-anchor="middle">${text}</text></svg>`,
  );

// Default set resources
export const defaultResources: Resource[] = [
  {
    id: 'r-brand-primary',
    type: 'color',
    label: 'Brand Primary',
    key: 'brand.primary',
    state: 'inherited',
    usedBy: 42,
    color: { hex: '#3F48FD' },
    updatedAt: '2026-05-02',
    updatedBy: 'Maya Chen',
  },
  {
    id: 'r-brand-accent',
    type: 'color',
    label: 'Brand Accent',
    key: 'brand.accent',
    state: 'inherited',
    usedBy: 18,
    color: { hex: '#36EBFD' },
    updatedAt: '2026-04-18',
    updatedBy: 'Maya Chen',
  },
  {
    id: 'r-surface',
    type: 'color',
    label: 'Surface',
    key: 'color.surface',
    state: 'inherited',
    usedBy: 67,
    color: { hex: '#FFFFFF' },
    updatedAt: '2026-03-30',
    updatedBy: 'Devon Park',
  },
  {
    id: 'r-text-primary',
    type: 'color',
    label: 'Text Primary',
    key: 'color.text.primary',
    state: 'inherited',
    usedBy: 88,
    color: { hex: '#313131' },
    updatedAt: '2026-03-30',
    updatedBy: 'Devon Park',
  },
  {
    id: 'r-success',
    type: 'color',
    label: 'Success',
    key: 'color.success',
    state: 'inherited',
    usedBy: 12,
    color: { hex: '#22966B' },
    updatedAt: '2026-02-11',
    updatedBy: 'Devon Park',
  },
  {
    id: 'r-font-heading',
    type: 'font',
    label: 'Heading',
    key: 'font.heading',
    state: 'inherited',
    usedBy: 31,
    font: { family: 'ABC Monument Grotesk', weight: 700, style: 'normal' },
    updatedAt: '2026-05-09',
    updatedBy: 'Maya Chen',
  },
  {
    id: 'r-font-body',
    type: 'font',
    label: 'Body',
    key: 'font.body',
    state: 'inherited',
    usedBy: 54,
    font: { family: 'ABC Monument Grotesk', weight: 400, style: 'normal' },
    updatedAt: '2026-05-09',
    updatedBy: 'Maya Chen',
  },
  {
    id: 'r-font-mono',
    type: 'font',
    label: 'Mono',
    key: 'font.mono',
    state: 'inherited',
    usedBy: 7,
    font: { family: 'ABC Monument Grotesk Mono', weight: 400, style: 'normal' },
    updatedAt: '2026-01-22',
    updatedBy: 'Devon Park',
  },
  {
    id: 'r-logo',
    type: 'asset',
    label: 'Logo',
    key: 'asset.logo',
    state: 'inherited',
    usedBy: 23,
    asset: { format: 'SVG', url: LOGO('Acme', '#3F48FD'), bytes: 4200, w: 120, h: 64 },
    updatedAt: '2026-04-02',
    updatedBy: 'Maya Chen',
  },
  {
    id: 'r-logo-mark',
    type: 'asset',
    label: 'Logo Mark',
    key: 'asset.logo.mark',
    state: 'inherited',
    usedBy: 15,
    asset: { format: 'SVG', url: PNG, bytes: 2100, w: 80, h: 80 },
    updatedAt: '2026-04-02',
    updatedBy: 'Maya Chen',
  },
  {
    id: 'r-hero',
    type: 'asset',
    label: 'Onboarding Hero',
    key: 'asset.onboarding.hero',
    state: 'inherited',
    usedBy: 4,
    asset: { format: 'PNG', url: PNG, bytes: 184000, w: 1200, h: 640 },
    updatedAt: '2026-03-15',
    updatedBy: 'Jordan Lee',
  },
];

// Bakery overrides + locals
export const bakeryResources: Resource[] = [
  { ...defaultResources[0], id: 'b-brand-primary', state: 'overridden', usedBy: 9, color: { hex: '#C47802' } },
  { ...defaultResources[1], id: 'b-brand-accent', state: 'overridden', usedBy: 3, color: { hex: '#F59602' } },
  { ...defaultResources[2], id: 'b-surface', state: 'inherited' },
  { ...defaultResources[3], id: 'b-text-primary', state: 'inherited' },
  { ...defaultResources[4], id: 'b-success', state: 'inherited' },
  {
    ...defaultResources[5],
    id: 'b-font-heading',
    state: 'overridden',
    usedBy: 6,
    font: { family: 'Playfair Display', weight: 700, style: 'normal' },
  },
  { ...defaultResources[6], id: 'b-font-body', state: 'inherited' },
  { ...defaultResources[7], id: 'b-font-mono', state: 'inherited' },
  {
    ...defaultResources[8],
    id: 'b-logo',
    state: 'overridden',
    usedBy: 5,
    asset: { format: 'SVG', url: LOGO('Bakery', '#C47802'), bytes: 5100, w: 120, h: 64 },
  },
  { ...defaultResources[9], id: 'b-logo-mark', state: 'inherited' },
  { ...defaultResources[10], id: 'b-hero', state: 'inherited' },
  {
    id: 'b-seasonal',
    type: 'color',
    label: 'Holiday Red',
    key: 'color.seasonal.holiday',
    state: 'local-only',
    usedBy: 2,
    color: { hex: '#E62711' },
    updatedAt: '2026-06-01',
    updatedBy: 'Andrew Diaz',
  },
];

export const northwindResources: Resource[] = [
  { ...defaultResources[0], id: 'n-brand-primary', state: 'overridden', usedBy: 6, color: { hex: '#013B93' } },
  { ...defaultResources[1], id: 'n-brand-accent', state: 'inherited' },
  { ...defaultResources[2], id: 'n-surface', state: 'inherited' },
  { ...defaultResources[3], id: 'n-text-primary', state: 'inherited' },
  { ...defaultResources[4], id: 'n-success', state: 'inherited' },
  { ...defaultResources[5], id: 'n-font-heading', state: 'inherited' },
  { ...defaultResources[6], id: 'n-font-body', state: 'inherited' },
  { ...defaultResources[7], id: 'n-font-mono', state: 'inherited' },
  {
    ...defaultResources[8],
    id: 'n-logo',
    state: 'overridden',
    usedBy: 4,
    asset: { format: 'SVG', url: LOGO('Northwind', '#013B93'), bytes: 6300, w: 120, h: 64 },
  },
  { ...defaultResources[9], id: 'n-logo-mark', state: 'inherited' },
  { ...defaultResources[10], id: 'n-hero', state: 'inherited' },
];

export const resourcesBySet: Record<string, Resource[]> = {
  default: defaultResources,
  bakery: bakeryResources,
  northwind: northwindResources,
};

export const typeMeta: Record<ResourceType, { label: string; plural: string }> = {
  color: { label: 'Color', plural: 'Colors' },
  font: { label: 'Font', plural: 'Fonts' },
  asset: { label: 'Asset', plural: 'Assets' },
};

export const stateMeta: Record<
  ResourceState,
  { label: string; pill: 'feature' | 'success' | 'warning' | 'neutral' }
> = {
  inherited: { label: 'Inherited', pill: 'neutral' },
  overridden: { label: 'Overridden', pill: 'feature' },
  'local-only': { label: 'Local only', pill: 'warning' },
};

/* ---------------- References data (for the Used-by panel) ---------------- */
export type ConsumerGroup = 'templates' | 'themes' | 'workflows';
export interface Reference {
  group: ConsumerGroup;
  name: string;
  context: string;
  mode: 'inherits' | 'overrides';
  set: string;
}

export const referencesFor: Record<string, Reference[]> = {
  'r-brand-primary': [
    { group: 'templates', name: 'Government ID + Selfie', context: 'Start screen · CTA button', mode: 'inherits', set: 'Default' },
    { group: 'templates', name: 'Document Verification', context: 'Header logo bar', mode: 'inherits', set: 'Default' },
    { group: 'templates', name: 'Database Verification', context: 'Progress indicator', mode: 'inherits', set: 'Default' },
    { group: 'templates', name: 'KYB Onboarding', context: 'Primary button · 3 steps', mode: 'inherits', set: 'Default' },
    { group: 'templates', name: 'Reverification Flow', context: 'Link color', mode: 'inherits', set: 'Default' },
    { group: 'templates', name: 'Bakery Signup', context: 'CTA button', mode: 'overrides', set: "Andrew's Bakery" },
    { group: 'templates', name: 'Bakery Reverify', context: 'Header', mode: 'overrides', set: "Andrew's Bakery" },
    { group: 'templates', name: 'Northwind KYC', context: 'Primary button', mode: 'overrides', set: 'Northwind Co' },
    { group: 'themes', name: 'Light Theme', context: 'accent / focus ring', mode: 'inherits', set: 'Default' },
    { group: 'themes', name: 'Dark Theme', context: 'accent / focus ring', mode: 'inherits', set: 'Default' },
    { group: 'themes', name: 'Bakery Theme', context: 'accent', mode: 'overrides', set: "Andrew's Bakery" },
    { group: 'workflows', name: 'Approval Notification', context: 'Email header band', mode: 'inherits', set: 'Default' },
    { group: 'workflows', name: 'Welcome Sequence', context: 'Button styling · step 2', mode: 'inherits', set: 'Default' },
  ],
  'r-font-mono': [
    { group: 'templates', name: 'Database Verification', context: 'Reference code display', mode: 'inherits', set: 'Default' },
    { group: 'themes', name: 'Light Theme', context: 'code blocks', mode: 'inherits', set: 'Default' },
  ],
};
