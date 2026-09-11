import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** Industry · product type · capability, as one quiet line. */
export default function FactLine({
  facts,
  className,
}: {
  facts: string[];
  className?: string;
}) {
  if (facts.length === 0) return null;

  return (
    <p className={cn("text-[13px] leading-[1.7] text-ink-500", className)}>
      {facts.map((fact, i) => (
        <Fragment key={fact}>
          {i > 0 && (
            <>
              <span aria-hidden className="mx-2 text-ink-400">
                ·
              </span>
              <span className="sr-only">, </span>
            </>
          )}
          {fact}
        </Fragment>
      ))}
    </p>
  );
}
