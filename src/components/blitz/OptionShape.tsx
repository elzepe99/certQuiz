/**
 * The five option identities: a colour and a shape per letter.
 *
 * The shape is not decoration. Roughly one man in twelve cannot separate the
 * red tile from the green one, and this mode asks for an answer in under a
 * second — so colour alone would make the game unplayable for them. Letter,
 * colour and shape all say the same thing, three ways.
 *
 * Colours are chosen against `--bg-canvas` (#0b0f14) rather than taken from the
 * theme tokens: the palette in `styles/index.css` is deliberately quiet, and a
 * quiet game board reads as a form.
 */

export type OptionStyle = {
  color: string;
  /** Tile fill at rest — the colour at low alpha over the dark canvas. */
  soft: string;
  shape: 'triangle' | 'diamond' | 'circle' | 'square' | 'star';
};

export const OPTION_STYLES: OptionStyle[] = [
  { color: '#ef5a6f', soft: 'rgba(239, 90, 111, 0.13)', shape: 'triangle' },
  { color: '#4f9dfd', soft: 'rgba(79, 157, 253, 0.13)', shape: 'diamond' },
  { color: '#f0a52b', soft: 'rgba(240, 165, 43, 0.13)', shape: 'circle' },
  { color: '#3ec98a', soft: 'rgba(62, 201, 138, 0.13)', shape: 'square' },
  { color: '#a879f0', soft: 'rgba(168, 121, 240, 0.13)', shape: 'star' },
];

export function optionStyle(index: number): OptionStyle {
  return OPTION_STYLES[index % OPTION_STYLES.length];
}

export function OptionShape({ shape, size = 16 }: { shape: OptionStyle['shape']; size?: number }) {
  const common = { fill: 'currentColor' };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {shape === 'triangle' ? <polygon points="12,3 22,20 2,20" {...common} /> : null}
      {shape === 'diamond' ? <polygon points="12,2 22,12 12,22 2,12" {...common} /> : null}
      {shape === 'circle' ? <circle cx="12" cy="12" r="9.5" {...common} /> : null}
      {shape === 'square' ? <rect x="3" y="3" width="18" height="18" rx="2.5" {...common} /> : null}
      {shape === 'star' ? (
        <polygon
          points="12,2 14.9,9.1 22.5,9.6 16.7,14.5 18.5,21.9 12,17.8 5.5,21.9 7.3,14.5 1.5,9.6 9.1,9.1"
          {...common}
        />
      ) : null}
    </svg>
  );
}
