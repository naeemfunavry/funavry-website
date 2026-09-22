/**
 * The Funavry "F" mark — the three swooshes from the wordmark, isolated.
 *
 * The path data is copied verbatim from the web app's FMark component, which
 * took it from public/funavry-logo-new.svg. Do not hand-edit it: these are
 * traced curves, and nudging a control point produces a mark that is subtly
 * not the brand's.
 *
 * Painted with the brand gradient rather than currentColor, because in the
 * panel it always sits on paper and always represents the product itself.
 */
export function Logo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 335 478" role="img" aria-label="Funavry" className={className}>
      <defs>
        {/* The logo's own gradient: azure into steel into charcoal. */}
        <linearGradient id="funavry-mark-gradient" x1="0" y1="0" x2="335" y2="478"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#449ED8" />
          <stop offset="0.47" stopColor="#376079" />
          <stop offset="1" stopColor="#2E3436" />
        </linearGradient>
      </defs>

      <g fill="url(#funavry-mark-gradient)">
        <path d="M331.64.47S153.81-1,120.37,1.33c0,0-91,2.62-107.44,91.12L9.45,190.9s9.69-95.88,149.66-84C159.11,106.87,334.25,131.48,331.64.47Z" />
        <path d="M266,140.1s-146.79-1.23-174.39.72c0,0-75.15,2.15-88.7,75.21L0,297.3s8-79.15,123.54-69.37C123.54,227.93,268.12,248.25,266,140.1Z" />
        <path d="M111.07,257.79S124.56,467.79,0,477.69V338.29S2.25,261.84,111.07,257.79Z" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight text-ink ${className}`}>
      Funavry<span className="text-ink-400"> CMS</span>
    </span>
  );
}
