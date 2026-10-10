import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Cpu,
  Workflow,
  FileText,
  Settings2,
  Gauge,
  Lightbulb,
  FileSearch,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Search,
  Layers,
  Code2,
  UploadCloud,
  Database,
  LineChart,
  BarChart3,
  ClipboardCheck,
  FlaskConical,
  RefreshCw,
  Rocket,
  Satellite,
  Map,
  type LucideIcon,
} from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Wipe } from "@/components/ui/Kinetic";
import { HOUSE_LABEL, SERVICE_IMAGES } from "@/lib/service-style";
import DetailHero from "@/components/ui/DetailHero";
import { type SequenceStep } from "@/components/sections/ResultsSequence";
import ApproachSteps, {
  type ApproachStep,
} from "@/components/sections/ApproachSteps";
import CapabilitiesDepth, {
  type DepthGroup,
  type DepthItem,
} from "@/components/sections/CapabilitiesDepth";
import WorkTiles from "@/components/work/WorkTiles";
import Governance from "@/components/sections/Governance";
import ServiceIndustries from "@/components/sections/ServiceIndustries";
import { industriesForService, projectsFor } from "@/lib/relations";
import { byVisuals, buildWorkProjects } from "@/lib/work";
import {
  getService,
  getServices,
  getWorkIndex,
  getIndustries,
} from "@/lib/api";
import type { Service } from "@/lib/services";

type Params = { slug: string };

/* For a practice added in the CMS before it has a photograph of its own. */
const FALLBACK_PHOTO = "/services/digital-engineering.webp";

/**
 * Per-practice page copy that the CMS does not model.
 *
 * The [slug] template is otherwise driven entirely by the service's CMS entry
 * and its case-study relations. A practice listed here replaces that generic,
 * data-derived copy with written-out marketing prose for its own page — the
 * hero loses its generic actions, and the expertise statement is prose rather
 * than a case-study tally.
 */
type ServiceOverride = {
  /** Hide the hero's "Discuss your project / All services" actions. */
  hideHeroActions?: boolean;
  /** Replaces the hero paragraph (default: the service summary). */
  heroBody?: React.ReactNode;
  /** Replaces the left eyebrow (default "Expertise"). */
  expertiseLabel?: string;
  /** Replaces the left heading (default "<service> Expertise"). */
  expertiseTitle?: React.ReactNode;
  /** Replaces the left expertise statement. */
  expertiseBody?: React.ReactNode;
  /** Give the expertise section a white (paper) ground instead of paper-deep. */
  expertiseWhiteBg?: boolean;
  /** Intro paragraph shown above the "What we do" list. */
  whatWeDoBody?: React.ReactNode;
  /** Replaces each sub-service's description, keyed by sub title. */
  subDescs?: Record<string, string>;
  /** An icon per sub-service, keyed by sub title; replaces the row number. */
  subIcons?: Record<string, LucideIcon>;
  /** A "Capabilities in depth" explorer (detail panel + selectable rail),
      shown before the approach block. */
  capabilities?: {
    label?: string;
    title?: React.ReactNode;
    body?: React.ReactNode;
    groups: DepthGroup[];
  };
  /** A process section ("Our Approach"), shown after the expertise block. */
  approach?: {
    label?: string;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    body?: React.ReactNode;
    steps: ApproachStep[];
  };
  /** A sequential-outcomes section, shown before Selected Work. */
  sequence?: {
    label?: string;
    title?: React.ReactNode;
    body?: React.ReactNode;
    steps: SequenceStep[];
  };
  /** Overrides the Selected Work section's head and portfolio link. */
  work?: {
    label?: string;
    title?: React.ReactNode;
    body?: string;
    more?: { label: string; href: string };
  };
  /** Overrides the Industries We Serve section's head text (cards unchanged). */
  industries?: {
    label?: string;
    title?: React.ReactNode;
    body?: React.ReactNode;
    /** Drop the proof point (project tag) from each card. */
    hideProof?: boolean;
  };
};

const SERVICE_OVERRIDES: Record<string, ServiceOverride> = {
  "digital-engineering": {
    hideHeroActions: true,
    expertiseWhiteBg: true,
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Building digital products{" "}
        <span className="">that move businesses forward.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry transforms business ideas into reliable, scalable digital
        products. We combine product strategy, software engineering, intuitive
        design, and modern architectures to develop applications and platforms
        that solve real-world challenges and evolve with changing business
        needs.
      </>
    ),
    approach: {
      label: "Our approach",
      title: "From Product Vision to Production",
      subtitle: "Turning ideas into reliable, scalable digital products.",
      body: "We work closely with you at every stage, from defining product requirements and designing the architecture to building, launching, and continuously improving digital solutions.",
      steps: [
        {
          title: "Discover",
          desc: "Understand user needs, business goals, product requirements, and technical constraints to define a clear development direction.",
          icon: Search,
        },
        {
          title: "Architect",
          desc: "Design the system architecture, technology stack, user journeys, integrations, and delivery roadmap for a scalable solution.",
          icon: Layers,
        },
        {
          title: "Engineer",
          desc: "Develop applications, APIs, interfaces, and core product features through iterative engineering and continuous collaboration.",
          icon: Code2,
        },
        {
          title: "Validate & Launch",
          desc: "Test functionality, usability, security, and performance before deploying the product into its intended environment.",
          icon: Rocket,
        },
        {
          title: "Evolve",
          desc: "Monitor product performance, incorporate user feedback, enhance features, and scale capabilities as business needs grow.",
          icon: TrendingUp,
        },
      ],
    },
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Engineering modern digital products, <br />
          <span className="">end to end.</span>
        </>
      ),
      body: "From product discovery and design to engineering, integration and modernization — digital products, platforms and business applications that drive growth and efficiency.",
      groups: [
        {
          title: "Product Engineering",
          icon: "Cpu",
          items: [
            {
              title: "Custom Software Development",
              desc: "Tailored software built around your business requirements.",
              icon: "Blocks",
            },
            {
              title: "SaaS Platforms",
              desc: "Cloud-native software products delivered as scalable services.",
              icon: "Cpu",
            },
            {
              title: "Enterprise Applications",
              desc: "Business-critical systems for operations and management.",
              icon: "Files",
            },
          ],
          stack: ["Python", "Node.js", "Go", "NestJS", "FastAPI"],
        },
        {
          title: "Web & Mobile Solutions",
          icon: "Blocks",
          items: [
            {
              title: "Web Development",
              desc: "Responsive web applications and portals.",
              icon: "FileText",
            },
            {
              title: "Mobile Applications",
              desc: "Native and cross-platform apps for iOS and Android.",
              icon: "MessageSquare",
            },
            {
              title: "Progressive Web Apps",
              desc: "App-like web experiences with offline capabilities.",
              icon: "Sparkles",
            },
          ],
          stack: [
            "React",
            "Next.js",
            "Angular",
            "Flutter",
            "React Native",
            "Swift",
          ],
        },
        {
          title: "Experience Design",
          icon: "Sparkles",
          items: [
            {
              title: "UI/UX Design",
              desc: "User-centered design for digital products.",
              icon: "Sparkles",
            },
            {
              title: "Product Discovery",
              desc: "Define product vision, requirements and user journeys.",
              icon: "Search",
            },
            {
              title: "Design Systems",
              desc: "Reusable design frameworks for consistency and scale.",
              icon: "Blocks",
            },
          ],
          stack: ["UI/UX", "Material UI", "Tailwind CSS", "Design Tokens"],
        },
        {
          title: "Systems Integration & Modernization",
          icon: "Settings2",
          items: [
            {
              title: "API Development & Integration",
              desc: "Seamless communication between systems and services.",
              icon: "Network",
            },
            {
              title: "Legacy Modernization",
              desc: "Upgrade aging applications and infrastructure.",
              icon: "RefreshCw",
            },
            {
              title: "Enterprise Integrations",
              desc: "Connect platforms, databases and third-party services.",
              icon: "GitBranch",
            },
          ],
          stack: [
            "APIs & SDKs",
            "SAP / ERP",
            "Azure AD",
            "PostgreSQL",
            "MongoDB",
          ],
        },
      ],
    },
    subDescs: {
      "Product Engineering":
        "Develop scalable software products, SaaS platforms, and enterprise solutions.",
      "Web & Mobile Solutions":
        "Create modern web and mobile experiences across devices and platforms.",
      "Experience Design": "Design intuitive and engaging user experiences.",
      "Systems Integration & Modernization":
        "Connect, modernize, and optimize enterprise technology ecosystems.",
    },
    work: {
      label: "Selected Work",
      title: (
        <>
          Real Solutions. <br /> <span className="">Measurable Impact.</span>
        </>
      ),
      body: "From enterprise platforms to customer-facing applications, we build digital solutions that solve real business challenges.",
      more: { label: "View All Work", href: "/case-studies" },
    },
    industries: {
      label: "Industries We Serve",
      title: (
        <>
          Transforming Industries
          <br />
          with <span className="">Digital Engineering</span>
        </>
      ),
      body: "We apply digital engineering expertise across industries to build innovative products, modernize systems, and create scalable digital experiences.",
      hideProof: true,
    },
  },
  "ai-automation": {
    hideHeroActions: true,
    expertiseWhiteBg: true,
    heroBody:
      "We design, build and deploy intelligent systems that automate work, enhance decision-making and unlock new opportunities. From AI-powered applications to intelligent automation and data solutions, we help organizations stay competitive in a rapidly evolving world.",
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Building intelligent solutions{" "}
        <span className="">for a smarter tomorrow.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry is a technology and AI solutions company focused on helping
        businesses turn complex challenges into practical, scalable solutions.
        We combine deep technical expertise with business understanding to
        deliver AI, automation and digital transformation solutions that drive
        real impact.
      </>
    ),
    subIcons: {
      "AI Solutions & Applications": Cpu,
      "Intelligent Automation": Workflow,
      "Document & Knowledge Intelligence": FileText,
      "AI Engineering & Operations": Settings2,
    },
    subDescs: {
      "AI Solutions & Applications":
        "Build intelligent AI-powered products, enterprise assistants, agentic systems, and generative AI applications.",
      "Intelligent Automation":
        "Automate workflows, business processes, operational tasks, and decision-support activities.",
      "Document & Knowledge Intelligence":
        "Transform documents and unstructured information into searchable, structured, and actionable business knowledge using OCR, extraction, knowledge systems, and RAG.",
      "AI Engineering & Operations":
        "Deploy, monitor, evaluate, optimize, and govern AI systems through MLOps, LLMOps, model evaluation, prompt optimization, and AI governance.",
    },
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Four Capabilities. <br />
          <span className="">One intelligent enterprise.</span>
        </>
      ),
      body: "Each capability is a complete practice with its own methods, stack and delivery patterns proven in production systems for enterprise clients.",
      groups: [
        {
          title: "AI Solutions & Applications",
          icon: "Cpu",
          tagline: "From intelligent agents to enterprise AI platforms.",
          blurb:
            "From intelligent agents to enterprise AI platforms, we design and deploy solutions that automate work, augment decision-making, and create new possibilities for your business.",
          items: [
            {
              title: "Agentic AI & Orchestration",
              desc: "Specialized agents for finance, procurement, compliance, sales, service & HR acting across enterprise systems.",
              icon: "Network",
            },
            {
              title: "AI Agents as a Service",
              desc: "Ready-to-deploy agents, managed and maintained by our team.",
              icon: "Bot",
            },
            {
              title: "Enterprise AI Assistants",
              desc: "Internal copilots for employees, knowledge workers and operations.",
              icon: "MessageSquare",
            },
            {
              title: "Generative AI Applications",
              desc: "Custom LLM apps, including purpose-built domain LLMs.",
              icon: "Sparkles",
            },
          ],
          stack: ["LangGraph", "CrewAI", "LangChain", "Claude", "OpenAI"],
        },
        {
          title: "Intelligent Automation",
          icon: "Workflow",
          tagline: "Streamline operations with end-to-end automation.",
          blurb:
            "Automate end-to-end processes across systems and teams — routing, approvals, decisions and integrations — so work moves faster with far less manual effort.",
          items: [
            {
              title: "Workflow Automation",
              desc: "Policy-driven routing, approvals and escalations with n8n, Zapier and custom engines.",
              icon: "Workflow",
            },
            {
              title: "Business Process Automation",
              desc: "End-to-end processes automated across systems and teams.",
              icon: "Cog",
            },
            {
              title: "Decision Intelligence",
              desc: "AI-assisted validation, matching and exception handling.",
              icon: "GitBranch",
            },
            {
              title: "Enterprise Integration",
              desc: "Connected directly to SAP, ERP, CRM and finance platforms.",
              icon: "Blocks",
            },
          ],
          stack: ["n8n", "Zapier", "SAP / ERP", "Event-driven"],
        },
        {
          title: "Document & Knowledge Intelligence",
          icon: "FileText",
          tagline: "Unlock the value of your enterprise information.",
          blurb:
            "Turn documents and unstructured information into searchable, governed knowledge that both people and AI agents can act on with confidence.",
          items: [
            {
              title: "Document Processing at Scale",
              desc: "OCR, classification, extraction and validation pipelines across 1,000+ formats.",
              icon: "Files",
            },
            {
              title: "OCR & Data Extraction",
              desc: "Scanned and handwritten documents into structured data.",
              icon: "ScanLine",
            },
            {
              title: "Retrieval-Augmented Generation",
              desc: "Semantic & vector search grounding every answer in real sources.",
              icon: "Search",
            },
            {
              title: "Governed Knowledge",
              desc: "Permission-aware retrieval for people and AI agents.",
              icon: "ShieldCheck",
            },
          ],
          stack: ["Azure AI Search", "Pinecone", "Chroma", "Elasticsearch"],
        },
        {
          title: "AI Engineering & Operations",
          icon: "Settings2",
          tagline: "Build and run scalable, reliable AI systems.",
          blurb:
            "Deploy, evaluate, tune and govern AI systems in production — with the monitoring, controls and audit trails that enterprise adoption demands.",
          items: [
            {
              title: "MLOps & LLMOps",
              desc: "Deployment, monitoring and lifecycle management of AI systems.",
              icon: "RefreshCw",
            },
            {
              title: "Model Evaluation",
              desc: "Accuracy, performance and business-impact measurement.",
              icon: "BarChart3",
            },
            {
              title: "Fine-Tuning & Optimization",
              desc: "Prompt engineering plus PEFT, LoRA and QLoRA fine-tuning.",
              icon: "SlidersHorizontal",
            },
            {
              title: "AI Governance",
              desc: "Permissions, policy thresholds, human-in-the-loop and full audit trails.",
              icon: "ShieldCheck",
            },
          ],
          stack: ["MLflow", "Kubeflow", "LangSmith", "SageMaker", "Vertex AI"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From AI Opportunity to Production",
      subtitle: "Turning an AI idea into a working business capability.",
      body: "We work closely with you at every step from identifying opportunities to building, deploying and continuously improving solutions that create measurable value.",
      steps: [
        {
          title: "Analyze",
          desc: "Understand business challenges, user needs, existing processes, data readiness and identify opportunities where AI can deliver measurable value.",
          icon: Search,
        },
        {
          title: "Design",
          desc: "Define the AI approach, select the right models and technologies, design the replication architecture, plan data pipelines and integrations, and establish security, governance and success criteria.",
          icon: Layers,
        },
        {
          title: "Build",
          desc: "Develop AI applications, agents, automation workflows and knowledge systems, connecting them with enterprise data, APIs and existing business processes.",
          icon: Code2,
        },
        {
          title: "Deploy",
          desc: "Test accuracy, reliability, performance and security, refine the solution and deploy it into a production environment with appropriate controls.",
          icon: UploadCloud,
        },
        {
          title: "Optimize",
          desc: "Monitor system performance, usage, costs and business impact. Continuously improve models and workflows, address changing requirements and scale successful solutions.",
          icon: TrendingUp,
        },
      ],
    },
    sequence: {
      label: "Outcomes",
      title: (
        <>
          Measurable Results. <span className="">Long-Term Value.</span>
        </>
      ),
      body: (
        <>
          <p>
            Funavry&rsquo;s AI and automation capabilities deliver tangible
            business outcomes that go beyond efficiency. By reducing{" "}
            <strong className="font-semibold text-ink">manual work</strong>,{" "}
            <strong className="font-semibold text-ink">
              improving decision-making
            </strong>
            , and unlocking enterprise knowledge, organizations gain the agility
            to operate smarter and scale responsibly.
          </p>
          <p>
            Each initiative is designed to enhance operational performance,{" "}
            <strong className="font-semibold text-ink">
              create new digital capabilities
            </strong>
            , and build a foundation for sustainable growth.
          </p>
        </>
      ),
      steps: [
        {
          label: "Efficiency",
          icon: Gauge,
          desc: "Automate processes and eliminate manual work.",
        },
        {
          label: "Insight",
          icon: Lightbulb,
          desc: "Turn data into actionable business insights.",
        },
        {
          label: "Knowledge",
          icon: FileSearch,
          desc: "Unlock enterprise knowledge across your organization.",
        },
        {
          label: "Optimization",
          icon: TrendingUp,
          desc: "Improve operations and maximize business value.",
        },
        {
          label: "Innovation",
          icon: Sparkles,
          desc: "Create new digital capabilities and explore new opportunities.",
        },
        {
          label: "Governance",
          icon: ShieldCheck,
          desc: "Ensure responsible, secure, and scalable AI adoption.",
        },
      ],
    },
    work: {
      label: "Selected Work",
      title: (
        <>
          Real Solutions. <br /> <span className="">Measurable Impact.</span>
        </>
      ),
      body: "From AI-powered applications to intelligent automation and knowledge systems, we build solutions that solve real business challenges.",
      more: { label: "View All Work", href: "/case-studies" },
    },
    industries: {
      label: "Industries We Serve",
      title: (
        <>
          Transforming Industries
          <br />
          with <span className="">AI &amp; Automation</span>
        </>
      ),
      body: "We apply AI, automation, and digital engineering expertise across industries to solve complex operational challenges, improve decision-making, and create scalable digital experiences.",
      hideProof: true,
    },
  },
  "immersive-technologies": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Turning emerging technologies{" "}
        <span className="">into practical innovation.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry helps businesses explore and adopt emerging technologies to
        address complex challenges and unlock new opportunities. We combine
        technical experimentation, rapid prototyping, system integration, and
        solution development to transform promising ideas into practical
        business capabilities.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Immersive experiences that blend <br />
          <span className="">physical and virtual worlds.</span>
        </>
      ),
      body: "From AR, VR and mixed reality to games, digital worlds and simulation — engaging experiences for commerce, training and entertainment.",
      groups: [
        {
          title: "Extended Reality (XR)",
          icon: "Glasses",
          items: [
            {
              title: "Augmented Reality (AR)",
              desc: "Overlay digital content onto physical environments.",
              icon: "MapPin",
            },
            {
              title: "Virtual Reality (VR)",
              desc: "Fully immersive virtual experiences.",
              icon: "Glasses",
            },
            {
              title: "Mixed Reality (MR)",
              desc: "Blend digital and physical worlds interactively.",
              icon: "Blocks",
            },
          ],
          stack: ["ARKit", "ARCore", "Vuforia", "OpenXR", "Quest"],
        },
        {
          title: "Gaming & Interactive Experiences",
          icon: "Gamepad2",
          items: [
            {
              title: "Game Development",
              desc: "Design and develop games across platforms.",
              icon: "Gamepad2",
            },
            {
              title: "Gamification Solutions",
              desc: "Apply game mechanics to business processes.",
              icon: "Trophy",
            },
            {
              title: "Interactive Applications",
              desc: "Rich, interactive digital experiences.",
              icon: "Sparkles",
            },
          ],
          stack: ["Unity", "Unreal Engine"],
        },
        {
          title: "Digital Worlds & Metaverse",
          icon: "Globe",
          items: [
            {
              title: "Metaverse Platforms",
              desc: "Shared virtual spaces and experiences.",
              icon: "Globe",
            },
            {
              title: "Virtual Commerce",
              desc: "Digital marketplaces and virtual transactions.",
              icon: "CreditCard",
            },
            {
              title: "Digital Communities",
              desc: "Social and collaborative virtual environments.",
              icon: "Users",
            },
          ],
          stack: ["Unity", "Unreal", "WebGL"],
        },
        {
          title: "Simulation & Training",
          icon: "Boxes",
          items: [
            {
              title: "Training Simulators",
              desc: "Safe environments for skills development.",
              icon: "Glasses",
            },
            {
              title: "Industrial Simulations",
              desc: "Simulate processes, systems and operations.",
              icon: "Boxes",
            },
            {
              title: "Educational Experiences",
              desc: "Interactive learning and teaching solutions.",
              icon: "GraduationCap",
            },
          ],
          stack: ["Blender", "Autodesk Maya", "3ds Max"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Emerging Ideas to Practical Innovation",
      subtitle:
        "Exploring new technologies to create meaningful business capabilities.",
      body: "We help organizations evaluate, develop, and integrate emerging technologies into practical solutions that address evolving business challenges, unlock new opportunities, and support digital transformation.",
      steps: [
        {
          title: "Explore",
          desc: "Identify emerging technologies, industry trends, business challenges, and opportunities where innovation can create measurable value.",
          icon: Search,
        },
        {
          title: "Evaluate",
          desc: "Assess technical feasibility, business relevance, integration requirements, potential risks, and expected value to determine the right approach.",
          icon: ClipboardCheck,
        },
        {
          title: "Prototype",
          desc: "Develop proof of concepts and experimental solutions to test assumptions, validate functionality, and demonstrate potential applications.",
          icon: FlaskConical,
        },
        {
          title: "Integrate & Validate",
          desc: "Connect promising technologies with existing systems, evaluate performance, and validate reliability, usability, and security.",
          icon: ShieldCheck,
        },
        {
          title: "Scale & Evolve",
          desc: "Move validated solutions toward production, refine capabilities using real-world feedback, and adapt implementations as technologies mature.",
          icon: TrendingUp,
        },
      ],
    },
  },
  "blockchain-fintech": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Powering secure and connected{" "}
        <span className="">financial experiences.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry develops blockchain-powered applications and financial
        technology solutions that enable secure transactions, streamlined
        financial operations, and new digital capabilities. We combine
        blockchain engineering, financial software development, and secure
        system integration to build reliable solutions for evolving financial
        ecosystems.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Trusted digital asset ecosystems and <br />
          <span className="">modern financial platforms.</span>
        </>
      ),
      body: "Secure blockchain infrastructure, decentralized applications, tokenized assets and financial platforms — engineered for trust, scale and compliance.",
      groups: [
        {
          title: "Blockchain Platforms",
          icon: "Boxes",
          items: [
            {
              title: "L1/L2 Blockchain Development",
              desc: "Design and build blockchain networks and scaling solutions.",
              icon: "Boxes",
            },
            {
              title: "Blockchain Infrastructure",
              desc: "Node management, validators and network services.",
              icon: "GitBranch",
            },
            {
              title: "Protocol Engineering",
              desc: "Develop and customize blockchain protocols.",
              icon: "Blocks",
            },
          ],
          stack: ["Ethereum", "Polygon", "Solana", "Solidity", "Rust"],
        },
        {
          title: "Web3 & Decentralized Applications",
          icon: "Globe",
          items: [
            {
              title: "dApp Development",
              desc: "Build decentralized applications and platforms.",
              icon: "Blocks",
            },
            {
              title: "Wallet Integration",
              desc: "Connect applications with digital wallets.",
              icon: "Wallet",
            },
            {
              title: "Web3 Solutions",
              desc: "Enable decentralized ownership and transactions.",
              icon: "Globe",
            },
          ],
          stack: ["Alchemy", "Infura", "QuickNode", "Chainlink", "LayerZero"],
        },
        {
          title: "Digital Assets & Tokenization",
          icon: "Coins",
          items: [
            {
              title: "Asset Tokenization",
              desc: "Convert real-world assets into digital tokens.",
              icon: "Coins",
            },
            {
              title: "Digital Asset Platforms",
              desc: "Manage and trade tokenized assets.",
              icon: "BarChart3",
            },
            {
              title: "NFT Solutions",
              desc: "Build NFT marketplaces and ecosystems.",
              icon: "Sparkles",
            },
          ],
          stack: ["BNB", "Avalanche", "Arbitrum", "Optimism", "Base"],
        },
        {
          title: "FinTech Solutions",
          icon: "CreditCard",
          items: [
            {
              title: "Digital Payments",
              desc: "Payment gateways and transaction processing systems.",
              icon: "CreditCard",
            },
            {
              title: "Banking Platforms",
              desc: "Core banking and digital financial services.",
              icon: "Landmark",
            },
            {
              title: "Trading Systems & Bots",
              desc: "Automated trading platforms and market tools.",
              icon: "Activity",
            },
            {
              title: "DeFi Solutions",
              desc: "Decentralized lending, borrowing and financial products.",
              icon: "TrendingUp",
            },
          ],
          stack: ["Payments", "Core Banking", "Trading", "DeFi"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Financial Innovation to Secure Solutions",
      subtitle:
        "Building trusted financial platforms and blockchain-powered applications.",
      body: "We combine financial technology expertise, secure system architecture, and blockchain engineering to develop dependable digital financial services and decentralized applications.",
      steps: [
        {
          title: "Discover",
          desc: "Identify business objectives, user requirements, transaction flows, regulatory considerations, and opportunities for financial innovation.",
          icon: Search,
        },
        {
          title: "Design",
          desc: "Define the platform architecture, blockchain network, smart contract logic, payment workflows, and security controls.",
          icon: Layers,
        },
        {
          title: "Develop",
          desc: "Build decentralized applications, smart contracts, digital wallets, payment integrations, and financial platform capabilities.",
          icon: Code2,
        },
        {
          title: "Secure & Validate",
          desc: "Validate transaction logic, test smart contracts, assess vulnerabilities, and verify system reliability before release.",
          icon: ShieldCheck,
        },
        {
          title: "Deploy & Scale",
          desc: "Launch financial and blockchain solutions, monitor transactions and system health, and optimize performance as adoption grows.",
          icon: TrendingUp,
        },
      ],
    },
  },
  "data-business-intelligence": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Turning business data into{" "}
        <span className="">actionable intelligence.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry helps organizations transform complex data into meaningful
        insights that support smarter decisions. Through data engineering,
        advanced analytics, and business intelligence, we connect information
        sources, improve data accessibility, and deliver clear visibility into
        business performance and opportunities.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Raw data turned into trusted insight <br />
          <span className="">and decisions.</span>
        </>
      ),
      body: "Modern data foundations, analytics and governance — transforming raw data into trusted insights, operational intelligence and strategic decision-making.",
      groups: [
        {
          title: "Data Engineering",
          icon: "Database",
          items: [
            {
              title: "Data Pipelines",
              desc: "Collect, transform and move data efficiently.",
              icon: "Workflow",
            },
            {
              title: "Data Lakes & Warehouses",
              desc: "Centralized storage for enterprise data.",
              icon: "Files",
            },
            {
              title: "Data Integration",
              desc: "Connect data across systems and platforms.",
              icon: "Network",
            },
          ],
          stack: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
        },
        {
          title: "Analytics & Business Intelligence",
          icon: "BarChart3",
          items: [
            {
              title: "Business Intelligence",
              desc: "Data-driven reporting and analysis.",
              icon: "BarChart3",
            },
            {
              title: "Dashboard Development",
              desc: "Real-time operational and executive dashboards.",
              icon: "Blocks",
            },
            {
              title: "Performance Analytics",
              desc: "Measure KPIs and business outcomes.",
              icon: "SlidersHorizontal",
            },
          ],
          stack: ["BI", "Dashboards", "KPIs"],
        },
        {
          title: "Real-Time Data Platforms",
          icon: "Activity",
          items: [
            {
              title: "Event Streaming",
              desc: "Process continuous streams of data.",
              icon: "RefreshCw",
            },
            {
              title: "Real-Time Analytics",
              desc: "Generate insights instantly.",
              icon: "Sparkles",
            },
            {
              title: "Operational Intelligence",
              desc: "Monitor and optimize live operations.",
              icon: "Activity",
            },
          ],
          stack: ["Streaming", "Real-Time"],
        },
        {
          title: "Data Strategy & Governance",
          icon: "ShieldCheck",
          items: [
            {
              title: "Data Governance",
              desc: "Policies and controls for enterprise data.",
              icon: "ShieldCheck",
            },
            {
              title: "Data Quality Management",
              desc: "Improve accuracy and consistency.",
              icon: "ScanLine",
            },
            {
              title: "Master Data Management",
              desc: "Maintain trusted enterprise records.",
              icon: "Files",
            },
          ],
          stack: ["Governance", "Data Quality", "MDM"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Raw Data to Actionable Intelligence",
      subtitle:
        "Transforming business data into meaningful insights and informed decisions.",
      body: "We help organizations connect data sources, establish reliable data pipelines, uncover meaningful patterns, and deliver actionable insights through analytics and business intelligence solutions.",
      steps: [
        {
          title: "Discover Data",
          desc: "Assess business objectives, available data sources, reporting needs, and key performance indicators to define an analytics strategy.",
          icon: Database,
        },
        {
          title: "Integrate",
          desc: "Connect databases, applications, and external sources while building reliable pipelines to consolidate and prepare business data.",
          icon: Workflow,
        },
        {
          title: "Analyze",
          desc: "Apply statistical analysis, data modeling, and advanced analytics to identify trends, patterns, and opportunities for improvement.",
          icon: LineChart,
        },
        {
          title: "Visualize",
          desc: "Translate complex datasets into interactive dashboards, clear reports, and performance indicators that support informed decisions.",
          icon: BarChart3,
        },
        {
          title: "Optimize",
          desc: "Monitor KPIs, improve data quality, refine analytical models, and evolve reporting capabilities as business priorities change.",
          icon: TrendingUp,
        },
      ],
    },
  },
  "cloud-devops-cybersecurity": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Building secure, resilient, and{" "}
        <span className="">scalable digital infrastructure.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry helps organizations modernize cloud environments, streamline
        software delivery, and strengthen cybersecurity. We integrate cloud
        engineering, DevOps automation, infrastructure monitoring, and security
        practices to improve system reliability, protect digital assets, and
        support sustainable growth.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Secure, scalable and resilient <br />
          <span className="">technology platforms.</span>
        </>
      ),
      body: "Cloud environments, delivery pipelines, observability and security — the platform engineering that keeps business-critical systems fast, reliable and protected.",
      groups: [
        {
          title: "Cloud Infrastructure",
          icon: "Cloud",
          items: [
            {
              title: "Cloud Architecture",
              desc: "Design scalable cloud solutions.",
              icon: "Cloud",
            },
            {
              title: "Cloud Migration",
              desc: "Move systems and workloads to the cloud.",
              icon: "RefreshCw",
            },
            {
              title: "Infrastructure Management",
              desc: "Operate and optimize cloud environments.",
              icon: "Cog",
            },
          ],
          stack: ["AWS", "Azure", "GCP"],
        },
        {
          title: "DevOps & Platform Engineering",
          icon: "GitBranch",
          items: [
            {
              title: "CI/CD Pipelines",
              desc: "Automate software delivery processes.",
              icon: "GitBranch",
            },
            {
              title: "Infrastructure as Code",
              desc: "Manage infrastructure through code.",
              icon: "Blocks",
            },
            {
              title: "Platform Engineering",
              desc: "Build self-service engineering platforms.",
              icon: "Boxes",
            },
          ],
          stack: ["Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub"],
        },
        {
          title: "Observability & Reliability",
          icon: "Activity",
          items: [
            {
              title: "Monitoring & Logging",
              desc: "Track system health and performance.",
              icon: "Activity",
            },
            {
              title: "Incident Management",
              desc: "Detect and resolve operational issues.",
              icon: "AlertTriangle",
            },
            {
              title: "Site Reliability Engineering",
              desc: "Improve resilience and uptime.",
              icon: "RefreshCw",
            },
          ],
          stack: ["Prometheus", "Grafana", "ELK Stack", "OpenTelemetry"],
        },
        {
          title: "Cybersecurity & Compliance",
          icon: "ShieldCheck",
          items: [
            {
              title: "Security Assessments",
              desc: "Identify vulnerabilities and risks.",
              icon: "Search",
            },
            {
              title: "Identity & Access Management",
              desc: "Control user access securely.",
              icon: "KeyRound",
            },
            {
              title: "Security Operations",
              desc: "Continuous monitoring and threat detection.",
              icon: "ShieldCheck",
            },
            {
              title: "Compliance & Governance",
              desc: "Meet regulatory and industry requirements.",
              icon: "FileText",
            },
          ],
          stack: ["IAM", "SecOps", "Compliance"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Infrastructure to Secure Operations",
      subtitle:
        "Building resilient cloud environments, streamlined delivery pipelines, and secure digital infrastructure.",
      body: "We help organizations modernize their infrastructure, automate software delivery, strengthen security controls, and maintain reliable systems through integrated cloud engineering, DevOps practices, and cybersecurity solutions.",
      steps: [
        {
          title: "Assess",
          desc: "Evaluate existing infrastructure, security posture, operational requirements, and business objectives to identify risks and modernization opportunities.",
          icon: Search,
        },
        {
          title: "Architect",
          desc: "Design scalable cloud environments, infrastructure configurations, CI/CD pipelines, and security architectures aligned with business and technical requirements.",
          icon: Layers,
        },
        {
          title: "Implement",
          desc: "Build cloud infrastructure, automate deployments, integrate monitoring tools, and implement security controls across applications and systems.",
          icon: Code2,
        },
        {
          title: "Secure & Validate",
          desc: "Assess vulnerabilities, test configurations, verify access controls, and validate infrastructure reliability, resilience, and compliance requirements.",
          icon: ShieldCheck,
        },
        {
          title: "Monitor & Optimize",
          desc: "Monitor system health, detect potential threats, optimize cloud resources, and continuously improve security, availability, and operational performance.",
          icon: Gauge,
        },
      ],
    },
  },
  "quality-engineering": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Engineering quality into{" "}
        <span className="">every digital solution.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry helps organizations improve software reliability, validate
        system performance, and identify gaps in technical processes and
        controls. Through structured testing, quality engineering, and technical
        audits, we support dependable software delivery, risk identification,
        and continuous improvement.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Quality, performance and security <br />
          <span className="">engineered and audited.</span>
        </>
      ),
      body: "Ensure software, AI systems and infrastructure meet the highest standards of quality, performance and security — from functional testing to AI audits.",
      groups: [
        {
          title: "Software Quality Assurance",
          icon: "ClipboardCheck",
          items: [
            {
              title: "Manual Testing",
              desc: "Human-led validation of software functionality.",
              icon: "ClipboardList",
            },
            {
              title: "Functional Testing",
              desc: "Verify business requirements and workflows.",
              icon: "ClipboardCheck",
            },
            {
              title: "Regression Testing",
              desc: "Ensure changes do not introduce defects.",
              icon: "RefreshCw",
            },
          ],
          stack: ["QA", "Functional", "Regression"],
        },
        {
          title: "Test Automation",
          icon: "GitBranch",
          items: [
            {
              title: "Automated Testing",
              desc: "Execute repeatable tests automatically.",
              icon: "Zap",
            },
            {
              title: "Continuous Testing",
              desc: "Integrate testing into CI/CD pipelines.",
              icon: "GitBranch",
            },
            {
              title: "API Testing",
              desc: "Validate backend services and integrations.",
              icon: "Blocks",
            },
          ],
          stack: ["Automation", "CI/CD", "API Testing"],
        },
        {
          title: "Performance & Reliability Testing",
          icon: "Gauge",
          items: [
            {
              title: "Load Testing",
              desc: "Measure performance under expected demand.",
              icon: "Gauge",
            },
            {
              title: "Stress Testing",
              desc: "Identify system breaking points.",
              icon: "AlertTriangle",
            },
            {
              title: "Scalability Testing",
              desc: "Validate growth and capacity planning.",
              icon: "TrendingUp",
            },
          ],
          stack: ["Load", "Stress", "Scalability"],
        },
        {
          title: "Security & AI Audits",
          icon: "ShieldCheck",
          items: [
            {
              title: "Penetration Testing",
              desc: "Simulate attacks to uncover vulnerabilities.",
              icon: "Lock",
            },
            {
              title: "Security Audits",
              desc: "Review security controls and compliance.",
              icon: "ShieldCheck",
            },
            {
              title: "AI Testing & Evaluation",
              desc: "Assess AI quality, accuracy and safety.",
              icon: "Sparkles",
            },
            {
              title: "Model Risk Assessments",
              desc: "Identify risks associated with AI systems.",
              icon: "Scale",
            },
          ],
          stack: ["Pentesting", "AI Evaluation", "Model Risk"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Quality Assurance to Continuous Improvement",
      subtitle:
        "Embedding quality, reliability, and compliance throughout the technology lifecycle.",
      body: "We help organizations improve software quality, validate system performance, identify operational gaps, and assess processes against defined requirements through structured testing, quality engineering, and technical audits.",
      steps: [
        {
          title: "Assess",
          desc: "Understand system requirements, quality objectives, existing processes, risk areas, and applicable technical or compliance criteria.",
          icon: Search,
        },
        {
          title: "Plan",
          desc: "Define test strategies, audit criteria, validation procedures, quality metrics, and assessment plans aligned with project objectives.",
          icon: ClipboardCheck,
        },
        {
          title: "Test & Inspect",
          desc: "Perform functional, integration, regression, performance, security, and other relevant testing activities to identify defects and inconsistencies.",
          icon: FlaskConical,
        },
        {
          title: "Audit & Validate",
          desc: "Review technical implementations, configurations, documented procedures, and supporting evidence to identify gaps and verify adherence to established requirements.",
          icon: ShieldCheck,
        },
        {
          title: "Improve & Verify",
          desc: "Document findings, recommend corrective actions, validate resolutions, and establish continuous improvement practices to strengthen quality and reliability.",
          icon: RefreshCw,
        },
      ],
    },
  },
  "managed-services": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Keeping technology reliable,{" "}
        <span className="">secure, and performing.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry provides ongoing technology management, operational support, and
        system monitoring to help organizations maintain reliable digital
        environments. We focus on proactive maintenance, efficient issue
        resolution, and continuous optimization to support service continuity
        and evolving business requirements.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          We run it, so your teams can build <br />
          <span className="">what&apos;s next.</span>
        </>
      ),
      body: "Ongoing operational support, monitoring, optimization and management of business-critical technology systems — infrastructure, applications, data, AI and security.",
      groups: [
        {
          title: "Managed Infrastructure Services",
          icon: "Cloud",
          items: [
            {
              title: "Cloud Operations",
              desc: "Day-to-day operation of your cloud environments.",
              icon: "Cloud",
            },
            {
              title: "Infrastructure Support",
              desc: "Responsive support for platforms and systems.",
              icon: "Headphones",
            },
            {
              title: "Backup & Disaster Recovery",
              desc: "Protect data and restore operations fast.",
              icon: "RefreshCw",
            },
            {
              title: "Platform Maintenance",
              desc: "Keep platforms patched, tuned and healthy.",
              icon: "Wrench",
            },
          ],
          stack: ["24/7 Ops", "Backup & DR"],
        },
        {
          title: "Managed Application Services",
          icon: "Blocks",
          items: [
            {
              title: "Application Support",
              desc: "Keep business applications running smoothly.",
              icon: "Headphones",
            },
            {
              title: "Release Management",
              desc: "Controlled, reliable software releases.",
              icon: "Bell",
            },
            {
              title: "Performance Optimization",
              desc: "Continuously improve speed and efficiency.",
              icon: "TrendingUp",
            },
            {
              title: "Application Monitoring",
              desc: "Track application health in real time.",
              icon: "Gauge",
            },
          ],
          stack: ["Support", "Releases", "Monitoring"],
        },
        {
          title: "Managed Data & AI Services",
          icon: "Database",
          items: [
            {
              title: "Data Platform Operations",
              desc: "Operate and optimize enterprise data platforms.",
              icon: "Files",
            },
            {
              title: "AI Operations (AIOps / MLOps)",
              desc: "Run and maintain AI systems in production.",
              icon: "RefreshCw",
            },
            {
              title: "Model Monitoring",
              desc: "Track model accuracy, drift and performance.",
              icon: "Gauge",
            },
            {
              title: "Data Quality Management",
              desc: "Keep enterprise data accurate and trusted.",
              icon: "ShieldCheck",
            },
          ],
          stack: ["MLOps", "Model Monitoring"],
        },
        {
          title: "Managed Security Services",
          icon: "ShieldCheck",
          items: [
            {
              title: "Security Monitoring",
              desc: "Continuous monitoring of your security posture.",
              icon: "ShieldCheck",
            },
            {
              title: "Threat Detection",
              desc: "Identify threats before they become incidents.",
              icon: "Search",
            },
            {
              title: "Incident Response",
              desc: "Contain and resolve security incidents fast.",
              icon: "AlertTriangle",
            },
            {
              title: "Vulnerability Management",
              desc: "Find, prioritize and remediate vulnerabilities.",
              icon: "ClipboardList",
            },
          ],
          stack: ["SOC", "Threat Detection", "Response"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Daily Operations to Continuous Excellence",
      subtitle:
        "Keeping technology environments reliable, secure, and aligned with business needs.",
      body: "We provide ongoing technology support, infrastructure management, system monitoring, and operational optimization to help organizations maintain service continuity, resolve issues efficiently, and focus on their core business priorities.",
      steps: [
        {
          title: "Understand",
          desc: "Assess existing systems, service requirements, operational challenges, infrastructure, and support expectations to establish a clear service baseline.",
          icon: Search,
        },
        {
          title: "Plan & Transition",
          desc: "Define service responsibilities, operational procedures, escalation paths, service-level expectations, and transition plans for a smooth onboarding process.",
          icon: ClipboardCheck,
        },
        {
          title: "Operate & Support",
          desc: "Manage day-to-day technology operations, handle service requests, resolve incidents, maintain systems, and support users according to agreed service requirements.",
          icon: Settings2,
        },
        {
          title: "Monitor & Maintain",
          desc: "Monitor availability, performance, security, and system health while carrying out preventive maintenance and identifying potential issues.",
          icon: Gauge,
        },
        {
          title: "Optimize & Improve",
          desc: "Review service performance, identify recurring problems, optimize resources, and implement improvements to maintain reliable and efficient operations.",
          icon: TrendingUp,
        },
      ],
    },
  },
  "robotics-iot-computer-vision": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Connecting the physical world{" "}
        <span className="">with intelligent technology.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry develops robotics, Internet of Things (IoT), and computer vision
        solutions that connect devices, interpret real-world data, and automate
        operational processes. We combine hardware integration, intelligent
        software, and visual analytics to enable smarter monitoring, greater
        visibility, and more efficient operations.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Intelligent systems connected to <br />
          <span className="">physical operations.</span>
        </>
      ),
      body: "Connect physical assets with intelligent systems to automate operations, monitor performance and generate real-time insights.",
      groups: [
        {
          title: "Computer Vision & Video Analytics",
          icon: "Camera",
          items: [
            {
              title: "Object Detection & Tracking",
              desc: "Identify and track objects in images and video.",
              icon: "Target",
            },
            {
              title: "Visual Inspection & Quality Control",
              desc: "Automate defect detection and quality assessment.",
              icon: "Eye",
            },
            {
              title: "Video Analytics",
              desc: "Extract insights from live and recorded video streams.",
              icon: "Video",
            },
            {
              title: "Recognition Systems",
              desc: "License plate, facial and activity recognition.",
              icon: "ScanLine",
            },
          ],
          stack: ["PyTorch", "TensorFlow", "Keras"],
        },
        {
          title: "Industrial IoT & Connected Systems",
          icon: "Cpu",
          items: [
            {
              title: "Industrial IoT Solutions",
              desc: "Digitize manufacturing and industrial environments.",
              icon: "Building2",
            },
            {
              title: "Connected Devices",
              desc: "Integrate sensors, machines and smart devices.",
              icon: "Cog",
            },
            {
              title: "Asset Monitoring",
              desc: "Track equipment health and operational performance.",
              icon: "Gauge",
            },
            {
              title: "Predictive Maintenance",
              desc: "Anticipate failures before they occur.",
              icon: "Wrench",
            },
          ],
          stack: ["Sensors", "Telemetry", "Monitoring"],
        },
        {
          title: "Robotics & Edge Intelligence",
          icon: "Bot",
          items: [
            {
              title: "Robotics Solutions",
              desc: "Automated robotic systems for industrial use.",
              icon: "Bot",
            },
            {
              title: "Autonomous Systems",
              desc: "Self-operating machines and devices.",
              icon: "Compass",
            },
            {
              title: "Edge AI",
              desc: "Run AI models directly on devices and equipment.",
              icon: "Cpu",
            },
            {
              title: "Embedded Intelligence",
              desc: "Integrate AI into hardware systems.",
              icon: "Zap",
            },
          ],
          stack: ["Edge AI", "Embedded"],
        },
        {
          title: "Digital Twins & Smart Infrastructure",
          icon: "Building2",
          items: [
            {
              title: "Digital Twins",
              desc: "Real-time virtual replicas of physical assets.",
              icon: "Blocks",
            },
            {
              title: "Smart Infrastructure",
              desc: "Intelligent monitoring of buildings and utilities.",
              icon: "Building2",
            },
            {
              title: "Infrastructure Analytics",
              desc: "Analyze performance and operational trends.",
              icon: "BarChart3",
            },
            {
              title: "Predictive Simulation",
              desc: "Model future scenarios and outcomes.",
              icon: "TrendingUp",
            },
          ],
          stack: ["Digital Twins", "Simulation"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Connected Devices to Intelligent Automation",
      subtitle:
        "Connecting physical environments with intelligent systems that perceive, analyze, and act.",
      body: "We develop robotics, Internet of Things (IoT), and computer vision solutions that connect devices, capture real-world data, automate physical processes, and enable intelligent monitoring across industrial and operational environments.",
      steps: [
        {
          title: "Identify",
          desc: "Understand operational challenges, physical environments, automation opportunities, device requirements, and desired outcomes.",
          icon: Search,
        },
        {
          title: "Design",
          desc: "Define system architecture, sensor configurations, connectivity, robotic workflows, vision models, and edge or cloud processing requirements.",
          icon: Layers,
        },
        {
          title: "Build & Integrate",
          desc: "Develop device software, IoT platforms, robotic applications, and computer vision models while integrating hardware, sensors, and enterprise systems.",
          icon: Code2,
        },
        {
          title: "Test & Validate",
          desc: "Test device connectivity, perception accuracy, automation behavior, system reliability, and performance under real-world operating conditions.",
          icon: ShieldCheck,
        },
        {
          title: "Deploy & Optimize",
          desc: "Deploy solutions into operational environments, monitor devices and model performance, refine automation workflows, and improve reliability as requirements evolve.",
          icon: TrendingUp,
        },
      ],
    },
  },
  "geospatial-ai": {
    expertiseLabel: "Overview",
    expertiseTitle: (
      <>
        Transforming location data into{" "}
        <span className="">real-world intelligence.</span>
      </>
    ),
    expertiseBody: (
      <>
        Funavry combines geographic information systems, geospatial AI, remote
        sensing, and satellite analytics to turn complex spatial data into
        actionable insights. Our solutions help organizations identify
        geographic patterns, monitor environmental and operational changes,
        assess spatial risks, and make informed decisions.
      </>
    ),
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Location data turned into <br />
          <span className="">actionable intelligence.</span>
        </>
      ),
      body: "Transform location-based data into actionable intelligence for planning, monitoring and decision-making — from satellite imagery to enterprise GIS platforms.",
      groups: [
        {
          title: "Geospatial Analytics",
          icon: "Map",
          items: [
            {
              title: "Spatial Analysis",
              desc: "Identify patterns and relationships in geographic data.",
              icon: "Search",
            },
            {
              title: "Location Intelligence",
              desc: "Support decisions using geospatial insights.",
              icon: "MapPin",
            },
            {
              title: "Mapping Solutions",
              desc: "Create interactive and analytical maps.",
              icon: "Map",
            },
          ],
          stack: ["Spatial Analysis", "Location Intelligence"],
        },
        {
          title: "Satellite & Remote Sensing",
          icon: "Satellite",
          items: [
            {
              title: "Satellite Image Analysis",
              desc: "Detect changes and patterns from satellite data.",
              icon: "Satellite",
            },
            {
              title: "Aerial Imagery Analysis",
              desc: "Extract insights from drone and aerial imagery.",
              icon: "Video",
            },
            {
              title: "Remote Sensing Solutions",
              desc: "Monitor environmental and operational conditions.",
              icon: "Globe",
            },
          ],
          stack: ["Satellite", "Drone", "Remote Sensing"],
        },
        {
          title: "Geospatial AI",
          icon: "Sparkles",
          items: [
            {
              title: "Custom Geospatial Models",
              desc: "Build AI models tailored to spatial data.",
              icon: "Sparkles",
            },
            {
              title: "Feature Extraction",
              desc: "Automatically identify objects and features in imagery.",
              icon: "Target",
            },
            {
              title: "Geospatial Foundation Models",
              desc: "Large-scale AI models for geospatial applications.",
              icon: "Blocks",
            },
          ],
          stack: ["PyTorch", "TensorFlow"],
        },
        {
          title: "GIS Platforms & Data Services",
          icon: "Database",
          items: [
            {
              title: "GIS Platforms",
              desc: "Enterprise geospatial information systems.",
              icon: "Map",
            },
            {
              title: "Visualization Dashboards",
              desc: "Interactive geospatial dashboards and reporting.",
              icon: "Blocks",
            },
            {
              title: "Geospatial Data Annotation",
              desc: "Label and prepare spatial datasets for AI.",
              icon: "ScanLine",
            },
            {
              title: "Data Management",
              desc: "Organize and govern geospatial data assets.",
              icon: "Database",
            },
          ],
          stack: ["GIS", "Dashboards", "Annotation"],
        },
      ],
    },
    approach: {
      label: "Our approach",
      title: "From Geospatial Data to Real-World Intelligence",
      subtitle:
        "Transforming location-based data and satellite imagery into actionable spatial insights.",
      body: "We help organizations combine geographic information systems (GIS), geospatial AI, remote sensing, and satellite analytics to monitor changes, understand spatial patterns, assess risks, and support data-driven planning and decision-making.",
      steps: [
        {
          title: "Discover",
          desc: "Define business objectives, geographic areas of interest, analytical requirements, and the spatial questions that need to be answered.",
          icon: Search,
        },
        {
          title: "Acquire & Integrate",
          desc: "Collect and integrate satellite imagery, aerial imagery, GIS datasets, location data, and other relevant geospatial information.",
          icon: Satellite,
        },
        {
          title: "Process & Analyze",
          desc: "Prepare spatial datasets, process imagery, apply geospatial analytics and AI models, and identify patterns, features, and changes across geographic areas.",
          icon: LineChart,
        },
        {
          title: "Visualize & Validate",
          desc: "Present findings through interactive maps, spatial dashboards, and analytical outputs while validating results against available reference data and ground observations.",
          icon: Map,
        },
        {
          title: "Monitor & Optimize",
          desc: "Track spatial changes over time, refine analytical models, update geospatial datasets, and deliver recurring insights to support ongoing operational and strategic decisions.",
          icon: TrendingUp,
        },
      ],
    },
  },
};

/* -------------------------------------------------------------------------- *
 * Default practice page
 *
 * Every service detail page is drawn with the same shape as AI & Automation:
 * an Overview, Capabilities in depth, Our Approach, an Outcomes tower, Selected
 * Work and Industries We Serve. Rather than hand-write that for all sixteen
 * practices, `defaultServiceOverride` derives the full section set from the
 * service's own CMS entry (its summary and four sub-services), and any explicit
 * entry in `SERVICE_OVERRIDES` is merged on top — so a practice keeps whatever
 * bespoke copy it defines and inherits the rest. The derived copy is intended
 * as a starting point to be refined per practice.
 * -------------------------------------------------------------------------- */

/** Column glyphs for the four capability groups (names resolved by the section). */
const DEFAULT_GROUP_ICONS: DepthGroup["icon"][] = [
  "Cpu",
  "Workflow",
  "FileText",
  "Settings2",
];

/** Rotating glyphs for the items within each capability column. */
const DEFAULT_ITEM_ICONS: DepthItem["icon"][] = [
  "Network",
  "Sparkles",
  "GitBranch",
  "Blocks",
  "Search",
  "ShieldCheck",
  "Cog",
  "BarChart3",
];

/** The generic five-step delivery process, shared by every practice. */
const DEFAULT_APPROACH: ApproachStep[] = [
  {
    title: "Analyze",
    desc: "Understand business challenges, user needs and existing processes, and identify opportunities where this practice can deliver measurable value.",
    icon: Search,
  },
  {
    title: "Design",
    desc: "Define the approach, select the right technologies, design the architecture and integrations, and establish security, governance and success criteria.",
    icon: Layers,
  },
  {
    title: "Build",
    desc: "Develop the solution and connect it with enterprise data, APIs and existing business processes.",
    icon: Code2,
  },
  {
    title: "Deploy",
    desc: "Test accuracy, reliability, performance and security, then deploy into production with the appropriate controls.",
    icon: UploadCloud,
  },
  {
    title: "Optimize",
    desc: "Monitor performance, usage, cost and business impact, then continuously improve and scale what works.",
    icon: TrendingUp,
  },
];

/** The generic outcomes tower, shared by every practice. */
const DEFAULT_OUTCOMES: SequenceStep[] = [
  {
    label: "Efficiency",
    icon: Gauge,
    desc: "Streamline operations and remove manual work.",
  },
  {
    label: "Insight",
    icon: Lightbulb,
    desc: "Turn data into actionable business insight.",
  },
  {
    label: "Knowledge",
    icon: FileSearch,
    desc: "Unlock knowledge across your organization.",
  },
  {
    label: "Optimization",
    icon: TrendingUp,
    desc: "Improve operations and maximize value.",
  },
  {
    label: "Innovation",
    icon: Sparkles,
    desc: "Create new digital capabilities and opportunities.",
  },
  {
    label: "Governance",
    icon: ShieldCheck,
    desc: "Ensure responsible, secure and scalable adoption.",
  },
];

/** Capitalize the first letter of a sub-service phrase. */
const capitalize = (s: string) =>
  s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/**
 * The full, AI-&-Automation-style section set for a practice, derived from its
 * CMS entry. Each of the four sub-services becomes a capability column whose
 * items are the comma-separated phrases of its description.
 */
function defaultServiceOverride(service: Service): ServiceOverride {
  const groups: DepthGroup[] = service.subs.map((sub, g) => ({
    title: sub.title,
    icon: DEFAULT_GROUP_ICONS[g % DEFAULT_GROUP_ICONS.length],
    tagline: sub.desc,
    blurb: sub.desc,
    items: sub.desc
      .split(/,\s*/)
      .filter(Boolean)
      .map((phrase, i) => ({
        title: capitalize(phrase.trim()),
        desc: "",
        icon: DEFAULT_ITEM_ICONS[(g * 4 + i) % DEFAULT_ITEM_ICONS.length],
      })),
    stack: [],
  }));

  return {
    hideHeroActions: true,
    expertiseWhiteBg: true,
    expertiseLabel: "Overview",
    expertiseTitle: <>{service.title}</>,
    expertiseBody: service.summary,
    capabilities: {
      label: "Capabilities in depth",
      title: (
        <>
          Four Capabilities. <br />
          <span className="">One connected practice.</span>
        </>
      ),
      body: "Each capability is a complete practice with its own methods, stack and delivery patterns proven in production for enterprise clients.",
      groups,
    },
    approach: {
      label: "Our approach",
      title: "Our Approach",
      subtitle: "From opportunity to production.",
      body: "We work closely with you at every step — from identifying opportunities to building, deploying and continuously improving solutions that create measurable value.",
      steps: DEFAULT_APPROACH,
    },
    sequence: {
      label: "Outcomes",
      title: (
        <>
          Measurable Results. <span className="">Long-Term Value.</span>
        </>
      ),
      body: (
        <>
          <p>
            This practice delivers tangible business outcomes that go beyond
            efficiency — reducing{" "}
            <strong className="font-semibold text-ink">manual work</strong>,{" "}
            <strong className="font-semibold text-ink">
              improving decision-making
            </strong>
            , and giving organizations the agility to operate smarter and scale
            responsibly.
          </p>
          <p>
            Each initiative is designed to enhance operational performance,{" "}
            <strong className="font-semibold text-ink">
              create new digital capabilities
            </strong>
            , and build a foundation for sustainable growth.
          </p>
        </>
      ),
      steps: DEFAULT_OUTCOMES,
    },
    work: {
      label: "Selected Work",
      title: (
        <>
          Real Solutions. <br /> <span className="">Measurable Impact.</span>
        </>
      ),
      body: "Platforms we've designed, engineered and run through this practice that solve real business challenges.",
      more: { label: "View All Work", href: "/case-studies" },
    },
    industries: {
      label: "Industries We Serve",
      title: (
        <>
          Transforming Industries
          <br />
          with <span className="">{service.title}</span>
        </>
      ),
      body: "We apply this expertise across industries to solve complex operational challenges, improve decision-making, and create scalable digital experiences.",
      hideProof: true,
    },
  };
}

/**
 * `true`, and it has to be.
 *
 * With `false`, Next serves only the paths that existed at build time and
 * answers anything else with a 404 it will not even attempt to render. That is
 * right for a fixed set of routes and wrong for a CMS in two ways: a case study
 * published in the panel would 404 until the next deploy, and — less obviously
 * — revalidating the cache tag that `generateStaticParams` itself reads
 * invalidates the prerendered list, after which every existing path 404s too.
 *
 * With `true`, a path not in the build-time list is rendered on demand and
 * cached. A slug that genuinely does not exist still 404s, via the `notFound()`
 * below, which is the check that should be making that decision anyway.
 */
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const services = await getServices();
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const found = await getService((await params).slug);
  if (!found) return {};
  return {
    /* The root layout's template appends the company name; see the note on
       the industry page. */
    title: found.service.title,
    description: found.service.summary,
  };
}

/**
 * A practice, drawn like an industry page:
 *
 *   hero → expertise (with what's included) → governance → selected work →
 *   industries served
 *
 * The copy is the practice's CMS entry; the work and industry links come from
 * `relations.ts`, read off the case study briefs. Sections with nothing to
 * show are omitted.
 */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [chrome, found, workIndex, allIndustries] = await Promise.all([
    getChrome(),
    getService(slug),
    getWorkIndex(),
    getIndustries(),
  ]);

  if (!found) notFound();

  const service = found.service;
  /* Every practice is drawn with the AI-&-Automation section set, derived from
     its own CMS entry; a hand-written entry in SERVICE_OVERRIDES is merged on
     top, so explicit copy wins and the rest is inherited. */
  const override: ServiceOverride = {
    ...defaultServiceOverride(service),
    ...SERVICE_OVERRIDES[slug],
  };

  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 4);

  const industries = industriesForService(
    allIndustries,
    found.caseStudySlugs,
    workIndex.industriesByProject,
  );

  /* The sub-services, with their descriptions replaced where the page overrides
     them; titles and order stay as the CMS entry defines. */
  const subs = override?.subDescs
    ? service.subs.map((sub) => ({
        ...sub,
        desc: override.subDescs?.[sub.title] ?? sub.desc,
      }))
    : service.subs;

  const workCount = allWork.length;
  const industryCount = industries.length;

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        {/* ------------------------------------------------------ Hero ----
            The same hero as the industry pages. */}
        <DetailHero
          image={SERVICE_IMAGES[service.slug] ?? FALLBACK_PHOTO}
          eyebrow={`Service ${service.phase}`}
          title={service.title}
          body={override?.heroBody ?? service.summary}
          actions={
            override?.hideHeroActions ? undefined : (
              <>
                <Button href="/contact" variant="accent" size="md" arrow>
                  Discuss your project
                </Button>
                <Button href="/#capabilities" variant="outline" size="md">
                  All services
                </Button>
              </>
            )
          }
        />

        {/* ------------------------------------------------- Expertise ----
            Laid out like the industry page's: the statement on the left,
            built from what the CMS knows about the practice, and the services
            it covers as an open list on the right — a line each, ruled off
            from the next, no boxes. */}
        <section
          className={`relative overflow-hidden border-b border-line ${
            override?.expertiseWhiteBg ? "bg-paper" : "bg-paper-deep"
          }`}
        >
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    {override?.expertiseLabel ?? "Expertise"}
                  </span>
                </div>
                <h2 className="mt-6 text-h3 text-ink">
                  {override?.expertiseTitle ?? <>{service.title} Expertise</>}
                </h2>
                <p className="mt-6 text-[16px] leading-[1.9] text-ink-500 lg:text-[17px]">
                  {override?.expertiseBody ?? (
                    <>
                      {workCount > 0 && (
                        <>
                          <strong className="font-semibold text-ink">
                            {workCount} published{" "}
                            {workCount === 1 ? "case study" : "case studies"}
                          </strong>
                          {industryCount > 0 && (
                            <>
                              {" across "}
                              <strong className="font-semibold text-ink">
                                {industryCount}{" "}
                                {industryCount === 1
                                  ? "industry"
                                  : "industries"}
                              </strong>
                            </>
                          )}
                          {" — "}
                        </>
                      )}
                      {workCount > 0 ? "a " : "A "}
                      <strong className="font-semibold text-ink">
                        {service.phase}
                      </strong>{" "}
                      practice within{" "}
                      <strong className="font-semibold text-ink">
                        {HOUSE_LABEL[service.group]}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>

              {/* The right column: where a practice defines outcomes, it leads
                  with the outcomes tower (glass plates + glyphs); otherwise it
                  falls back to the "What we do" list of sub-services. */}
              {override?.sequence ? (
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
                    Outcomes
                  </p>
                  <ol className="relative mt-6 grid w-full gap-x-3 gap-y-3 sm:grid-cols-2 [perspective:1100px]">
                    {override.sequence.steps.map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <li key={step.label}>
                          <Wipe delay={i * 0.06} bleed className="-mx-2 px-2">
                            <div className="flex items-center gap-2 sm:gap-2">
                              {/* Glass plate with the upright glyph over it. */}
                              <div className="relative h-10 w-10 flex-none sm:w-[50px]">
                                <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-600 text-white shadow-[0_10px_18px_-10px_rgba(245,159,19,0.9)]">
                                  <Icon size={20} strokeWidth={1.9} />
                                </span>
                              </div>

                              {/* Connector. */}
                              <span
                                aria-hidden
                                className="hidden h-px flex-none bg-gradient-to-r from-amber/50 to-transparent sm:block sm:w-6"
                              />
                              <span
                                aria-hidden
                                className="hidden h-1 w-1 flex-none rounded-full bg-amber sm:block"
                              />

                              {/* Label + description. */}
                              <div className="relative min-w-0 flex-1 px-4 py-2.5 after:absolute after:inset-x-0 after:-bottom-[5.5px] after:h-px after:bg-line/80 after:content-['']">
                                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                                  {step.label}
                                </h3>
                                {step.desc && (
                                  <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-500">
                                    {step.desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Wipe>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ) : (
                subs.length > 0 && (
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
                      What we do
                    </p>
                    {override?.whatWeDoBody && (
                      <p className="mt-4 text-[15px] leading-[1.9] text-ink-500 lg:text-[16px]">
                        {override.whatWeDoBody}
                      </p>
                    )}
                    <ul className="mt-6 grid border-t border-line-strong sm:grid-cols-1 sm:gap-x-10">
                      {subs.map((sub, i) => {
                        const Icon = override?.subIcons?.[sub.title];
                        return (
                          <li key={sub.title} className="border-b border-line">
                            <Wipe delay={(i % 2) * 0.05}>
                              <div className="flex gap-4 py-5">
                                {Icon ? (
                                  <Icon
                                    aria-hidden
                                    size={22}
                                    strokeWidth={1.6}
                                    className="mt-[2px] flex-none text-amber"
                                  />
                                ) : (
                                  <span
                                    aria-hidden
                                    className="mt-[3px] w-[22px] flex-none font-mono text-[12px] font-semibold tracking-[0.04em] text-azure"
                                  >
                                    {String(i + 1).padStart(2, "0")}
                                  </span>
                                )}
                                <div>
                                  <h3 className="text-[15.5px] font-medium leading-snug tracking-[-0.01em] text-ink">
                                    {sub.title}
                                  </h3>
                                  <p className="mt-1.5 text-[13.5px] leading-[1.6] text-ink-500 first-letter:uppercase">
                                    {sub.desc}
                                  </p>
                                </div>
                              </div>
                            </Wipe>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
              )}
            </div>
          </Container>
        </section>

        {/* ------------------------------------- Compliance & governance ---- */}
        {/* <Governance /> */}
        {/* ------------------------------------- Capabilities in depth ---- */}
        {override?.capabilities && (
          <CapabilitiesDepth
            id="service-capabilities"
            label={override.capabilities.label}
            title={override.capabilities.title}
            body={override.capabilities.body}
            groups={override.capabilities.groups}
          />
        )}
        {/* ------------------------------------------- Our approach ---- */}
        {override?.approach && (
          <ApproachSteps
            id="service-approach"
            label={override.approach.label}
            title={override.approach.title}
            subtitle={override.approach.subtitle}
            body={override.approach.body}
            steps={override.approach.steps}
          />
        )}

        {/* ------------------------------------------- Selected work ---- */}
        <WorkTiles
          id="service-work"
          ground="azure"
          label={override?.work?.label}
          title={override?.work?.title ?? "Selected Work"}
          body={
            override?.work?.body ??
            (workCount > work.length
              ? `Platforms we've designed, engineered and run through this practice — ${work.length} of the ${workCount} in our portfolio.`
              : "Platforms we've designed, engineered and run through this practice.")
          }
          more={override?.work?.more}
          projects={work}
        />

        {/* --------------------------------------------- Industries ---- */}
        <ServiceIndustries
          id="service-industries"
          industries={industries}
          label={override?.industries?.label}
          title={override?.industries?.title}
          body={override?.industries?.body}
          hideProof={override?.industries?.hideProof}
        />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}
