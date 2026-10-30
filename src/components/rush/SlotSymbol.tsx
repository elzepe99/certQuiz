import type { Symbol } from '@/lib/rush';

/**
 * The reel artwork, drawn rather than taken from the emoji font. Emoji render
 * differently on every platform — Windows draws the keycap 7 as a grey tile
 * that reads as a calendar — and none of them looks like a real slot machine.
 *
 * Literal colours on purpose: these are printed reel strips, which stay red,
 * gold and black whatever the app's palette does. No gradient ids either, so
 * dozens of these on one page can never collide.
 *
 * `tincho` is the easter egg — a casino chip for the colleague whose idea
 * Jackpot Rush was. Three of them pays double (see lib/rush.ts).
 */
export function SlotSymbol({ id, size = 40 }: { id: Symbol; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label={id} role="img">
      {id === 'tincho' ? <title>Tincho</title> : null}
      {ART[id]}
    </svg>
  );
}

const ART: Record<Symbol, JSX.Element> = {
  cherry: (
    <g>
      <path d="M25 7 C22 16 17 22 15 28" stroke="#2f7d32" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M25 7 C28 16 32 22 33 29" stroke="#2f7d32" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M25 8 C30 3 38 4 41 9 C35 12 29 11 25 8 Z" fill="#43a047" />
      <circle cx="15" cy="33" r="9.5" fill="#c62828" stroke="#7f1010" strokeWidth="1.5" />
      <circle cx="33" cy="34" r="9.5" fill="#d32f2f" stroke="#7f1010" strokeWidth="1.5" />
      <ellipse cx="11.5" cy="29.5" rx="2.6" ry="1.8" fill="#ffffff" opacity="0.75" />
      <ellipse cx="29.5" cy="30.5" rx="2.6" ry="1.8" fill="#ffffff" opacity="0.75" />
    </g>
  ),
  lemon: (
    <g>
      <path
        d="M5 25 C5 14 15 9 24 9 C33 9 43 14 43 25 C43 35 33 40 24 40 C15 40 5 35 5 25 Z"
        fill="#fdd835"
        stroke="#c49000"
        strokeWidth="1.5"
      />
      <ellipse cx="4.5" cy="25" rx="2.5" ry="2" fill="#f9c80e" stroke="#c49000" strokeWidth="1" />
      <ellipse cx="43.5" cy="25" rx="2.5" ry="2" fill="#f9c80e" stroke="#c49000" strokeWidth="1" />
      <path d="M13 18 C17 14 22 13 27 13" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.7" />
    </g>
  ),
  bell: (
    <g>
      <circle cx="24" cy="7" r="3" fill="#e0a100" stroke="#8a5a00" strokeWidth="1.2" />
      <path
        d="M24 9 C14 9 11 17 11 24 L11 31 L6 37 L42 37 L37 31 L37 24 C37 17 34 9 24 9 Z"
        fill="#ffc107"
        stroke="#8a5a00"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="41" r="4" fill="#e0a100" stroke="#8a5a00" strokeWidth="1.2" />
      <path d="M17 16 C15 20 15 25 15 30" stroke="#fff3c4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  bar: (
    <g>
      <rect x="3" y="13" width="42" height="22" rx="3" fill="#141414" stroke="#d4a017" strokeWidth="2" />
      <text
        x="24"
        y="29.5"
        textAnchor="middle"
        fontFamily="Impact, 'Arial Black', sans-serif"
        fontSize="15"
        fontWeight="900"
        letterSpacing="1"
        fill="#ffffff"
      >
        BAR
      </text>
    </g>
  ),
  diamond: (
    <g strokeLinejoin="round">
      <path d="M12 12 L36 12 L44 21 L24 43 L4 21 Z" fill="#29b6f6" stroke="#0d4f8b" strokeWidth="1.6" />
      <path d="M4 21 L44 21" stroke="#0d4f8b" strokeWidth="1.2" />
      <path d="M12 12 L18 21 L24 12 L30 21 L36 12" stroke="#0d4f8b" strokeWidth="1.2" fill="none" />
      <path d="M18 21 L24 43 L30 21" stroke="#0d4f8b" strokeWidth="1.2" fill="none" />
      <path d="M12 12 L18 21 L4 21 Z" fill="#b3e5fc" opacity="0.8" />
    </g>
  ),
  tincho: (
    <g>
      <circle cx="24" cy="24" r="21" fill="#0b7a3b" stroke="#064522" strokeWidth="1.6" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="21.5"
          y="3.6"
          width="5"
          height="7"
          rx="1"
          fill="#f5f0e1"
          transform={`rotate(${i * 45} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="13.5" fill="#f5f0e1" stroke="#d4a017" strokeWidth="2" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="17"
        fontWeight="900"
        fill="#0b7a3b"
      >
        T
      </text>
      <text
        x="24"
        y="34.6"
        textAnchor="middle"
        fontFamily="Impact, 'Arial Black', sans-serif"
        fontSize="4.6"
        letterSpacing="0.4"
        fill="#064522"
      >
        TINCHO
      </text>
    </g>
  ),
  seven: (
    <g>
      <text
        x="24"
        y="41"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="44"
        fontWeight="900"
        fontStyle="italic"
        fill="#e53935"
        stroke="#6d0f0f"
        strokeWidth="1.6"
        paintOrder="stroke"
      >
        7
      </text>
    </g>
  ),
};
