import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "ink"
  /* The two below invert `ink` and `secondary` for the dark hero stage. */
  | "paper"
  | "outline";

type ButtonProps = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const sizeClasses = {
  sm: "min-h-[38px] px-4 py-2 text-[13px]",
  md: "min-h-[46px] px-6 py-3 text-[14px]",
  lg: "min-h-[54px] px-7 py-4 text-[15px]",
};

const variants: Record<Variant, string> = {
  ink: "bg-ink text-paper hover:bg-ink-900",
  // Dark ink on the bright azure (5.3:1), mirroring the amber `accent` variant.
  // White-on-azure measured 2.94:1 and failed WCAG AA; hover lightens the azure
  // so the dark text stays well clear of the threshold.
  primary: "bg-azure text-ink-900 hover:bg-azure-300",
  accent: "bg-amber text-ink-900 hover:bg-amber-600",
  secondary: "border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-paper-white",
  ghost: "bg-transparent text-ink-500 hover:text-ink",
  paper: "bg-paper text-ink hover:bg-paper-white",
  outline: "border border-paper/25 bg-transparent text-paper hover:border-paper/60 hover:bg-paper/[0.06]",
};

export default function Button({
  variant = "ink",
  size = "md",
  arrow = false,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    // Square, not pill — the whole system is drafted, not rounded.
    "group relative inline-flex items-center justify-center gap-2.5 rounded-sm font-medium tracking-[-0.01em]",
    "transition-colors duration-300 ease-standard outline-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    sizeClasses[size],
    variants[variant],
    className
  );

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          size={15}
          className="transition-transform duration-400 ease-expo group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
