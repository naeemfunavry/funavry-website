// The Funavry "F" mark on its own — the three swooshes from public/funavry-logo-new.svg,
// isolated from the wordmark. Paints in currentColor so containers set the tone
// (white on the dark core, ink on paper). Do not hand-edit the path data.
import { cn } from "@/lib/utils";

export default function FMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 335 478"
      role="img"
      aria-label="Funavry"
      fill="currentColor"
      className={cn("h-6 w-auto", className)}
    >
      <path d="M331.64.47S153.81-1,120.37,1.33c0,0-91,2.62-107.44,91.12L9.45,190.9s9.69-95.88,149.66-84C159.11,106.87,334.25,131.48,331.64.47Z" />
      <path d="M266,140.1s-146.79-1.23-174.39.72c0,0-75.15,2.15-88.7,75.21L0,297.3s8-79.15,123.54-69.37C123.54,227.93,268.12,248.25,266,140.1Z" />
      <path d="M111.07,257.79S124.56,467.79,0,477.69V338.29S2.25,261.84,111.07,257.79Z" />
    </svg>
  );
}
