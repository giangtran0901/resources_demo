export function normalizeHex(input: string): string | null {
  let h = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) return '#' + h.toUpperCase();
  if (/^[0-9a-fA-F]{8}$/.test(h)) return '#' + h.toUpperCase();
  return null;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '').slice(0, 6);
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(hex: string, other: string): number {
  const a = luminance(hex);
  const b = luminance(other);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastGrade(ratio: number): { label: string; pass: boolean } {
  if (ratio >= 7) return { label: 'AAA', pass: true };
  if (ratio >= 4.5) return { label: 'AA', pass: true };
  if (ratio >= 3) return { label: 'AA Large', pass: true };
  return { label: 'Fail', pass: false };
}

export function bestTextOn(hex: string): '#FFFFFF' | '#313131' {
  return contrastRatio(hex, '#FFFFFF') >= contrastRatio(hex, '#313131') ? '#FFFFFF' : '#313131';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
