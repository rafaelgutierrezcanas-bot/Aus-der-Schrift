interface TheologikLogoProps {
  className?: string;
}

/**
 * Theologik wordmark SVG.
 * – T is shaped as a cross (vertical extends above the cap line)
 * – 4th O contains a compass needle + N/S dots
 * Uses currentColor so it adapts to dark/light mode automatically.
 */
export function TheologikLogo({ className }: TheologikLogoProps) {
  return (
    <svg
      viewBox="0 0 460 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-label="Theologik"
      className={className}
    >
      {/* ── T (cross) ── */}
      {/* crossbar at cap-top */}
      <rect x="10" y="20" width="42" height="10" />
      {/* vertical: extends 20 px above cap-line as a cross */}
      <rect x="26" y="0" width="10" height="80" />

      {/* ── H ── */}
      <rect x="60" y="20" width="10" height="60" />
      <rect x="92" y="20" width="10" height="60" />
      <rect x="60" y="46" width="42" height="9" />

      {/* ── E ── */}
      <rect x="110" y="20" width="10" height="60" />
      <rect x="110" y="20" width="34" height="10" />
      <rect x="110" y="46" width="26" height="9" />
      <rect x="110" y="70" width="34" height="10" />

      {/* ── O with compass (cx=182, cy=50, outer r=30, inner r=20) ── */}
      <path
        fillRule="evenodd"
        d="M212,50A30,30,0,1,0,152,50A30,30,0,1,0,212,50ZM202,50A20,20,0,1,0,162,50A20,20,0,1,0,202,50Z"
      />
      {/* compass needle (vertical diamond inside the O) */}
      <path d="M182,31 L186,50 L182,69 L178,50 Z" />
      {/* N and S dots just outside the circle */}
      <circle cx="182" cy="14" r="3" />
      <circle cx="182" cy="86" r="3" />

      {/* ── L ── */}
      <rect x="220" y="20" width="10" height="60" />
      <rect x="220" y="70" width="34" height="10" />

      {/* ── O regular (cx=292, cy=50) ── */}
      <path
        fillRule="evenodd"
        d="M322,50A30,30,0,1,0,262,50A30,30,0,1,0,322,50ZM312,50A20,20,0,1,0,272,50A20,20,0,1,0,312,50Z"
      />

      {/* ── G ── */}
      <rect x="330" y="20" width="10" height="60" />   {/* left vert */}
      <rect x="330" y="20" width="52" height="10" />   {/* top */}
      <rect x="330" y="70" width="52" height="10" />   {/* bottom */}
      <rect x="361" y="46" width="21" height="9" />    {/* mid stub */}
      <rect x="372" y="46" width="10" height="34" />   {/* right vert lower half */}

      {/* ── I ── */}
      <rect x="390" y="20" width="10" height="60" />

      {/* ── K ── */}
      <rect x="408" y="20" width="10" height="60" />   {/* vert */}
      {/* upper diagonal arm */}
      <polygon points="421,54 415,46 447,16 453,24" />
      {/* lower diagonal arm */}
      <polygon points="421,46 453,76 447,84 415,54" />
    </svg>
  );
}
