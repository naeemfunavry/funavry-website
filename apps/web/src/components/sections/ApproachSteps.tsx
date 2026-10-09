import { ArrowRight, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";
import styles from "./ApproachSteps.module.css";

// Display just the illustration regions of the supplied reference artwork.
// The original image stays intact; all card text remains accessible HTML.
const illustrations = [
  { x: 80, y: 508, width: 210, height: 178 },
  { x: 640, y: 538, width: 180, height: 148 },
  { x: 900, y: 532, width: 200, height: 154 },
  { x: 1440, y: 528, width: 195, height: 158 },
  { x: 1700, y: 518, width: 210, height: 168 },
];

export type ApproachStep = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

/**
 * A practice page's process: numbered, connected cards with blue illustrations.
 * Cards wrap on smaller screens; the head pairs the title with a short statement.
 */
export default function ApproachSteps({
  id,
  label = "Our approach",
  title,
  subtitle,
  body,
  steps,
}: {
  id: string;
  label?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  body?: React.ReactNode;
  steps: ApproachStep[];
}) {
  if (steps.length === 0) return null;

  return (
    <section aria-labelledby={id} className={styles.section}>
      <Container wide className="relative z-10 py-12 sm:py-16 lg:py-20">
        {/* ---- Head ---- */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                {label}
              </span>
            </div>
            <h2 id={id} className="mt-5 text-h3 text-[#0b153b] xl:text-[40px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-[16px] leading-[1.6] text-[#68758f] lg:text-[18px]">
                {subtitle}
              </p>
            )}
          </div>
          {body && (
            <p className="max-w-[42ch] text-[15px] leading-[1.6] text-[#68758f] lg:w-[30%] lg:flex-none">
              {body}
            </p>
          )}
        </div>

        {/* ---- Steps ---- */}
        <ol className={styles.steps}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            const last = i === steps.length - 1;
            const illustration = illustrations[i];
            return (
              <li key={step.title} className={styles.step}>
                {!last && <span aria-hidden className={styles.connector} />}
                <Wipe delay={i * 0.05} className="h-full">
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <span className={styles.number}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {!last && (
                        <span aria-hidden className={styles.arrow}>
                          <ArrowRight size={16} strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                    <h3 className={styles.cardTitle}>{step.title}</h3>
                    <p className={styles.description}>{step.desc}</p>
                    <div aria-hidden className={styles.artwork}>
                      {illustration ? (
                        <div
                          className={styles.illustration}
                          style={{
                            aspectRatio: `${illustration.width} / ${illustration.height}`,
                            backgroundSize: `${(1983 / illustration.width) * 100}% ${(793 / illustration.height) * 100}%`,
                            backgroundPosition: `${(illustration.x / (1983 - illustration.width)) * 100}% ${(illustration.y / (793 - illustration.height)) * 100}%`,
                          }}
                        />
                      ) : (
                        <Icon
                          size={80}
                          strokeWidth={1}
                          className="text-azure"
                        />
                      )}
                    </div>
                  </div>
                </Wipe>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
