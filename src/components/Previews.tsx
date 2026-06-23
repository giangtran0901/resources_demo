import type { Resource } from '../data/resources';

export function ColorSwatch({ hex, size = 36 }: { hex: string; size?: number }) {
  return (
    <div className="swatch" style={{ width: size, height: size }}>
      <div className="swatch__fill" style={{ background: hex }} />
    </div>
  );
}

export function FontPreview({ family, weight, style }: { family: string; weight: number; style: string }) {
  return (
    <div className="font-preview" style={{ fontFamily: `'${family}', sans-serif`, fontWeight: weight, fontStyle: style }}>
      Ag
    </div>
  );
}

export function AssetThumb({ url }: { url: string }) {
  return (
    <div className="asset-thumb">
      <img src={url} alt="" />
    </div>
  );
}

export function ResourcePreview({ resource, size = 36 }: { resource: Resource; size?: number }) {
  if (resource.type === 'color' && resource.color) return <ColorSwatch hex={resource.color.hex} size={size} />;
  if (resource.type === 'font' && resource.font)
    return <FontPreview family={resource.font.family} weight={resource.font.weight} style={resource.font.style} />;
  if (resource.type === 'asset' && resource.asset) return <AssetThumb url={resource.asset.url} />;
  return null;
}
