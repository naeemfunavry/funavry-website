import { cn } from "@/lib/utils";

/**
 * The row of calls to action under a hero's copy.
 *
 * Stacked and full-width on phones, so each button is a whole thumb target
 * and the pair reads as one block — left to wrap, two buttons of different
 * widths broke onto two ragged lines. The inline row returns at `sm`. The
 * home hero set this pattern; every other hero shares it through here.
 */
export default function HeroActions({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        "[&>*]:w-full sm:[&>*]:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
