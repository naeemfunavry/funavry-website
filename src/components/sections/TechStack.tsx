"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Cloud,
  Sparkles,
  Layers,
  Link2,
  Boxes,
  Server,
  FileCode,
  GitBranch,
  Activity,
  Database,
  BrainCircuit,
  Bot,
  Search,
  Workflow,
  Cpu,
  SlidersHorizontal,
  Building2,
  LayoutGrid,
  Smartphone,
  Network,
  Glasses,
  Shapes,
  Camera,
  ShieldCheck,
  Code2,
  Lock,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import TechIcon from "@/components/ui/TechIcon";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { cn } from "@/lib/utils";

/**
 * The stack, exactly as the company profile states it — five domains, the
 * groups inside each in the profile's own order, tabbed and set out as a spec
 * sheet: a labelled rail on the left, the tools beside it.
 *
 * `mono` is the fallback tile for a vendor with no brand mark (Simple Icons
 * drops marks on trademark request, or never carried the smaller ones).
 */
type Item = { name: string; mono?: string };
type Group = { title: string; desc: string; icon: LucideIcon; items: Item[] };
type Domain = { key: string; label: string; icon: LucideIcon; groups: Group[] };

const DOMAINS: Domain[] = [
  {
    key: "cloud",
    label: "Cloud & Infrastructure",
    icon: Cloud,
    groups: [
      {
        title: "Cloud Platforms",
        desc: "Scalable, secure cloud.",
        icon: Server,
        items: [
          { name: "AWS" },
          { name: "Azure", mono: "AZ" },
          { name: "GCP" },
        ],
      },
      {
        title: "Containerization & Orchestration",
        desc: "Packaged and self-healing.",
        icon: Boxes,
        items: [
          { name: "Docker" },
          { name: "Kubernetes" },
          { name: "Azure AKS", mono: "AKS" },
          { name: "Google GKE" },
          { name: "Amazon EKS", mono: "EKS" },
        ],
      },
      {
        title: "Infrastructure as Code",
        desc: "Environments as code.",
        icon: FileCode,
        items: [{ name: "Terraform" }, { name: "Ansible" }],
      },
      {
        title: "CI/CD & DevOps",
        desc: "Continuous, safe delivery.",
        icon: GitBranch,
        items: [
          { name: "GitHub Actions" },
          { name: "GitLab CI/CD" },
          { name: "Jenkins" },
          { name: "Azure DevOps", mono: "AZ" },
        ],
      },
      {
        title: "Monitoring & Observability",
        desc: "Full production visibility.",
        icon: Activity,
        items: [
          { name: "Prometheus" },
          { name: "Grafana" },
          { name: "ELK Stack" },
          { name: "OpenTelemetry" },
        ],
      },
      {
        title: "Databases & Storage",
        desc: "Records, cache, and files.",
        icon: Database,
        items: [
          { name: "PostgreSQL" },
          { name: "MySQL" },
          { name: "MongoDB" },
          { name: "Redis" },
          { name: "IPFS" },
          { name: "Amazon S3", mono: "S3" },
        ],
      },
    ],
  },
  {
    key: "ai",
    label: "AI & Agentic",
    icon: Sparkles,
    groups: [
      {
        title: "Foundation Models",
        desc: "The reasoning core.",
        icon: BrainCircuit,
        items: [
          { name: "OpenAI", mono: "OAI" },
          { name: "Anthropic Claude" },
          { name: "Google Gemini" },
          { name: "Meta Llama" },
          { name: "Mistral" },
        ],
      },
      {
        title: "Agentic AI Frameworks",
        desc: "Agents that act.",
        icon: Bot,
        items: [
          { name: "LangChain" },
          { name: "LangGraph" },
          { name: "CrewAI" },
          { name: "LlamaIndex", mono: "LI" },
        ],
      },
      {
        title: "Knowledge, Search & RAG",
        desc: "Grounded, retrievable answers.",
        icon: Search,
        items: [
          { name: "Pinecone", mono: "PC" },
          { name: "Chroma", mono: "CH" },
          { name: "Azure AI Search", mono: "AZ" },
          { name: "Elasticsearch" },
          { name: "MongoDB Atlas Vector Search" },
        ],
      },
      {
        title: "Automation & Workflow",
        desc: "Orchestration across systems.",
        icon: Workflow,
        items: [{ name: "Zapier" }, { name: "n8n" }],
      },
      {
        title: "Model Training",
        desc: "Models built from data.",
        icon: Cpu,
        items: [{ name: "PyTorch" }, { name: "TensorFlow" }, { name: "Keras" }],
      },
      {
        title: "Fine-Tuning & Optimization",
        desc: "Tuned for the task.",
        icon: SlidersHorizontal,
        items: [
          { name: "Hugging Face" },
          { name: "PEFT", mono: "PE" },
          { name: "LoRA", mono: "LoRA" },
          { name: "QLoRA", mono: "QLoR" },
        ],
      },
      {
        title: "Enterprise AI Platforms",
        desc: "Managed ML at scale.",
        icon: Building2,
        items: [
          { name: "Amazon SageMaker", mono: "SM" },
          { name: "Vertex AI" },
        ],
      },
      {
        title: "MLOps & LLMOps",
        desc: "Delivery for models.",
        icon: GitBranch,
        items: [
          { name: "MLflow" },
          { name: "Kubeflow", mono: "KF" },
          { name: "LangSmith", mono: "LS" },
        ],
      },
    ],
  },
  {
    key: "fullstack",
    label: "Full Stack",
    icon: Layers,
    groups: [
      {
        title: "Backend",
        desc: "APIs and services.",
        icon: Server,
        items: [
          { name: "Python" },
          { name: "JavaScript" },
          { name: "TypeScript" },
          { name: "Go" },
          { name: "Node.js" },
          { name: "NestJS" },
          { name: "Express.js" },
          { name: "FastAPI" },
          { name: "Flask" },
        ],
      },
      {
        title: "Frontend",
        desc: "Interfaces people use.",
        icon: LayoutGrid,
        items: [
          { name: "React" },
          { name: "Next.js" },
          { name: "Angular" },
          { name: "Vue.js" },
          { name: "Material UI" },
          { name: "Tailwind CSS" },
          { name: "Bootstrap" },
          { name: "Redux" },
        ],
      },
      {
        title: "Mobile",
        desc: "Native and cross-platform.",
        icon: Smartphone,
        items: [
          { name: "Flutter" },
          { name: "React Native" },
          { name: "Swift" },
          { name: "Kotlin" },
        ],
      },
    ],
  },
  {
    key: "blockchain",
    label: "Blockchain",
    icon: Link2,
    groups: [
      {
        title: "Networks & Layer-2s",
        desc: "Chains and scaling layers.",
        icon: Link2,
        items: [
          { name: "Ethereum" },
          { name: "Polygon" },
          { name: "Solana" },
          { name: "BNB Chain" },
          { name: "Avalanche", mono: "AVAX" },
          { name: "Arbitrum", mono: "ARB" },
          { name: "Optimism" },
          { name: "Base", mono: "BASE" },
        ],
      },
      {
        title: "Smart Contracts",
        desc: "On-chain logic.",
        icon: FileCode,
        items: [{ name: "Solidity" }, { name: "Rust" }],
      },
      {
        title: "Node & Infrastructure",
        desc: "RPC and node access.",
        icon: Server,
        items: [
          { name: "Alchemy" },
          { name: "Infura", mono: "INF" },
          { name: "QuickNode", mono: "QN" },
        ],
      },
      {
        title: "Cross-Chain & Interoperability",
        desc: "Value across chains.",
        icon: Network,
        items: [
          { name: "LayerZero", mono: "LZ" },
          { name: "Chainlink" },
          { name: "Wormhole", mono: "WH" },
          { name: "deBridge", mono: "dB" },
        ],
      },
    ],
  },
  {
    key: "immersive",
    label: "Immersive (AR / VR / XR)",
    icon: Boxes,
    groups: [
      {
        title: "XR Platforms",
        desc: "Engines for immersive worlds.",
        icon: Boxes,
        items: [
          { name: "Unity" },
          { name: "Unreal Engine" },
          { name: "OpenXR" },
        ],
      },
      {
        title: "AR Development",
        desc: "Overlays on the real world.",
        icon: Camera,
        items: [
          { name: "ARKit" },
          { name: "ARCore" },
          { name: "Vuforia", mono: "VF" },
        ],
      },
      {
        title: "VR Platforms",
        desc: "Fully virtual experiences.",
        icon: Glasses,
        items: [
          { name: "Meta Quest" },
          { name: "Oculus SDK" },
          { name: "SteamVR" },
        ],
      },
      {
        title: "3D Content Creation",
        desc: "Assets and environments.",
        icon: Shapes,
        items: [
          { name: "Blender" },
          { name: "Autodesk Maya" },
          { name: "Autodesk 3ds Max" },
        ],
      },
    ],
  },
];

const BADGES: { icon: LucideIcon; title: string; blurb: string }[] = [
  {
    icon: ShieldCheck,
    title: "Enterprise Ready",
    blurb: "Built for scale, security & reliability.",
  },
  {
    icon: Sparkles,
    title: "AI-Native Approach",
    blurb: "Intelligence embedded in everything.",
  },
  {
    icon: Code2,
    title: "Future Proof",
    blurb: "A modern stack for long-term impact.",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    blurb: "Security & compliance at every layer.",
  },
];

const EXPO = [0.19, 1, 0.22, 1] as const;

/* Tab order, AI-first: the domains are listed in this sequence regardless of
   how they're defined above. */
const ORDER = ["ai", "immersive", "blockchain", "fullstack", "cloud"] as const;
const ORDERED: Domain[] = ORDER.map((k) => DOMAINS.find((d) => d.key === k)!);

/** The sidebar's stacked-disks motif — a quiet nod to a layered core. */
function CoreStack() {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      aria-hidden
      className="mx-auto w-full max-w-[220px]"
    >
      <defs>
        <linearGradient id="disk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFF7FC" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={i}
          cx="120"
          cy={150 - i * 27}
          rx="88"
          ry="27"
          fill="url(#disk)"
          stroke="#DDEEF9"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** One group as a row: labelled rail on the left, tools set out beside it. */
function GroupRow({ group, index }: { group: Group; index: number }) {
  const Icon = group.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 + index * 0.04, duration: 0.4, ease: EXPO }}
      className="grid gap-5 px-5 py-5 shadow-sm bg-white rounded-lg mt-3 transition-colors duration-300 hover:bg-paper lg:grid-cols-[minmax(0,232px)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:px-6"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-azure/[0.08] text-azure-ink">
          <Icon size={17} strokeWidth={1.7} />
        </span>
        <div>
          <h3 className="text-[14.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
            {group.title}
          </h3>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-400">
            {group.desc}
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 border-l border-line pl-0 sm:grid-cols-3 lg:grid-cols-5 lg:pl-8">
        {group.items.map((item) => (
          <li
            key={item.name}
            className="group/t flex min-w-0 items-center gap-2.5"
          >
            <TechIcon
              name={item.name}
              mono={item.mono}
              className="h-8 w-8 flex-none object-contain transition-transform duration-300 ease-expo group-hover/t:scale-110"
              monoClassName="flex h-6 min-w-[34px] flex-none items-center justify-center rounded-md bg-ink/[0.06] px-1.5 font-mono text-xs font-semibold uppercase leading-none tracking-tight text-ink/55"
            />
            <span className="truncate text-[12.5px] leading-tight text-ink-600">
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function TechStack() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const domain = ORDERED[active];

  return (
    <section
      id="technology"
      className="relative overflow-hidden border-t border-line bg-paper"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[8%] top-[4%] h-[44%] w-[44vw] rounded-full bg-azure/[0.06] blur-[130px]" />
        <div className="absolute -right-[10%] bottom-[6%] h-[44%] w-[40vw] rounded-full bg-amber/[0.05] blur-[130px]" />
      </div>
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.04]" />

      <Container wide className="relative z-10 py-24 lg:py-32">
        {/* Heading — the section's own, kept as it was. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Technology
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="The Architecture " />
              <br />
              <KineticWords text="Behind Enterprise AI." delay={0.12} />
            </h2>
          </div>

          <Wipe delay={0.2}>
            <p className="text-[16px] leading-[1.75] text-ink-500">
              We bring together world-class AI models, enterprise-grade
              infrastructure, cloud platforms, data systems, automation
              frameworks, and modern engineering practices to build intelligent
              solutions that are secure, scalable, and ready for enterprise
              transformation.
            </p>
          </Wipe>
        </div>

        {/* The panel. */}
        <div className="mt-14">
          <div className="grid gap-3 lg:gap-4">
            {/* Left — the standing statement + motif. */}
            {/* <aside className="flex flex-col rounded-2xl border border-line bg-gradient-to-b from-azure/[0.05] to-paper-white p-6 lg:p-8">
              <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-ink lg:text-[21px]">
                AI-First by Design
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500">
                Our stack is carefully curated to power intelligent systems,
                accelerate development, and deliver real business impact.
              </p>
              <div className="mt-auto pt-10">
                <CoreStack />
              </div>
            </aside> */}

            {/* Right — tabs, then the active domain's groups. */}
            <div className="flex flex-col gap-3 lg:gap-4">
              <div
                role="tablist"
                aria-label="Technology domains"
                className="flex flex-wrap gap-2"
              >
                {ORDERED.map((d, i) => {
                  const Icon = d.icon;
                  const isActive = active === i;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-[12.5px] font-medium transition-colors duration-300",
                        isActive
                          ? "bg-ink text-paper"
                          : "border border-line bg-paper-white text-ink-500 hover:border-line-strong hover:text-ink",
                      )}
                    >
                      <Icon
                        size={14}
                        strokeWidth={1.7}
                        className={cn(isActive ? "text-amber" : "text-ink-400")}
                      />
                      {d.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={domain.key}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.38, ease: EXPO }}
                  className=" overflow-hidden"
                >
                  {domain.groups.map((group, gi) => (
                    <GroupRow key={group.title} group={group} index={gi} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
