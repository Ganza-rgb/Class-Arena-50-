// Campus Quest design tokens: sky & grass outside, warm earth panels inside,
// stone plaques, chunky orange buttons. Token names are shared by every screen.
export const C = {
  // surfaces (module & panel screens sit on warm earth)
  bg: '#3A2317',
  bg2: '#4A2C20',
  card: 'rgba(255,236,210,0.08)',
  card2: 'rgba(255,236,210,0.14)',
  glass: 'rgba(255,236,210,0.08)',
  glass2: 'rgba(255,236,210,0.14)',
  border: 'rgba(255,214,170,0.18)',
  borderStrong: 'rgba(255,190,120,0.45)',
  text: '#FFF3DF',
  textDim: '#F0D9B8',
  muted: '#C7A888',
  ink: '#2A1810',

  // outdoor world
  sky: '#BFE7F7',
  sky2: '#9FDCF0',
  grass: '#6DBB52',
  grass2: '#4F9A3C',
  water: '#46B9D6',
  stone: '#F3F1EA',
  stone2: '#D6D1C3',
  stoneText: '#7E8A7C',
  earth: '#4A2C20',
  wood: '#8A5530',

  // accents
  primary: '#F28A26',
  orange: '#F28A26',
  violet: '#8B6BFF',
  purple: '#8B6BFF',
  magenta: '#E255B5',
  cobalt: '#3E86F5',
  coral: '#F0504A',
  teal: '#1FB5A3',
  green: '#4CB944',
  amber: '#F6B80B',
  gold: '#F6B80B',
  pink: '#F06292',
  slate: '#6B4A36',
  live: '#EF3B36',

  win: '#4CB944',
  loss: '#F0504A',
} as const;

export const PALETTE: string[] = [C.orange, C.cobalt, C.green, C.violet, C.coral, C.teal];

export function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Two-stop "chunky" gradient: lighter top → base colour. */
export const grad = (color: string): [string, string] => [shade(color, 0.22), color];

/**
 * Chunky depth instead of neon glow: a solid darker "ledge" under the shape plus a soft
 * drop shadow. (Name kept from the previous theme so every screen picks it up.)
 */
export const glow = (color: string, _strength = 0.45, blur = 16): string =>
  `0px 5px 0px ${shade(color, -0.32)}, 0px 10px ${blur}px rgba(30,15,5,0.28)`;

/** Inset bottom edge used on chunky buttons and stone plaques. */
export const ledge = (color: string, h = 5): string => `inset 0px -${h}px 0px ${shade(color, -0.22)}`;

export const TILE_TONES: string[] = [C.orange, C.cobalt, C.green, C.violet, C.coral, C.teal, C.gold, C.pink];

export const F = {
  slab: 'RobotoSlab_900Black',
  slabBold: 'RobotoSlab_800ExtraBold',
  display: 'RobotoSlab_800ExtraBold',
  bold: 'Fredoka_700Bold',
  semi: 'Fredoka_600SemiBold',
  medium: 'Fredoka_500Medium',
  regular: 'Fredoka_400Regular',
  italic: 'Fredoka_500Medium',
} as const;

export const R = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
