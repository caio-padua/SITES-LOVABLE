/** Emblema minimalista PAX MED — anel duplo dourado com monograma "PM". */
export function PaxMedMonogram({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Emblema PAX MED" className={"shrink-0 " + className}>
      <defs>
        <linearGradient id="pmGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4E4B8" />
          <stop offset="50%" stopColor="#C9A96E" />
          <stop offset="100%" stopColor="#7A5E2A" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#pmGold)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#pmGold)" strokeWidth="0.6" opacity="0.6" />
      <path d="M32 9v4M32 51v4" stroke="url(#pmGold)" strokeWidth="1.2" />
      <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fill="url(#pmGold)"
        fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" fontSize="24" letterSpacing="1">PM</text>
    </svg>
  );
}
