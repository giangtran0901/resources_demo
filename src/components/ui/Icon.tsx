import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 16, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 3.5v9M3.5 8h9" />
  </Base>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6l4 4 4-4" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4l4 4-4 4" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 4L6 8l4 4" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="7.2" cy="7.2" r="3.7" />
    <path d="M10.2 10.2L13 13" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 8.5l3 3 6-7" />
  </Base>
);

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
    <path d="M5.5 7V5.2a2.5 2.5 0 015 0V7" />
  </Base>
);

export const CopyIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.5" />
    <path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" />
  </Base>
);

export const ColorIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 1.8a6.2 6.2 0 100 12.4c.9 0 1.4-.7 1.4-1.4 0-.4-.2-.7-.4-1-.2-.2-.4-.5-.4-.9 0-.7.6-1.3 1.3-1.3h1.1A2.8 2.8 0 0014 6.6C14 3.9 11.3 1.8 8 1.8z" />
    <circle cx="5" cy="6.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="8" cy="4.8" r=".6" fill="currentColor" stroke="none" />
    <circle cx="11" cy="6.5" r=".6" fill="currentColor" stroke="none" />
  </Base>
);

export const FontIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 13L6.6 3h1.2L11.4 13M4.3 9.6h5.8" />
  </Base>
);

export const AssetIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.3" y="3" width="11.4" height="10" rx="1.6" />
    <circle cx="5.6" cy="6.3" r="1.1" />
    <path d="M2.6 11l3.1-2.8 2.4 2.1 2.2-2 3.1 2.8" />
  </Base>
);

export const LayersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 2.2l5.5 2.8L8 7.8 2.5 5 8 2.2z" />
    <path d="M2.5 8l5.5 2.8L13.5 8M2.5 11l5.5 2.8L13.5 11" />
  </Base>
);

export const GridIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </Base>
);

export const ListIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.6 4h.01M2.6 8h.01M2.6 12h.01" />
  </Base>
);

export const LinkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 9.5l3-3M7 4.4l.8-.8a2.4 2.4 0 013.4 3.4l-.8.8M9 11.6l-.8.8a2.4 2.4 0 01-3.4-3.4l.8-.8" />
  </Base>
);

export const ArchiveIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="3" width="11" height="3" rx="1" />
    <path d="M3.5 6.2V12a1.3 1.3 0 001.3 1.3h6.4A1.3 1.3 0 0012.5 12V6.2M6.5 8.8h3" />
  </Base>
);

export const EditIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.8 2.9l2.3 2.3M3 13l.6-2.5 7-7 2.3 2.3-7 7L3 13z" />
  </Base>
);

export const WarningIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 2.5l5.6 9.7H2.4L8 2.5z" />
    <path d="M8 6.6v2.8M8 11.2h.01" />
  </Base>
);

export const InfoIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="5.8" />
    <path d="M8 7.3v3.4M8 5.4h.01" />
  </Base>
);

export const HistoryIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.8 8a5.2 5.2 0 105.2-5.2A5.2 5.2 0 003.6 5.2M2.6 2.8v2.6h2.6M8 5.5V8l1.8 1.1" />
  </Base>
);

export const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 10.5V3M5.2 5.6L8 2.8l2.8 2.8M3 11v1.4A1.6 1.6 0 004.6 14h6.8a1.6 1.6 0 001.6-1.6V11" />
  </Base>
);

export const SettingsIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.5v1.6M8 12.9v1.6M2.4 4.8l1.4.8M12.2 10.4l1.4.8M2.4 11.2l1.4-.8M12.2 5.6l1.4-.8" />
  </Base>
);

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.8 7L8 2.8 13.2 7v5.6a1 1 0 01-1 1H3.8a1 1 0 01-1-1V7z" />
  </Base>
);

export const FlowIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="2.5" width="4" height="4" rx="1" />
    <rect x="9.5" y="9.5" width="4" height="4" rx="1" />
    <path d="M6.5 4.5h3a1.5 1.5 0 011.5 1.5v3.5" />
  </Base>
);

export const TemplateIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.6" />
    <path d="M2.5 6h11M6 6v7.5" />
  </Base>
);

export const ThemeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 2.5v11" />
    <path d="M8 2.5a5.5 5.5 0 010 11" fill="currentColor" stroke="none" opacity="0.25" />
  </Base>
);

export const SunIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.3 3.3l1 1M11.7 11.7l1 1M3.3 12.7l1-1M11.7 4.3l1-1" />
  </Base>
);

export const MoonIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 9.3A5.5 5.5 0 116.7 3 4.3 4.3 0 0013 9.3z" />
  </Base>
);

export const DotsIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="3.5" cy="8" r=".8" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r=".8" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="8" r=".8" fill="currentColor" stroke="none" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8h9.5M9 4.5L12.5 8 9 11.5" />
  </Base>
);

export const BracesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.2 2.8c-1.4 0-1.6.8-1.6 2.2 0 1.2-.2 2-1.2 2 1 0 1.2.8 1.2 2 0 1.4.2 2.2 1.6 2.2M9.8 2.8c1.4 0 1.6.8 1.6 2.2 0 1.2.2 2 1.2 2-1 0-1.2.8-1.2 2 0 1.4-.2 2.2-1.6 2.2" />
  </Base>
);

export const TokensIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 2.2l2.4 2.4L8 7 5.6 4.6 8 2.2z" />
    <rect x="9.4" y="9" width="4.4" height="4.4" rx="1" />
    <circle cx="5" cy="11.2" r="2.4" />
  </Base>
);
