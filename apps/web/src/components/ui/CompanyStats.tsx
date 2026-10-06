import CountUp from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";

const STATS: {
  value: number;
  suffix: string;
  unit?: string;
  label: string;
  desc: string;
  /** A year isn't a quantity — it's shown as-is rather than counted up. */
  count?: boolean;
}[] = [
  {
    value: 500,
    suffix: "+",
    label: "Projects Delivered",
    desc: "Successful projects delivered across industries worldwide.",
  },
  {
    value: 200,
    suffix: "+",
    label: "Engineers & Specialists",
    desc: "Experienced engineers and AI specialists.",
  },
  {
    value: 25,
    suffix: "K",
    unit: "sq ft",
    label: "Engineering Facility",
    desc: "State-of-the-art delivery & innovation center.",
  },
  {
    value: 2018,
    suffix: "",
    count: false,
    label: "Founded",
    desc: "Building and running enterprise platforms since 2018.",
  },
];

/**
 * The company's proof points, on a hairline: two-up on mobile, one row of four
 * from `lg`. Shared by the home hero and the About hero so the two read alike.
 */
export default function CompanyStats({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-8 border-t border-paper/15 pt-8 lg:grid-cols-4 lg:gap-x-8",
        className,
      )}
      style={style}
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col">
          <dt className="order-2 mt-3 font-mono text-sm uppercase tracking-[0.16em] text-paper/60 min-h-10">
            {stat.label}
          </dt>
          <dd className="order-1 flex items-baseline gap-1.5">
            <span className="text-[clamp(28px,3vw,40px)] font-semibold leading-none tracking-[-0.03em] text-paper">
              {stat.count === false ? (
                `${stat.value}${stat.suffix}`
              ) : (
                <CountUp value={stat.value} suffix={stat.suffix} />
              )}
            </span>
            {stat.unit && (
              <span className="text-base font-medium text-paper/50">
                {stat.unit}
              </span>
            )}
          </dd>
          <dd className="order-3 mt-2 text-sm leading-relaxed text-paper/45">
            {stat.desc}
          </dd>
        </div>
      ))}
    </dl>
  );
}
