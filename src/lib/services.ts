/**
 * The 16 service lines, verbatim from the Funavry Capability Statement:
 * ten Technology & Engineering practices, six Global Business Services.
 * Each carries its four sub-services. Do not invent entries here.
 */

export type Service = {
  n: string;
  title: string;
  /** Which side of the business this belongs to. */
  group: "tech" | "gbs";
  /** Which phase of Build → Automate → Operate it mostly lives in. */
  phase: "Build" | "Automate" | "Operate";
  /** lucide-react icon name, resolved by the section. */
  icon: string;
  summary: string;
  subs: { title: string; desc: string }[];
};

export const SERVICES: Service[] = [
  /* ----------------------- Technology & Engineering ---------------------- */
  {
    n: "01",
    title: "Artificial Intelligence & Automation",
    group: "tech",
    phase: "Automate",
    icon: "BrainCircuit",
    summary:
      "Design, build, deploy, and manage AI systems that automate work, augment decision-making, and create new digital capabilities.",
    subs: [
      { title: "AI Solutions & Applications", desc: "Agentic AI, AI agents as a service, enterprise assistants, generative AI applications" },
      { title: "Intelligent Automation", desc: "Workflow automation, business process automation, decision intelligence" },
      { title: "Document & Knowledge Intelligence", desc: "Document processing, OCR & data extraction, knowledge management, RAG" },
      { title: "AI Engineering & Operations", desc: "MLOps & LLMOps, model evaluation, prompt optimization, AI governance" },
    ],
  },
  {
    n: "02",
    title: "Digital Engineering & Product Development",
    group: "tech",
    phase: "Build",
    icon: "LayoutGrid",
    summary:
      "Build modern digital products, platforms, and business applications that drive growth and efficiency.",
    subs: [
      { title: "Product Engineering", desc: "Custom software development, SaaS platforms, enterprise applications" },
      { title: "Web & Mobile Solutions", desc: "Responsive web apps, native and cross-platform mobile, progressive web apps" },
      { title: "Experience Design", desc: "UI/UX design, product discovery, design systems" },
      { title: "Systems Integration & Modernization", desc: "API development, legacy modernization, enterprise integrations" },
    ],
  },
  {
    n: "03",
    title: "Blockchain & FinTech",
    group: "tech",
    phase: "Build",
    icon: "Blocks",
    summary:
      "Build secure digital asset ecosystems, decentralized applications, and modern financial platforms.",
    subs: [
      { title: "Blockchain Platforms", desc: "L1/L2 development, blockchain infrastructure, protocol engineering" },
      { title: "Web3 & Decentralized Apps", desc: "dApp development, wallet integration, Web3 solutions" },
      { title: "Digital Assets & Tokenization", desc: "Asset tokenization, digital asset platforms, NFT solutions" },
      { title: "FinTech Solutions", desc: "Digital payments, banking platforms, trading systems, DeFi" },
    ],
  },
  {
    n: "04",
    title: "Immersive Technologies",
    group: "tech",
    phase: "Build",
    icon: "Glasses",
    summary:
      "Create immersive digital experiences that blend physical and virtual environments.",
    subs: [
      { title: "Extended Reality (XR)", desc: "Augmented reality, virtual reality, mixed reality" },
      { title: "Gaming & Interactive", desc: "Game development, gamification, interactive applications" },
      { title: "Digital Worlds & Metaverse", desc: "Metaverse platforms, virtual commerce, digital communities" },
      { title: "Simulation & Training", desc: "Training simulators, industrial simulations, educational experiences" },
    ],
  },
  {
    n: "05",
    title: "Robotics, IoT & Computer Vision",
    group: "tech",
    phase: "Build",
    icon: "Cpu",
    summary:
      "Connect physical assets with intelligent systems to automate operations and generate real-time insights.",
    subs: [
      { title: "Computer Vision & Video Analytics", desc: "Object detection, visual inspection, video analytics, recognition systems" },
      { title: "Industrial IoT & Connected Systems", desc: "Industrial IoT, connected devices, asset monitoring, predictive maintenance" },
      { title: "Robotics & Edge Intelligence", desc: "Robotics solutions, autonomous systems, edge AI, embedded intelligence" },
      { title: "Digital Twins & Smart Infrastructure", desc: "Digital twins, smart infrastructure, infrastructure analytics" },
    ],
  },
  {
    n: "06",
    title: "GIS, Geospatial AI & Satellite Analytics",
    group: "tech",
    phase: "Build",
    icon: "Satellite",
    summary:
      "Transform location-based data into actionable intelligence for planning, monitoring, and decision-making.",
    subs: [
      { title: "Geospatial Analytics", desc: "Spatial analysis, location intelligence, mapping solutions" },
      { title: "Satellite & Remote Sensing", desc: "Satellite image analysis, aerial imagery, remote sensing" },
      { title: "Geospatial AI", desc: "Custom geospatial models, feature extraction, foundation models" },
      { title: "GIS Platforms & Data Services", desc: "GIS platforms, visualization dashboards, data annotation" },
    ],
  },
  {
    n: "07",
    title: "Data & Business Intelligence",
    group: "tech",
    phase: "Build",
    icon: "BarChart3",
    summary:
      "Transform raw data into trusted insights, operational intelligence, and strategic decision-making.",
    subs: [
      { title: "Data Engineering", desc: "Data pipelines, lakes & warehouses, data integration" },
      { title: "Analytics & Business Intelligence", desc: "BI reporting, dashboard development, performance analytics" },
      { title: "Real-Time Data Platforms", desc: "Event streaming, real-time analytics, operational intelligence" },
      { title: "Data Strategy & Governance", desc: "Data governance, quality management, master data management" },
    ],
  },
  {
    n: "08",
    title: "Cloud, DevOps & Cybersecurity",
    group: "tech",
    phase: "Operate",
    icon: "ShieldCheck",
    summary: "Build secure, scalable, and resilient technology platforms.",
    subs: [
      { title: "Cloud Infrastructure", desc: "Cloud architecture, migration, infrastructure management" },
      { title: "DevOps & Platform Engineering", desc: "CI/CD pipelines, infrastructure as code, platform engineering" },
      { title: "Observability & Reliability", desc: "Monitoring & logging, incident management, site reliability engineering" },
      { title: "Cybersecurity & Compliance", desc: "Security assessments, IAM, security operations, compliance" },
    ],
  },
  {
    n: "09",
    title: "Quality Engineering & Audits",
    group: "tech",
    phase: "Build",
    icon: "BadgeCheck",
    summary:
      "Ensure software, AI systems, and infrastructure meet the highest standards of quality, performance, and security.",
    subs: [
      { title: "Software Quality Assurance", desc: "Manual, functional, and regression testing" },
      { title: "Test Automation", desc: "Automated testing, continuous testing, API testing" },
      { title: "Performance & Reliability Testing", desc: "Load testing, stress testing, scalability testing" },
      { title: "Security & AI Audits", desc: "Penetration testing, security audits, AI evaluation, model risk" },
    ],
  },
  {
    n: "10",
    title: "Managed Services",
    group: "tech",
    phase: "Operate",
    icon: "Server",
    summary:
      "Ongoing operational support, monitoring, optimization, and management of business-critical technology systems.",
    subs: [
      { title: "Managed Infrastructure", desc: "Cloud operations, infrastructure support, backup & disaster recovery" },
      { title: "Managed Applications", desc: "Application support, release management, performance optimization" },
      { title: "Managed Data & AI", desc: "Data platform operations, AIOps/MLOps, model monitoring" },
      { title: "Managed Security", desc: "Security monitoring, threat detection, incident response" },
    ],
  },

  /* -------------------- Global Business Services (GBS) ------------------- */
  {
    n: "11",
    title: "Global Business Services & Operating Model Transformation",
    group: "gbs",
    phase: "Operate",
    icon: "Network",
    summary:
      "Design and transform end-to-end GBS and Shared Services operating models that improve efficiency, control, and scalability.",
    subs: [
      { title: "GBS Strategy & Operating Model Design", desc: "Enterprise GBS strategy, target operating models, service delivery design" },
      { title: "Shared Services Design & Transformation", desc: "Service consolidation, transition management, multi-function centers" },
      { title: "Governance & Performance Management", desc: "Service catalogs, SLA & KPI frameworks, governance models" },
      { title: "Operational Excellence & Optimization", desc: "Process standardization, maturity assessments, continuous improvement" },
    ],
  },
  {
    n: "12",
    title: "Global Capability Center (GCC) Advisory",
    group: "gbs",
    phase: "Operate",
    icon: "Building2",
    summary:
      "Design, establish, and scale owned global capability centers as strategic assets for capability building and cost competitiveness.",
    subs: [
      { title: "GCC Strategy & Business Case", desc: "Strategy design, business case development, capability roadmaps" },
      { title: "Location & Market Entry Advisory", desc: "Location assessment, market entry, regulatory advisory, risk assessment" },
      { title: "GCC Setup & Transition", desc: "Entity setup, transition planning, knowledge transfer, operational readiness" },
      { title: "Governance & Scale-Up", desc: "Governance frameworks, PMO services, hypercare, expansion planning" },
    ],
  },
  {
    n: "13",
    title: "Finance Transformation & Managed Services",
    group: "gbs",
    phase: "Operate",
    icon: "Calculator",
    summary:
      "Modernize finance operations to improve efficiency, compliance, control, and decision-making.",
    subs: [
      { title: "Record-to-Report (R2R)", desc: "General ledger, financial close & consolidation, statutory reporting" },
      { title: "Procure-to-Pay (P2P)", desc: "Procurement operations, invoice processing, vendor & payment management" },
      { title: "Order-to-Cash (O2C)", desc: "Billing & invoicing, receivables, collections, revenue reconciliation" },
      { title: "Planning, Analytics & Governance", desc: "FP&A, budgeting & forecasting, financial controls, management reporting" },
    ],
  },
  {
    n: "14",
    title: "AI-Powered Process Transformation",
    group: "gbs",
    phase: "Automate",
    icon: "Bot",
    summary:
      "Unlock productivity, intelligence, and automation through AI-driven process redesign across enterprise operations.",
    subs: [
      { title: "AI Strategy & Readiness", desc: "Readiness assessments, maturity evaluation, opportunity identification" },
      { title: "Intelligent Automation", desc: "Workflow automation, RPA, process automation, hyperautomation" },
      { title: "AI Agents & Digital Workforce", desc: "Agent design & deployment, digital workforce, agent governance" },
      { title: "Process Mining & Optimization", desc: "Process discovery, process mining, bottleneck analysis, redesign" },
    ],
  },
  {
    n: "15",
    title: "Business Process Excellence",
    group: "gbs",
    phase: "Operate",
    icon: "GitBranch",
    summary:
      "Build lean, standardized, continuously improving operations through harmonization, performance management, and governance.",
    subs: [
      { title: "Process Mapping & Harmonization", desc: "Process mapping, documentation, SOPs, global harmonization" },
      { title: "Lean Transformation", desc: "Lean programs, continuous improvement, value stream optimization" },
      { title: "KPI & Performance Management", desc: "KPI frameworks, operational metrics, performance monitoring" },
      { title: "Service Governance & Excellence", desc: "Governance models, quality frameworks, compliance, audit readiness" },
    ],
  },
  {
    n: "16",
    title: "Global Workforce & Capability Solutions",
    group: "gbs",
    phase: "Operate",
    icon: "Users",
    summary:
      "Access and operate dedicated global teams through a fully managed workforce model — without a legal entity or captive setup.",
    subs: [
      { title: "Employer of Record (EOR)", desc: "Employment management, payroll, benefits, employment compliance" },
      { title: "Dedicated Team Setup & Management", desc: "Team setup, operations management, workforce scaling, augmentation" },
      { title: "Build-Operate-Transfer (BOT)", desc: "BOT strategy, team establishment, operational management, transfer" },
      { title: "Learning & Capability Development", desc: "Talent acquisition, onboarding, L&D programs, performance development" },
    ],
  },
];
