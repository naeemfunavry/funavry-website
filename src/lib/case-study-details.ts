/**
 * Per-project detail pages for /case-studies/[slug].
 *
 * Content source of truth: `Funavry_Portfolio_Page_Content_MASTER_1.pdf`
 * (Portfolio Page Content Briefs, sections 7.1–7.29). Every stat, technology,
 * client name, and result below comes from that document nothing here is
 * invented for the site. Where the brief marks a technology or metric as
 * "not specified / confirm with delivery team", the row is simply omitted
 * rather than filled with a guess.
 *
 * Screenshots are referenced by public path (not static import) so they can be
 * swapped by replacing the file or editing the path no layout or code change
 * needed. An empty `screenshots` array renders placeholder frames in the same
 * grid, ready to take real captures later.
 */

export type DetailStat = { value: string; label: string };
export type DetailMeta = { label: string; value: string };
export type DetailChallenge = {
  title: string;
  challenge: string;
  solution: string;
};
export type DetailScreenshot = {
  src: string;
  alt: string;
  /** How a fixed 16:10 tile shows the capture. `cover` (default) fills the
      tile from the top — right for wide dashboards. `contain` shows it whole —
      for phone screens and very tall page captures, which a 16:10 crop would
      reduce to a sliver. */
  fit?: "cover" | "contain";
};

export type CaseStudyDetail = {
  slug: string;
  /** The brief's own H1. */
  title: string;
  /** The brief's italic subtitle. */
  tagline: string;
  sector: string;
  phase: "Build" | "Automate" | "Operate";
  /** The brief's lede paragraph runs under the hero title. */
  summary: string;
  /** The brief's three-chip stat strip. */
  stats: DetailStat[];
  /** Project Meta table, confirmed rows only. */
  meta: DetailMeta[];
  introHeading: string;
  intro: string[];
  challengesLead: string;
  challenges: DetailChallenge[];
  resultsLead: string;
  results: string[];
  screenshots: DetailScreenshot[];
};

const shots = (
  folder: string,
  files: [file: string, alt: string, fit?: DetailScreenshot["fit"]][],
): DetailScreenshot[] =>
  files.map(([file, alt, fit]) => ({
    src: `/case-studies/optimized/${folder}/${file}`,
    alt,
    fit,
  }));

export const CASE_STUDY_DETAILS: CaseStudyDetail[] = [
  /* ------------------------------------------------------------- 7.1 */
  {
    slug: "integrated-healthcare-platform",
    title: "Integrated Healthcare Practice & Clinical Management Platform",
    tagline:
      "A unified platform for practice administration, clinical care & revenue cycle management",
    sector: "Healthcare & Life Sciences",
    phase: "Build",
    summary:
      "Multi-location healthcare organizations often run practice administration, clinical documentation, prescribing, and billing on fragmented, disconnected systems. This drives administrative overhead, limits scalability, and creates gaps in continuity of care and compliance. Funavry built a single, cloud-based, standards-aligned platform to bring the entire patient journey under one roof.",
    stats: [
      { value: "10", label: "Facilities · North America" },
      { value: "End-to-End", label: "Practice · EHR · RCM" },
      { value: "HIPAA · HL7", label: "eRx + 2FA · Standards-Aligned" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Healthcare & Life Sciences · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Enterprise Web Application Development · Practice Management & RCM Platform",
      },
      {
        label: "Standards & Compliance",
        value:
          "HIPAA · HL7 · ICD/CPT Coding · DEA / SureScripts (controlled e-prescribing)",
      },
      { label: "Client", value: "United States · 30+ Engineers" },
    ],
    introHeading: "What is this platform?",
    intro: [
      "Funavry designed and delivered a comprehensive, cloud-based platform that unifies practice administration, clinical care, and revenue cycle operations for multi-location healthcare organizations. By managing the complete patient journey within a single, configurable, standards-aligned system, it reduces administrative overhead and improves continuity of care.",
      "The client needed a stronger digital foundation to support multiple practices and locations, reduce manual and error-prone billing workflows, and remain aligned with healthcare regulatory and interoperability requirements as the organization scaled.",
    ],
    challengesLead:
      "Identifying the platform's operational challenges and solving them with a secure, standards-aligned healthcare system.",
    challenges: [
      {
        title: "Fragmented Practice & Patient Data",
        challenge:
          "Patient registration, demographics, and case data injuries, treatments, conditions, insurance, attorney, employer, responsible party were scattered across multiple practices, locations, and departments.",
        solution:
          "Centralized Practice & Patient Administration that manages all practices, locations, departments, and provider assignments with comprehensive, unified patient case management.",
      },
      {
        title: "Rigid, Hard-Coded Workflows",
        challenge:
          "Specialties, case types, visit types, insurance rules, and billing codes required code changes and new deployments to update, slowing operational agility.",
        solution:
          "Configurable Master Data architecture that lets specialties, case types, visit types, insurance, and billing codes be set up and adjusted system-wide no code changes or redeployment needed.",
      },
      {
        title: "Disconnected Clinical Documentation & Billing",
        challenge:
          "Scheduling, clinical notes, and billing codes lived in separate systems, creating rework and increasing the risk of billing errors.",
        solution:
          "Integrated Clinical Workflows (EHR) that connect provider availability and appointment scheduling directly to structured clinical encounters capturing provider notes, ICD diagnosis codes, CPT procedure codes, and specialty-specific forms for both care delivery and accurate billing.",
      },
      {
        title: "Manual, Non-Compliant Prescribing",
        challenge:
          "Paper-based or loosely controlled prescribing processes carried compliance risk and offered no built-in safeguards against drug interactions or unauthorized access.",
        solution:
          "Electronic Prescribing (eRx) with direct, paperless routing to pharmacies, drug-interaction alerts, and provider two-factor authentication following identity proofing aligned to DEA/SureScripts requirements for controlled substances.",
      },
      {
        title: "Slow, Fragmented Revenue Cycle",
        challenge:
          "Billing across insurance carriers, attorneys, employers, and self-pay patients was handled inconsistently, delaying reimbursement and creating reconciliation gaps.",
        solution:
          "End-to-end Revenue Cycle Management (RCM) covering payment posting, eligibility verification, Explanation of Reimbursement (EOR) review, and denial management maximizing reimbursement and revenue capture.",
      },
    ],
    resultsLead:
      "The outcomes the healthcare organization achieved after consolidating practice, clinical, and billing operations onto one platform.",
    results: [
      "Achieved full alignment with HIPAA, HL7, ICD/CPT coding, and DEA/SureScripts requirements for controlled electronic prescribing.",
      "Unified three previously separate functions practice administration, clinical care (EHR), and revenue cycle management into a single configurable system.",
      "Enabled centralized management of multiple practices, locations, departments, and providers from one platform.",
      "Reduced administrative overhead and improved continuity of care across the full patient journey.",
      "Gave the organization a standards-aligned foundation built to scale to additional practices and locations without re-architecture.",
    ],
    screenshots: shots("Integrated Healthcare Practice", [
      ["Practice Management Dashboard.png", "Practice management dashboard"],
      ["Partient Damographics.png", "Patient demographics and case management"],
      ["Master Data.png", "Configurable master data administration"],
      ["ERX.png", "Electronic prescribing (eRx) workflow"],
      ["Bill Creation.png", "Bill creation in the revenue cycle module"],
    ]),
  },

  /* ------------------------------------------------------------- 7.2 */
  {
    slug: "ai-medical-billing-automation",
    title: "AI-Powered Medical Billing & Insurance Automation",
    tagline:
      "Turning unstructured insurance documents into an automated, reconciled billing pipeline",
    sector: "Healthcare · FinTech",
    phase: "Automate",
    summary:
      "High-volume insurance billing and reconciliation is traditionally a slow, manual finance function staff re-key data from scanned carrier documents across hundreds of formats, then manually match it against agency management systems. Funavry built an AI-driven document-intelligence solution that automates the entire pipeline end to end, accelerating reimbursement and strengthening accuracy.",
    stats: [
      { value: "~99%", label: "Extraction Accuracy" },
      { value: "150+", label: "Insurance Carriers" },
      { value: "1,000+", label: "Document Formats" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Healthcare & Life Sciences · Financial Services & FinTech · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "AI / Document Intelligence · Process Automation · Enterprise Reconciliation Platform",
      },
      {
        label: "Scale",
        value:
          "150+ insurance carriers · 1,000+ document formats · parallelized, multi-processing pipeline",
      },
      { label: "Client", value: "United States · 7+ Engineers" },
    ],
    introHeading: "What does this platform do?",
    intro: [
      "Funavry built an AI-driven document-intelligence solution that automates high-volume insurance billing and reconciliation. It converts unstructured insurance documents into accurate, machine-readable records and reconciles them against agency management systems, turning a traditionally slow, manual finance function into a controlled, end-to-end workflow that accelerates reimbursement and strengthens accuracy.",
      "The client needed to process scanned documents from 150+ carriers in over 1,000 different formats a volume and variability that made manual, spreadsheet-driven processing unsustainable as the business scaled.",
    ],
    challengesLead:
      "Identifying the platform's operational challenges and solving them with AI-driven document intelligence and automated reconciliation.",
    challenges: [
      {
        title: "High-Volume, High-Variability Document Intake",
        challenge:
          "Scanned insurance documents arrived from 150+ carriers in more than 1,000 different formats, making manual data entry slow, inconsistent, and impossible to scale.",
        solution:
          "Automated ingestion pipeline using an enterprise-grade OCR and document-intelligence platform to process documents at scale across every carrier and format.",
      },
      {
        title: "Unstructured, Unclassified Documents",
        challenge:
          "Incoming documents weren't pre-sorted policies, denials, payments, and verifications were mixed together with no structured way to identify or route them.",
        solution:
          "An AI-powered classification engine that automatically identifies and categorizes each document type, then extracts and normalizes the data into standardized insurance records.",
      },
      {
        title: "Slow, Sequential Processing",
        challenge:
          "Processing documents one step at a time scan, read, classify, validate created a throughput bottleneck that couldn't keep pace with incoming volume.",
        solution:
          "A multi-processing architecture that runs image preprocessing, OCR, classification, extraction, and validation in parallel built for high throughput and horizontal scalability.",
      },
      {
        title: "Accuracy Risk in Fully Automated Extraction",
        challenge:
          "Fully automated extraction alone risked silent errors on edge cases and low-confidence reads, which is unacceptable in billing and financial reconciliation.",
        solution:
          "Confidence scoring with human-in-the-loop review validation rules route only exceptions to staff, improving accuracy while minimizing manual processing effort.",
      },
      {
        title: "Disconnected Reconciliation Against AMS360",
        challenge:
          "Even after data was extracted, matching carrier-statement transactions against the agency management system (AMS360) was a separate, manual reconciliation step prone to missed or duplicated entries.",
        solution:
          "An intelligent policy-matching engine that classifies carrier-statement transactions as exact, partial, or no match and guides users through exception handling delivering a complete direct-bill reconciliation pipeline from statement ingestion through commission reconciliation to final posting.",
      },
    ],
    resultsLead:
      "The outcomes achieved by replacing manual insurance billing and reconciliation with an AI-driven, end-to-end pipeline.",
    results: [
      "Automated document processing at scale across 150+ insurance carriers and 1,000+ distinct document formats.",
      "Replaced manual data entry with AI-powered classification and extraction, reducing processing time and human error.",
      "Achieved high-throughput processing via a parallelized multi-stage pipeline preprocessing, OCR, classification, extraction, validation.",
      "Reached approximately 99% extraction accuracy while minimizing manual effort through confidence-based, human-in-the-loop exception review.",
      "Delivered a complete direct-bill reconciliation pipeline against AMS360 from statement ingestion through commission reconciliation to final posting.",
    ],
    screenshots: shots("AI-Powered Medical Billing", [
      ["Screenshot 2026-06-30 180656.png", "Document classification dashboard"],
      [
        "Screenshot 2026-06-30 180934.png",
        "Human-in-the-loop verification of extracted insurance data",
      ],
      ["Screenshot 2026-06-30 181037.png", "Reconciliation view"],
    ]),
  },

  /* ------------------------------------------------------------- 7.3 */
  {
    slug: "normies",
    title: "Normies",
    tagline: "A self-custody banking & crypto super-app",
    sector: "FinTech",
    phase: "Build",
    summary:
      "Managing everyday banking and crypto typically means juggling multiple disconnected apps a bank, a brokerage, a crypto wallet each with its own login, its own view of your money, and its own friction. Funavry designed and developed Normies, a self-custody money app that brings both worlds into one consumer-friendly experience, keeping identity verification limited to only what's legally required for regulated fiat services.",
    stats: [
      { value: "Banking + Crypto", label: "Single App" },
      { value: "ACH · Wire · SWIFT", label: "Global Rails" },
      { value: "Self-Custody", label: "No Seed Phrase" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Financial Services & FinTech · Commerce, Retail & Digital Marketplaces",
      },
      {
        label: "Service",
        value:
          "Consumer FinTech App Development · Self-Custody Wallet & Digital Banking Platform",
      },
      {
        label: "Regulatory Scope",
        value:
          "Identity verification (KYC) required only for regulated fiat services bank rails, card issuance not for self-custody crypto holdings",
      },
      { label: "Client", value: "United States · 15+ Engineers" },
    ],
    introHeading: "What is Normies?",
    intro: [
      "Normies is a self-custody money application that brings everyday banking and crypto together in a single, consumer-friendly app removing the friction of juggling separate tools. Identity verification is required only for regulated fiat services such as bank rails and cards, keeping the crypto side of the app frictionless while staying compliant where it legally matters.",
      "The product needed to serve two very different user needs at once: the reliability and familiarity of traditional banking rails, and the ownership and flexibility of self-custody crypto without forcing users to choose between them or manage two separate apps.",
    ],
    challengesLead:
      "Identifying the product challenges in unifying banking and crypto, and solving them with a single, consumer-friendly app.",
    challenges: [
      {
        title: "Fragmented View of Money Across Tools",
        challenge:
          "Users typically track checking, savings, crypto, brokerages, and real-world assets across multiple disconnected apps, with no single view of their actual net worth.",
        solution:
          "Unified Accounts & Net Worth checking, savings, and crypto accounts in one app, with aggregation of external banks, brokerages, crypto wallets, and real-world assets such as real estate into a single, real-time net-worth view.",
      },
      {
        title: "Limited, Slow Money Movement",
        challenge:
          "Moving money domestically or internationally often requires separate banking apps, wire processes, or exchanges, each with its own delays and fees.",
        solution:
          "Global Banking Rails supporting local and international money movement through ACH, wires, and SWIFT, direct deposit, and pay-by-link requests, alongside stablecoin transfers.",
      },
      {
        title: "Opaque Card Fees & Limited Spending Control",
        challenge:
          "Traditional cards offer little transparency on fees and minimal control over how and where spending happens, especially for privacy-conscious or budget-conscious users.",
        solution:
          "Cards & Spending debit cards accepted anywhere with cashback rewards, unlimited per-merchant virtual cards for privacy, and transparent fees shown before confirmation.",
      },
      {
        title: "Crypto Self-Custody Is Intimidating for Mainstream Users",
        challenge:
          "Traditional self-custody requires managing seed phrases and understanding gas fees a barrier that keeps mainstream, non-crypto-native users away from true ownership of their assets.",
        solution:
          "Simplified Self-Custody with a no-seed-phrase onboarding experience and network (gas) fees abstracted and shown up front removing common crypto friction while keeping assets fully in the user's control.",
      },
      {
        title: "No Easy Way to Grow Idle Balances",
        challenge:
          "Cash and crypto sitting idle in most banking or wallet apps earns nothing, and accessing yield or trading typically requires yet another platform.",
        solution:
          "Yield & Trading built directly into the app auto-yield savings on stablecoins and crypto, instant trading, and access to tokenized real-world assets.",
      },
    ],
    resultsLead:
      "The capabilities Normies delivers by unifying banking and self-custody crypto in one consumer app.",
    results: [
      "Unified checking, savings, crypto, and external account aggregation into a single real-time net-worth view.",
      "Enabled local and international money movement through ACH, wire, SWIFT, direct deposit, pay-by-link, and stablecoin transfers.",
      "Delivered debit cards with cashback rewards and unlimited per-merchant virtual cards for spending privacy.",
      "Removed the traditional seed-phrase barrier to self-custody while keeping users in full control of their assets.",
      "Built in auto-yield savings, instant trading, and access to tokenized real-world assets all from one app.",
    ],
    /* The landscape composite leads (hero + index card); the phone captures
       fill the gallery. Alts describe what each screen actually shows. */
    screenshots: shots("Normies", [
      [
        "normies.jpg",
        "Normies mobile app home dashboard, onboarding and cards screens",
      ],
      [
        "Media (11).jpeg",
        "Home dashboard with net worth, accounts and virtual card",
        "contain",
      ],
      [
        "Media (2).jpeg",
        "Gifting a friend's first $5 in cash, crypto or savings",
        "contain",
      ],
    ]),
  },

  /* ------------------------------------------------------------- 7.4 */
  {
    slug: "ai-tax-assistant",
    title: "AI-Powered Tax Assistant",
    tagline: "Source-grounded Australian tax research, in conversation",
    sector: "FinTech",
    phase: "Automate",
    summary:
      "Researching Australian tax law traditionally means manually digging through statutes, rulings, and ATO guidance slow, easy to get wrong, and hard to keep current as rules change. Funavry built an AI-powered tax assistant for an Australian tax and compliance platform used by accountants, bookkeepers, and businesses, helping practitioners research and apply tax law through a conversational interface grounded in authoritative source material.",
    stats: [
      { value: "230K+", label: "Tax Documents" },
      { value: "RAG + Vector Search", label: "Azure AI Search" },
      { value: "Source-Grounded", label: "ATO-Cited Answers" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Financial Services & FinTech · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "AI / Retrieval-Augmented Generation Development · Conversational Research Interface",
      },
      {
        label: "Technologies",
        value: "Azure AI Search · LangChain powering the RAG pipeline",
      },
      {
        label: "Coverage",
        value:
          "230,000+ tax documents · semantic and vector search · regularly updated ATO data sources",
      },
      { label: "Client", value: "Australia · 6 Engineers" },
    ],
    introHeading: "What does the AI Tax Assistant do?",
    intro: [
      "The assistant helps practitioners research and apply Australian tax law through a conversational interface, surfacing precise, well-sourced answers from authoritative material rather than generic model knowledge including handling advanced scenarios such as Division 7A calculations and base-rate-entity determinations.",
      "The platform needed to make a massive, constantly evolving body of tax law fast to search and safe to rely on grounding every answer in real ATO sources rather than letting the model guess.",
    ],
    challengesLead:
      "Identifying the barriers to fast, reliable tax research and solving them with source-grounded retrieval.",
    challenges: [
      {
        title: "Complex Tax Scenarios Demand Deep Expertise",
        challenge:
          "Advanced scenarios Division 7A calculations, company tax and base-rate-entity determinations, tax distribution optimization are time-consuming and error-prone to work through manually.",
        solution:
          "Tax Guidance & Complex Calculations that helps users interpret tax rules and handles these advanced scenarios directly within the conversational interface.",
      },
      {
        title: "Relevant Guidance Is Buried in a Massive Corpus",
        challenge:
          "The relevant provisions, rulings, and guidance for any given question are scattered across a body of tax law far too large to search manually in a reasonable time.",
        solution:
          "A RAG pipeline built on Azure AI Search and LangChain, using semantic and vector search across 230,000+ tax documents to surface the most relevant material for each query.",
      },
      {
        title: "Research Is Disconnected From Filing Work",
        challenge:
          "Tax research typically happens in a separate tool from tax preparation and lodgement, breaking the practitioner's workflow.",
        solution:
          "Integration with tax compliance and lodgement systems, fitting the assistant directly into practitioners' existing preparation and submission workflows.",
      },
      {
        title: "Navigating Dense Legal Content Is Slow",
        challenge:
          "Tax-law content is dense and hard to navigate quickly, even once the right document is found.",
        solution:
          "An intuitive, purpose-built research interface that lets users quickly navigate complex tax-law content, significantly cutting time spent on manual research.",
      },
      {
        title: "Corpus and User Base Are Growing",
        challenge:
          "As the document corpus and number of concurrent users grow, performance and reliability become harder to sustain.",
        solution:
          "A scalable, cloud-based architecture that supports a growing document corpus and concurrent users while maintaining fast, reliable performance.",
      },
    ],
    resultsLead:
      "The capabilities delivered by grounding tax research in a large, continuously updated source corpus.",
    results: [
      "Built a RAG pipeline over 230,000+ tax documents using Azure AI Search and LangChain for semantic and vector search.",
      "Delivered source-grounded, ATO-cited answers rather than generic model output.",
      "Handled advanced scenarios such as Division 7A calculations and base-rate-entity determinations directly in conversation.",
      "Connected research directly to compliance and lodgement workflows for a seamless practitioner experience.",
      "Built on a scalable cloud architecture supporting a growing document corpus and concurrent users.",
    ],
    screenshots: shots("AI-Powered Tax Assistant", [
      ["1.png", "Tax Genii assistant with selectable ATO data sources"],
      ["2.png", "Conversational, step-by-step tax guidance with cited sources"],
    ]),
  },

  /* ------------------------------------------------------------- 7.5 */
  {
    slug: "qfs",
    title: "QFS",
    tagline: "A quality inspection & food safety application",
    sector: "Manufacturing",
    phase: "Operate",
    summary:
      "Paper-based quality checks are slow, hard to audit, and nearly impossible to standardize across multiple production facilities especially when each plant has slightly different compliance requirements. Funavry built QFS, a digital quality-inspection and food-safety platform that replaces manual, paper-based checks with web and mobile apps for inspecting, recording, and monitoring incoming and in-process food products.",
    stats: [
      { value: "14 Plants", label: "US + MENA" },
      { value: "No-Code Forms", label: "Per-Facility Config" },
      { value: "Offline Mobile", label: "Field Inspection" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Consumer Products & Manufacturing · Industrial IoT, Automation & Connected Operations",
      },
      {
        label: "Service",
        value:
          "No-Code Configuration Platform · Offline-Capable Mobile App · ERP/SAP Integration",
      },
      {
        label: "Deployment",
        value:
          "Live across 9 production plants in the US and 5 across the MENA region 14 total",
      },
      { label: "Client", value: "US · UAE · KSA · 10+ Engineers" },
    ],
    introHeading: "What is QFS?",
    intro: [
      "QFS is a digital quality-inspection and food-safety platform that replaces manual, paper-based checks with web and mobile apps for inspecting, recording, and monitoring incoming and in-process food products. Its centerpiece is a no-code template builder that lets each facility configure its own check-sheets to match local compliance requirements, paired with offline-capable mobile data entry and real-time quality dashboards.",
      "The client needed a system that could standardize quality processes across many plants while still letting each facility adapt forms to its own local regulatory requirements without requiring developer involvement for every change.",
    ],
    challengesLead:
      "Identifying the challenges of standardizing food-safety inspection across multiple facilities and solving them with a configurable, offline-capable platform.",
    challenges: [
      {
        title: "Every Facility Needs Different Forms",
        challenge:
          "Compliance requirements vary by facility and region, but building and maintaining custom inspection forms for each one through code changes doesn't scale.",
        solution:
          "A No-Code Template Builder a drag-and-drop configurator that lets admins design, edit, and deploy custom inspection check-sheets (text fields, dropdowns, radio buttons, checkboxes), so each facility builds forms that match its own compliance requirements without code or rework.",
      },
      {
        title: "Paper Forms Allow Bad Data Through",
        challenge:
          "Manual, paper-based forms have no built-in validation, so out-of-range values or missing fields can go unnoticed until it's too late to act.",
        solution:
          "Validation & Conditional Logic that enforces data-type and range validations dates, numbers, images, text and automatically triggers corrective actions or alerts when a threshold is breached.",
      },
      {
        title: "Inspectors Work in Areas Without Reliable Connectivity",
        challenge:
          "Production floors and receiving areas often have poor or no network connectivity, making cloud-only data entry unreliable for frontline inspectors.",
        solution:
          "Web & Offline Mobile Apps QA managers configure and review on the web while inspectors capture data on Android devices, with offline entry and automatic synchronization when connectivity returns.",
      },
      {
        title: "Incidents and Corrective Actions Get Lost in Paper Trails",
        challenge:
          "Non-conformance incidents and their corrective/preventive actions are hard to track and follow up on when logged on paper across multiple sites.",
        solution:
          "Inspection & Incident Workflows covering inbound raw-material checks, daily process monitoring, finished-goods and metal-detection verification, non-conformance (NCR) incident reporting, pre-submission correction, corrective and preventive actions, and collaborative multi-inspector form completion.",
      },
      {
        title: "No Real-Time Visibility Across Plants",
        challenge:
          "Leadership had no consolidated, real-time view of quality performance, deviations, or trends across facilities visibility only existed after manual report compilation.",
        solution:
          "Dashboards, Deviations & ERP Integration real-time unit-level and master dashboards tracking deviations, corrective actions, and form-completion trends, with e-signatures, automated deviation alerts, role- and facility-based access, and SAP/ERP integration via Active Directory.",
      },
    ],
    resultsLead:
      "The scale QFS has reached in standardizing food-safety inspection across a multi-region plant network.",
    results: [
      "Currently live across 9 production plants in the US and 5 across the MENA region 14 plants total.",
      "Replaced paper-based quality checks with configurable digital check-sheets across every facility.",
      "Enabled each facility to build and adjust its own compliance forms without developer involvement, via the no-code template builder.",
      "Gave inspectors reliable offline data capture on the production floor, with automatic sync once connectivity returns.",
      "Connected quality data to enterprise systems through SAP/ERP integration, with real-time dashboards for deviations and corrective actions.",
    ],
    screenshots: [
      {
        src: "/case-studies/optimized/qfs.webp",
        alt: "QA dashboard with deviation and corrective-action metrics",
      },
      {
        src: "/case-studies/optimized/qfs1.webp",
        alt: "Configurable digital inspection forms",
      },
      {
        src: "/case-studies/optimized/qfs-mobile.webp",
        alt: "Offline-capable mobile inspection app",
        fit: "contain",
      },
    ],
  },

  /* ------------------------------------------------------------- 7.6 */
  {
    slug: "transportation-management-system",
    title: "Transportation Management System (TMS)",
    tagline: "Centralized, compliance-driven logistics dispatch",
    sector: "Logistics",
    phase: "Automate",
    summary:
      "Coordinating truck assignment across farms, trucking providers, and depots by hand is slow and hard to keep compliant, especially when documentation requirements vary by driver and vehicle. Funavry built a Transportation Management System that digitizes and centralizes logistics operations, replacing manual transport allocation with an automated, compliance-driven platform.",
    stats: [
      { value: "Automated Dispatch", label: "FIFO + Dynamic" },
      { value: "Bilingual", label: "English · Spanish" },
      { value: "Compliance-Gated", label: "Document Validation" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Supply Chain, Logistics & Operations · Consumer Products & Manufacturing · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Enterprise Logistics Platform Development · Compliance-Driven Workflow Automation",
      },
      {
        label: "Technologies",
        value: "Azure AD (LDAP) authentication",
      },
      {
        label: "Language Support",
        value:
          "English and Spanish, role-based across farms, providers, and depots",
      },
      { label: "Client", value: "US · Costa Rica · 8+ Engineers" },
    ],
    introHeading: "What does the TMS do?",
    intro: [
      "The TMS coordinates truck assignment, supplier and fleet management, and document tracking across farms, trucking providers, and depots from a single system, replacing manual, spreadsheet- or phone-driven dispatch with an automated, compliance-gated workflow.",
      "The client needed dispatch to be both fast matching trucks to requests automatically and safe blocking any truck or driver whose documentation wasn't current across a network with multiple farm-to-provider relationship models.",
    ],
    challengesLead:
      "Identifying the challenges of manual, compliance-sensitive dispatch and solving them with automated, rule-driven assignment.",
    challenges: [
      {
        title: "Manual Truck Assignment Doesn't Scale",
        challenge:
          "Matching available trucks to farm requests by hand across one-to-one, one-to-many, and many-to-many farm-provider relationships is slow and error-prone.",
        solution:
          "Centralized Truck Assignment that automates allocation with FIFO and dynamic assignment, prioritizing available trucks over providers and auto-reassigning requests when a provider has none.",
      },
      {
        title: "No Single Source of Truth for Suppliers & Fleet",
        challenge:
          "Supplier, truck, and driver information was tracked inconsistently, with no centralized compliance or zone-access record.",
        solution:
          "Supplier, Truck & Driver Registration that onboards suppliers, farms, zones, trucks, and drivers with full company, fleet, insurance, and compliance details, plus zone-based access control.",
      },
      {
        title: "Expired Documents Slip Through",
        challenge:
          "Trucks or drivers with expired inspections, insurance, or licenses could still be assigned without a systematic check.",
        solution:
          "Compliance & Document Validation that checks truck and driver documents before assignment, with automatic expiry alerts, restrictions on expired or missing documents, blacklisting, and full audit logs.",
      },
      {
        title: "No Structured Handoff Between Farms, Depots & Providers",
        challenge:
          "Requests moved between farms, depots, and providers informally, with no clear approval or role structure.",
        solution:
          "A Service-Request Workflow & Roles system where farms raise requests, depots assign trucks, and providers manage drivers, with structured approvals and Azure AD (LDAP) authentication.",
      },
      {
        title: "No Visibility Into Operational Performance",
        challenge:
          "Leadership had no consolidated way to track travel times, waiting times, or trips per truck across the network.",
        solution:
          "Dashboards, KPIs & Integration with exportable Excel/CSV reports, in-app notifications, and integration with internal enterprise platforms for centralized transport data.",
      },
    ],
    resultsLead:
      "The capabilities delivered by replacing manual dispatch with an automated, compliance-driven TMS.",
    results: [
      "Automated truck assignment with FIFO and dynamic logic across one-to-one, one-to-many, and many-to-many farm-provider models.",
      "Enforced document validation before assignment, with automatic expiry alerts and blacklisting for non-compliant trucks or drivers.",
      "Delivered a structured, role-based workflow across farms, depots, and providers with bilingual English/Spanish support.",
      "Gave operations teams real-time KPIs on travel time, waiting time, and trips per truck, with exportable reporting.",
      "Connected transport data to internal enterprise platforms for centralized visibility.",
    ],
    screenshots: shots("Transportation Management System", [
      [
        "Picture13.jpg",
        "Dispatch dashboard with trip status, request KPIs and recent requests",
      ],
      [
        "Picture14.jpg",
        "Truck registry with document status and compliance filters",
      ],
    ]),
  },

  /* ------------------------------------------------------------- 7.7 */
  {
    slug: "cnbc-arabia",
    title: "CNBC Arabia News Portal",
    tagline: "A high-traffic, bilingual business & financial news platform",
    sector: "Media",
    phase: "Build",
    summary:
      "Delivering breaking business and financial news at scale with live market data and stock quotes, in both Arabic and English requires infrastructure built for sustained, high-volume traffic. Funavry built the CNBC Arabia news portal, engineered to scale to over a million hits per day, on a custom content management system with Elasticsearch and capital-market integrations.",
    stats: [
      { value: "1M+ Hits/Day", label: "High-Traffic Portal" },
      { value: "Live Market Data", label: "Tickers · Indices" },
      { value: "Elasticsearch", label: "Instant Search" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Media, Broadcasting & Infotainment · Financial Services & FinTech",
      },
      {
        label: "Service",
        value:
          "Custom CMS Development · High-Traffic Web & Mobile Platform · Real-Time Market Data Integration",
      },
      {
        label: "Technologies",
        value: "Custom content management system · Elasticsearch",
      },
      {
        label: "Scale",
        value: "Engineered to scale to over one million hits per day",
      },
      { label: "Client", value: "United States · 10+ Engineers" },
    ],
    introHeading: "What is the CNBC Arabia news portal?",
    intro: [
      "The CNBC Arabia news portal is a high-traffic, Arabic-language business and financial news platform delivering breaking news, market data, and live stock quotes across web and mobile, built on a custom CMS with Elasticsearch-powered search and capital-market integrations.",
      "The platform needed to serve a bilingual (Arabic and English) audience with real-time market data and news at a traffic scale that most publishing platforms aren't built to sustain, without compromising editorial speed or search relevance.",
    ],
    challengesLead:
      "Identifying the challenges of publishing at scale in two languages with live market data, and solving them with a purpose-built, elastic architecture.",
    challenges: [
      {
        title: "Editorial Teams Need Fast, Flexible Publishing Tools",
        challenge:
          "Generic content platforms don't fit the speed and structure required for high-volume financial news publishing.",
        solution:
          "A Custom Content Management System purpose-built for editorial teams to publish, organize, and manage news, articles, and multimedia across the portal and mobile apps.",
      },
      {
        title: "Readers Need to Find News & Market Data Instantly",
        challenge:
          "At high content volume, slow or irrelevant search results directly undermine the reader experience for a news-driven audience.",
        solution:
          "Elasticsearch-Powered Search delivering fast, relevant search across news content and live stock quotes.",
      },
      {
        title: "Market Data Needs to Be Live, Not Delayed",
        challenge:
          "Financial news readers expect tickers, indices, and market movers to update in real time, not on a publishing delay.",
        solution:
          "Capital Markets & Streaming Integration providing real-time data feeds and streaming services powering live tickers, indices, market movers, and video.",
      },
      {
        title: "Readers Split Across Web and Mobile",
        challenge:
          "Readers expect a consistent experience whether they're on desktop, mobile web, or the native app.",
        solution:
          "Unified Web & Mobile Applications delivering news and market data consistently across responsive web and native mobile apps.",
      },
      {
        title: "Serving Two Languages and Reading Directions",
        challenge:
          "Arabic (right-to-left) and English (left-to-right) content, search, and market data all need to work seamlessly in the same platform.",
        solution:
          "A Dual-Language Experience with full bilingual support across content, search, and market data for both reading directions.",
      },
    ],
    resultsLead:
      "The scale and performance the CNBC Arabia portal was engineered to deliver.",
    results: [
      "Engineered the platform's elastic infrastructure to scale to over one million hits per day.",
      "Delivered fast, relevant search across news and live stock quotes via Elasticsearch.",
      "Powered real-time tickers, indices, and market movers through capital-market and streaming integrations.",
      "Delivered a consistent bilingual (Arabic/English) experience across responsive web and native mobile apps.",
      "Built a custom CMS purpose-fit for high-volume financial news publishing.",
    ],
    screenshots: [
      {
        src: "/case-studies/optimized/CNBC Arabia News Portal/cnbc-arabia.webp",
        alt: "CNBC Arabia homepage with live market tickers and breaking business news",
      },
      {
        src: "/case-studies/optimized/CNBC Arabia News Portal/Picture15.png",
        alt: "Market-mover data on the CNBC Arabia portal",
        fit: "contain",
      },
      {
        src: "/case-studies/optimized/CNBC Arabia News Portal/cnbc-arabia-mobile.webp",
        alt: "CNBC Arabia mobile experience",
        fit: "contain",
      },
    ],
  },

  /* ------------------------------------------------------------- 7.8 */
  {
    slug: "smart-municipality",
    title: "Smart Municipality",
    tagline: "A citizen services & municipal CRM platform",
    sector: "Public Sector",
    phase: "Build",
    summary:
      "Requiring residents to visit a counter in person for every municipal service creates friction for citizens and workload for municipal staff. Funavry designed and delivered a Smart Municipality platform that moves citizen services online through a bilingual (Arabic & English) mobile and web experience backed by an internal CRM, letting residents request, pay for, and track services from a single app.",
    stats: [
      { value: "Bilingual", label: "Arabic · English" },
      { value: "Citizen CRM", label: "Multi-Level Workflow" },
      { value: "App + Web", label: "Online Services" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Government & Public Sector · Enterprise Business Systems · Commerce, Retail & Digital Marketplaces · Financial Services & FinTech",
      },
      {
        label: "Service",
        value:
          "Citizen Services Platform Development · Municipal CRM & Workflow Automation · Digital Identity & Payments Integration",
      },
      {
        label: "Technologies",
        value:
          "UAE Pass (national digital identity) · Tahseel (payment gateway)",
      },
      {
        label: "Language Support",
        value:
          "Full bilingual Arabic (right-to-left) and English (left-to-right) across app, web, and CRM",
      },
      { label: "Client", value: "United Arab Emirates · 10+ Engineers" },
    ],
    introHeading: "What is the Smart Municipality platform?",
    intro: [
      "The Smart Municipality platform moves citizen services online through a bilingual mobile and web experience backed by an internal CRM. Residents, businesses, and visitors can request, pay for, and track municipal services from a single app, while municipal teams route and process every request from a unified back office reducing counter footfall and accelerating service delivery.",
      "The municipality needed both a citizen-facing experience simple enough for everyday use, and a back-office system rigorous enough to route, approve, and escalate requests correctly across departments.",
    ],
    challengesLead:
      "Identifying the friction in in-person municipal services and solving it with an online, bilingual citizen-and-CRM platform.",
    challenges: [
      {
        title: "In-Person Service Requests Are Slow and Repetitive",
        challenge:
          "Residents needed to visit counters and re-submit the same documentation for every service request.",
        solution:
          "A Citizen Service Portal (App & Web) where residents browse services, view requirements and fees, and submit applications with a favorites list and autofill of previously uploaded documents for quick re-applying.",
      },
      {
        title: "Identity Verification and Payment Were Separate, Manual Steps",
        challenge:
          "Verifying identity and collecting payment for services typically required separate, disconnected processes.",
        solution:
          "Secure Onboarding & Payments via UAE Pass digital-identity login and an integrated Tahseel payment gateway with automatic payment links and real-time confirmations.",
      },
      {
        title: "Requests Had No Structured Routing Across Departments",
        challenge:
          "Service requests moving between departments manually created delays and inconsistent handling.",
        solution:
          "A Municipal CRM & Multi-Level Workflow that routes every request from a central supervisor to the relevant department, with a configurable, role-based approval chain and automatic re-assignment when staff are unavailable.",
      },
      {
        title: "No Easy Way to Report City Issues",
        challenge:
          "Residents had no simple channel to report issues like potholes or traffic incidents without a formal account or login.",
        solution:
          "A No-Login Instant-Reporting System for city issues, alongside community features news, events, tourism information, and emergency contacts that keep citizens informed.",
      },
      {
        title: "Leadership Lacked Visibility Into Service Performance",
        challenge:
          "Supervisors and department heads had no consolidated view of request volume, processing time, or team activity.",
        solution:
          "Role-Based Access, Notifications & Analytics with multi-channel notifications and configurable dashboards giving full visibility of service performance and team activity.",
      },
    ],
    resultsLead:
      "The capabilities the Smart Municipality platform delivers by moving citizen services online.",
    results: [
      "Enabled residents to browse, apply for, and pay for municipal services from a single bilingual app and web portal.",
      "Integrated UAE Pass digital identity and Tahseel payments for secure, verified, real-time transactions.",
      "Delivered multi-level, role-based CRM routing with automatic escalation when staff are unavailable.",
      "Gave residents a no-login way to report city issues alongside community information and alerts.",
      "Gave municipal leadership real-time dashboards on request volume and team performance.",
    ],
    screenshots: [
      {
        src: "/case-studies/optimized/smart-municipality.webp",
        alt: "Citizen service portal with service search and quick actions",
      },
    ],
  },

  /* ------------------------------------------------------------- 7.9 */
  {
    slug: "launchpad",
    title: "Launchpad",
    tagline: "A Web3 token launch & community distribution platform",
    sector: "FinTech · Web3",
    phase: "Build",
    summary:
      "Taking a Web3 project from “ready to launch” to token distribution at scale means solving two problems at once: giving project teams a credible, compliant way to raise funds, and giving the community a trustworthy way to discover and join new token sales. Funavry developed Launchpad to serve both sides of that equation in a single platform.",
    stats: [
      { value: "100+", label: "Project Launches" },
      { value: "$13M+", label: "Raised via Token Sales" },
      { value: "Multi-Chain", label: "EVM + Solana" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Financial Services & FinTech · Commerce, Retail & Digital Marketplaces",
      },
      {
        label: "Service",
        value:
          "Web3 / Blockchain Platform Development · Multi-Chain Wallet Integration · Compliant Token-Sale Infrastructure",
      },
      { label: "Live Since", value: "2023" },
      { label: "Client", value: "US · UAE · 15+ Engineers" },
    ],
    introHeading: "What is Launchpad?",
    intro: [
      "Launchpad is a Web3 token launch and community distribution platform that takes projects from “ready to launch” to token distribution at scale. It serves both project teams raising funds and the community discovering and joining new token sales and campaigns.",
      "The platform needed to support multiple launch formats and chains, enforce compliant onboarding without slowing down participation, and give both sides project teams and their communities the tools to grow distribution and engagement over time.",
    ],
    challengesLead:
      "Identifying the challenges of running compliant, scalable token launches and solving them with a flexible, multi-chain platform.",
    challenges: [
      {
        title: "One-Size-Fits-All Launch Models Don't Fit Every Project",
        challenge:
          "Different projects need different fundraising and distribution mechanics open subscription, structured allocation rounds, community engagement campaigns, or reward-based giveaways but most platforms only support one format.",
        solution:
          "Multiple Launch Formats including Public Sales with open subscription and post-sale allocation, tiered Standard IDOs with structured guaranteed and first-come rounds, Buzz Campaigns for community engagement, and Launchdrops and giveaways for reward-based distribution.",
      },
      {
        title: "No Way to Reward Early or Loyal Participants",
        challenge:
          "Treating every participant identically gives project teams no way to reward engagement, loyalty, or early support with better access or terms.",
        solution:
          "Tiered Allocation & Membership a tiered membership model that unlocks participation eligibility, early-access windows, allocation boosts, and reduced or zero fees for qualifying participants.",
      },
      {
        title: "Compliance Risk in Open Token Sales",
        challenge:
          "Running token sales without proper identity verification and region-based controls exposes both the platform and project teams to significant regulatory risk.",
        solution:
          "Compliant Onboarding with integrated KYC/AML verification, region and eligibility controls, and per-campaign rule enforcement to support credible, standards-aware launches.",
      },
      {
        title: "Fragmented Wallet Support Limits Participation",
        challenge:
          "Restricting participation to a single blockchain or wallet type excludes large segments of the Web3 community and limits a project's total addressable audience.",
        solution:
          "Multi-Chain Wallet Integration with unified wallet connection across EVM chains and Solana, on-chain participation, vesting-based token claims, and a flexible refund system for oversubscribed or refundable sales.",
      },
      {
        title: "Distribution Growth Requires Manual Community Effort",
        challenge:
          "Growing a launch's reach beyond a project's existing community typically requires manual outreach and influencer coordination with no built-in tracking.",
        solution:
          "Community Growth Tooling with referral and ambassador (KOL) programs that broaden distribution, drive engagement, and extend campaign reach.",
      },
    ],
    resultsLead:
      "Platform traction Launchpad has delivered since launching in 2023.",
    results: [
      "Supported 100+ project launches since 2023.",
      "Facilitated over $13M raised through token-sale events on the platform.",
      "Distributed millions more in additional value through launchdrops and community campaigns beyond the direct fundraising total.",
      "Enabled multiple launch formats Public Sales, Standard IDOs, Buzz Campaigns, and Launchdrops to serve a range of project needs from a single platform.",
      "Delivered compliant, multi-chain participation across EVM chains and Solana with integrated KYC/AML and flexible refund handling.",
    ],
    screenshots: shots("Launchpad", [
      [
        "image (12).png",
        "Current and upcoming pools with live reward campaigns",
      ],
      [
        "image (13).png",
        "Campaign detail with reward pool, vesting terms and countdown",
      ],
      [
        "image (14).png",
        "Campaign leaderboard tracking clicks, referrals and quest points",
      ],
      [
        "image (15).png",
        "Participant dashboard with ROI, tier progress and token stats",
      ],
      ["image (16).png", "Refer-and-earn program page"],
      [
        "image (17).png",
        "Completed launchdrops and giveaways with claim status",
      ],
      ["image (11).png", "Admin pool management console"],
    ]),
  },

  /* ------------------------------------------------------------ 7.10 */
  {
    slug: "contxtual",
    title: "Contxtual",
    tagline: "A shoppable video commerce platform",
    sector: "Media · Commerce",
    phase: "Automate",
    summary:
      "Viewers who see a great outfit on screen have no easy way to shop it the video and the storefront are two completely separate experiences. Funavry built Contxtual, a shoppable-video platform that transforms streaming content into a storefront, connecting the on-screen world of shows and movies to products viewers can actually buy.",
    stats: [
      { value: "Computer Vision", label: "Scene Analysis" },
      { value: "AI Visual Match", label: "Product Discovery" },
      { value: "New Revenue", label: "For Streamers" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Media, Broadcasting & Infotainment · Commerce, Retail & Digital Marketplaces",
      },
      {
        label: "Service",
        value:
          "Computer Vision & AI Development · Shoppable Video / Ad-Tech Platform",
      },
      {
        label: "Core Approach",
        value:
          "Frame-by-frame scene analysis paired with AI visual-similarity matching to retail catalogs",
      },
      { label: "Client", value: "United States · 10+ Engineers" },
    ],
    introHeading: "What is Contxtual?",
    intro: [
      "Contxtual is a shoppable-video platform that lets audiences engage with what they watch in an entirely new way connecting the on-screen world of their favorite shows and movies to products they can actually buy, and turning video into a new channel for product discovery.",
      "The platform needed to solve two sides of the same problem at once: giving viewers a seamless way to discover and buy what they see on screen, and giving streamers and advertisers a genuinely new, non-intrusive revenue channel.",
    ],
    challengesLead:
      "Identifying the disconnect between watching and shopping, and solving it with computer vision and AI visual matching.",
    challenges: [
      {
        title: "Viewers Can't Shop What They See On Screen",
        challenge:
          "There's no built-in way for a viewer to identify or purchase clothing and accessories worn by characters in a show or movie.",
        solution:
          "In-Video Product Discovery that lets viewers browse and buy products that visually match on-screen clothing and accessories, turning passive watching into intent-driven shopping.",
      },
      {
        title: "Identifying On-Screen Items Requires Manual Tagging",
        challenge:
          "Manually tagging every item worn by every character across hours of video content doesn't scale.",
        solution:
          "Computer-Vision Scene Analysis that detects actors and identifies their clothing and accessories frame by frame across the video content.",
      },
      {
        title: "On-Screen Items Aren't Available for Direct Purchase",
        challenge:
          "Even once an item is identified, the exact product usually isn't sold anywhere there's no direct path to purchase.",
        solution:
          "AI Visual Similarity Matching that matches on-screen items to look-alike products available across retail stores and catalogs.",
      },
      {
        title: "Streamers Have Limited Ways to Monetize Content",
        challenge:
          "Adding more commercials or raising subscription fees are the two default (and viewer-unfriendly) ways streamers monetize content.",
        solution:
          "New Revenue for Streamers by capturing incremental revenue and first-party purchase-intent data without adding commercials or raising subscription fees.",
      },
      {
        title: "Advertisers Lack Contextually Relevant Placement",
        challenge:
          "Traditional ad targeting isn't tied to what's actually happening on screen, limiting relevance.",
        solution:
          "High-Relevance Ad Targeting that gives advertisers context-aware product targeting, positioning video as an alternative to social and search advertising.",
      },
    ],
    resultsLead:
      "The capabilities Contxtual delivers by turning streaming video into a shoppable experience.",
    results: [
      "Enabled viewers to discover and purchase products visually matched to what characters wear on screen.",
      "Built frame-by-frame computer-vision scene analysis to detect actors' clothing and accessories.",
      "Delivered AI visual-similarity matching connecting on-screen items to real, purchasable retail products.",
      "Created a new incremental revenue channel for streamers without added commercials or subscription increases.",
      "Gave advertisers context-aware, video-based product targeting as an alternative to social and search ads.",
    ],
    screenshots: [
      {
        src: "/case-studies/optimized/Contxtual/contxtual.webp",
        alt: "Operations dashboard tracking scene tagging and ad-match metrics",
      },
      {
        src: "/case-studies/optimized/Contxtual/image_2024_02_16T18_09_07_816Z.png",
        alt: "AI-assisted annotation workspace matching on-screen apparel to shoppable products",
        fit: "contain",
      },
      {
        src: "/case-studies/optimized/Contxtual/image_2024_02_16T18_10_44_200Z.png",
        alt: "Scene indexing with visual product markers",
        fit: "contain",
      },
    ],
  },

  /* ------------------------------------------------------------ 7.11 */
  {
    slug: "skillyah",
    title: "SkillYah",
    tagline: "An online one-to-one tutoring marketplace",
    sector: "Education",
    phase: "Build",
    summary:
      "Finding a qualified, available tutor and managing scheduling, payment, and lesson delivery traditionally means juggling multiple tools with no single system tying it together. Funavry designed and developed SkillYah, an online marketplace connecting students with expert tutors for one-to-one live lessons, managing the full journey from discovery through post-lesson review.",
    stats: [
      { value: "3 Role-Based Portals", label: "Student · Tutor · Admin" },
      { value: "Live 1-to-1 Lessons", label: "Scheduling + Booking" },
      { value: "Marketplace", label: "Payments + Reviews" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Education & Workforce Development · Commerce, Retail & Digital Marketplaces",
      },
      {
        label: "Service",
        value:
          "Marketplace Platform Development · Role-Based Multi-Portal Web Application",
      },
      {
        label: "Technologies",
        value: "Zoom live video lessons",
      },
      {
        label: "Structure",
        value:
          "Three dedicated, role-based web portals: student, tutor, and administrator",
      },
      { label: "Client", value: "US · Japan · 5 Engineers" },
    ],
    introHeading: "What is SkillYah?",
    intro: [
      "SkillYah is an online marketplace that connects students with expert tutors for one-to-one live lessons. Built as three dedicated, role-based web portals for students, tutors, and administrators the platform manages the full journey from discovering and booking a tutor through scheduling, payment, live video lessons, and post-lesson reviews.",
      "The platform needed to serve three distinct audiences at once students searching for the right tutor, tutors managing their availability and earnings, and admins overseeing quality and approvals each with a tailored experience.",
    ],
    challengesLead:
      "Identifying the challenges of connecting students and tutors reliably, and solving them with role-based portals and structured workflows.",
    challenges: [
      {
        title: "Different Users Need Fundamentally Different Experiences",
        challenge:
          "Students, tutors, and administrators have very different needs, but most marketplace platforms force everyone through the same generic interface.",
        solution:
          "Role-Based Portals separate web portals for students, tutors, and administrators, each with its own registration, authentication, dashboard, and feature set.",
      },
      {
        title: "Finding the Right Tutor Is Hard Without Good Filtering",
        challenge:
          "Students need a reliable way to find a tutor who fits their subject, budget, and schedule not just a long, unfiltered list.",
        solution:
          "Tutor Discovery & Booking with search and filtering by subject, hourly rate, education level, background check, and availability, plus sorting by price or rating and full tutor profiles.",
      },
      {
        title: "Booking and Delivering Lessons Was Fragmented",
        challenge:
          "Confirming a lesson time and then actually delivering it reliably required stitching together separate scheduling and video tools.",
        solution:
          "Scheduling & Live Lessons through a request-accept/reschedule workflow with one-to-one classes delivered live through Zoom and optional lesson recordings.",
      },
      {
        title: "Payments and Cancellations Needed Clear Rules",
        challenge:
          "Handling payment collection, transaction history, and cancellations informally created disputes and inconsistency.",
        solution:
          "Payments & Transactions with integrated payment-gateway checkout, full transaction histories, and policy-based cancellation handling such as cancellation fees.",
      },
      {
        title: "No Way to Build Trust Between Students and Tutors",
        challenge:
          "Without reviews, messaging, or verified profiles, students had little basis for trusting an unfamiliar tutor.",
        solution:
          "Messaging, Reviews & Profiles with in-app message threads, post-lesson ratings and reviews, and managed tutor profiles including intro videos and certifications requiring admin approval.",
      },
    ],
    resultsLead:
      "The capabilities SkillYah delivers as a role-based, end-to-end tutoring marketplace.",
    results: [
      "Delivered three dedicated portals (student, tutor, admin), each tailored to its role.",
      "Enabled tutor discovery and booking filtered by subject, price, education level, and availability.",
      "Delivered live, one-to-one lessons via Zoom with optional recordings and a structured booking workflow.",
      "Built in integrated payments, transaction history, and policy-based cancellation handling.",
      "Enabled trust-building through in-app messaging, post-lesson reviews, and admin-approved tutor profiles.",
    ],
    screenshots: [
      {
        src: "/case-studies/optimized/skillyah.webp",
        alt: "SkillYah admin management portal",
      },
    ],
  },

  /* ------------------------------------------------------------ 7.12 */
  {
    slug: "medsim",
    title: "MedSim",
    tagline: "A VR medical simulation & training platform",
    sector: "Healthcare · Education",
    phase: "Build",
    summary:
      "Rehearsing high-stakes clinical procedures traditionally means either practicing on real patients under supervision or relying on classroom theory that never fully prepares trainees for bedside pressure. Funavry built MedSim, an immersive VR medical-simulation platform that lets healthcare trainees rehearse critical procedures in a safe, risk-free environment bridging the gap between theory and practice.",
    stats: [
      { value: "90+ FPS VR", label: "High-Fidelity" },
      { value: "Procedure Scenarios", label: "Risk-Free Training" },
      { value: "VR + LMS", label: "Real-Time Sync" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Healthcare & Life Sciences · Education & Workforce Development",
      },
      {
        label: "Service",
        value:
          "Immersive (VR/XR) Development · Learning Management System · Real-Time Simulation Platform",
      },
      {
        label: "Technologies",
        value: "VR headsets: Oculus, HTC Vive",
      },
      {
        label: "Performance & Security",
        value:
          "90+ FPS sustained rendering · MQTT-based real-time messaging · TLS-encrypted channels · Role-based access control",
      },
      { label: "Client", value: "United Arab Emirates · 25+ Engineers" },
    ],
    introHeading: "What is MedSim?",
    intro: [
      "MedSim is an immersive VR medical-simulation platform that lets healthcare trainees rehearse high-stakes clinical procedures in a safe, risk-free environment. By pairing high-fidelity VR scenarios with a web-based admin and learning-management system, it bridges the gap between classroom theory and bedside practice building technical proficiency alongside the teamwork and decision-making skills that traditional training often overlooks.",
      "The client needed a training solution that could simulate real clinical emergencies with enough fidelity and responsiveness to be genuinely useful for skill-building, while giving instructors a way to configure, run, and monitor sessions without needing to touch the VR environment directly.",
    ],
    challengesLead:
      "Identifying the platform's training and technical challenges and solving them with high-fidelity, synchronized VR simulation.",
    challenges: [
      {
        title: "Limited Hands-On Practice for High-Stakes Procedures",
        challenge:
          "Trainees have few safe opportunities to practice critical procedures CPR, defibrillation, ventilator setup before encountering them in real, high-pressure clinical situations.",
        solution:
          "Procedure-Based VR Scenarios covering critical procedures including CPR, ECG, defibrillation, SpO₂ oximetry, NIBP blood-pressure measurement, Ambu-bag ventilation, and ventilator setup each within a realistic clinical environment.",
      },
      {
        title: "No Central Way to Configure or Run Training Sessions",
        challenge:
          "Instructors needed a way to build scenarios and control live sessions without requiring VR expertise or manual configuration for every enterprise and user group.",
        solution:
          "A Web-Based Admin & LMS a learning-management system and trainer panel that builds scenarios, controls live sessions, and administers multiple enterprises and users from a single web interface.",
      },
      {
        title: "Admin and VR Environment Falling Out of Sync",
        challenge:
          "Live training sessions require the instructor's controls and the trainee's VR environment to stay perfectly aligned in real time any lag or desync breaks the simulation's realism and usefulness.",
        solution:
          "Real-Time Synchronization via low-latency, MQTT-based messaging that keeps the admin panel and VR environment instantly in sync, with reconnection and state-recovery mechanisms for resilience against network instability.",
      },
      {
        title: "Motion Sickness & Broken Immersion at Low Frame Rates",
        challenge:
          "VR training is only effective if it feels real low or inconsistent frame rates break immersion and can cause motion sickness, undermining the training's value.",
        solution:
          "High-Fidelity 90+ FPS VR through performance-optimized rendering that sustains 90+ frames per second across headsets such as Oculus and HTC Vive, preserving realism and preventing motion sickness.",
      },
      {
        title: "Rigid, Non-Conversational Interaction with Simulated Patients",
        challenge:
          "Scripted, menu-driven interactions with a simulated patient don't reflect how clinicians actually communicate during a real emergency.",
        solution:
          "Medical NLU & Intent Mapping natural-language understanding that interprets spoken queries in a medical context and maps recognized intent to dynamic mannequin responses and patient-state changes.",
      },
    ],
    resultsLead:
      "The capabilities MedSim delivers for safe, realistic, and centrally-managed clinical training.",
    results: [
      "Delivered hands-on VR practice for critical procedures CPR, defibrillation, oximetry, ventilator setup, and more without patient risk.",
      "Gave instructors a single web-based LMS and trainer panel to build scenarios and manage multiple enterprises and users.",
      "Achieved real-time, low-latency synchronization between the admin panel and VR environment via MQTT, with built-in resilience to network instability.",
      "Sustained 90+ FPS across Oculus and HTC Vive headsets, preserving immersion and preventing motion sickness.",
      "Enabled natural, spoken interaction with simulated patients through medical NLU and dynamic intent mapping, on a secure architecture with role-based access control and TLS-encrypted real-time channels.",
    ],
    screenshots: shots("MedSim", [
      [
        "ECG-Monitor-screen.jpg",
        "VR hospital room scenario with live ECG monitor",
      ],
      [
        "Screenshot 2026-06-19 224436.png",
        "Instructor console managing a live patient scenario",
      ],
      [
        "Screenshot 2026-06-19 224828.png",
        "Vital-sign and assessment controls driving the simulation",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.13 */
  {
    slug: "style-bytes",
    title: "Style Bytes",
    tagline: "AI-powered virtual try-on for online fashion",
    sector: "Commerce",
    phase: "Build",
    summary:
      "Online shoppers can't know how clothing will actually fit them, which drives both hesitation to buy and costly returns. Funavry built Style Bytes, an AI-powered fashion commerce platform that lets shoppers create a personalized 3D avatar from a few photos and virtually try on clothing to see how it actually fits without any specialized scanners or hardware.",
    stats: [
      { value: "3D Avatar", label: "From Photos" },
      { value: "Hardware-Free", label: "On-Device Scan" },
      { value: "AI Stylist", label: "Personalized Fit" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Commerce, Retail & Digital Marketplaces · Media, Broadcasting & Infotainment",
      },
      {
        label: "Service",
        value:
          "AI / Computer Vision Development · 3D Commerce Platform · Conversational AI Styling",
      },
      {
        label: "Technologies",
        value:
          "3D Morphable Models, CNNs, and anthropometric modelling for avatar generation · RNN/LSTM models for the AI stylist · Spring Boot Java microservices · TensorFlow, Keras, and Blender pipeline on AWS · Angular web app · React Native mobile apps · WebGL/Metal 3D rendering",
      },
      {
        label: "Platform Approach",
        value:
          "Server-side avatar generation across CPU and GPU architectures, with standardized APIs for onboarding multiple designers and brands",
      },
      { label: "Client", value: "United States · 20+ Engineers" },
    ],
    introHeading: "What is Style Bytes?",
    intro: [
      "Style Bytes lets shoppers create a personalized 3D avatar from a few photos and virtually try on clothing to see how it actually fits. By capturing accurate body measurements and draping garments in 3D without any specialized scanners or hardware, the platform brings the confidence of in-store fitting to online shopping reducing sizing uncertainty and the cost of returns.",
      "The platform needed to make accurate virtual try-on accessible on everyday phones and webcams without requiring per-SKU 3D garment models from every retailer, and without dedicated scanning hardware from every shopper.",
    ],
    challengesLead:
      "Identifying the barriers to accurate virtual try-on and solving them with hardware-free 3D avatars and AI draping.",
    challenges: [
      {
        title: "Shoppers Can't Visualize Their Own Fit",
        challenge:
          "Static product photos on a model give shoppers no sense of how an item will actually look and fit on their own body.",
        solution:
          "3D Avatar & Body Profiling that generates a realistic personal avatar and accurate body measurements from a few phone or webcam photos plus basic inputs, using 3D Morphable Models, CNNs, and anthropometric modelling.",
      },
      {
        title: "Accurate Body Scanning Usually Requires Special Hardware",
        challenge:
          "Precise body measurement traditionally requires range cameras or dedicated 3D scanners most shoppers don't have.",
        solution:
          "Hardware-Free Body Capture through a guided, on-device 360° scan, making accurate sizing accessible on everyday mobile and web cameras.",
      },
      {
        title: "3D Garment Models Don't Scale Across Catalogs",
        challenge:
          "Building a dedicated 3D model for every SKU in a retailer's catalog is prohibitively expensive and slow.",
        solution:
          "2D-to-3D Cloth Draping that drapes garments onto the avatar directly from 2D patterns, using finite-element simulation for realistic wrinkles and folds no per-SKU 3D models required.",
      },
      {
        title: "Sizing Advice Is Based on Averages, Not the Individual",
        challenge:
          "Generic size charts reflect collection-wide averages, not how a garment will fit a specific shopper's body.",
        solution:
          "An AI Stylist ('Alice') built on RNN/LSTM models that delivers size and style recommendations grounded in the shopper's individual measurements and each garment's true dimensions.",
      },
      {
        title: "Supporting Many Brands at Scale Requires Real Infrastructure",
        challenge:
          "Making virtual try-on work reliably across many designers and brands' catalogs demands serious backend scalability.",
        solution:
          "A Scalable Commerce Platform with a Spring Boot Java microservices backend, TensorFlow/Keras/Blender processing on AWS, Angular web and React Native mobile apps, and WebGL/Metal 3D rendering, integrating retailers via RESTful APIs.",
      },
    ],
    resultsLead:
      "The capabilities Style Bytes delivers as a hardware-free, AI-powered virtual try-on platform.",
    results: [
      "Enabled realistic 3D avatar generation and accurate body measurement from a few phone or webcam photos.",
      "Delivered hardware-free body capture through a guided on-device 360° scan.",
      "Built 2D-to-3D cloth draping that removes the need for per-SKU 3D garment models.",
      "Delivered personalized, RNN/LSTM-driven size and style recommendations via the 'Alice' AI stylist.",
      "Built a scalable, multi-brand platform architecture designed to onboard multiple designers and retailers via standardized APIs.",
    ],
    screenshots: shots("Style Bytes", [
      [
        "stylebytes.jpg",
        "Virtual try-on, body measurement and avatar customization screens",
      ],
      ["Picture1.png", "3D avatar faces reconstructed from user photos"],
      ["Picture5.jpg", "Guided body-scan assistant", "contain"],
    ]),
  },

  /* ------------------------------------------------------------ 7.14 */
  {
    slug: "global-claims",
    title: "Global Claims Management System",
    tagline: "An end-to-end, multi-region claims workflow platform",
    sector: "Supply Chain",
    phase: "Build",
    summary:
      "Managing product and quality claims across regions, sites, and departments in spreadsheets doesn't scale approvals get lost, status is unclear, and there's no global view of claim activity. Funavry analyzed the existing Excel-based claims process and designed the Global Claims Management (GCM) system to replace fragmented spreadsheet tracking with a standardized, web-based workflow platform operating at a global level.",
    stats: [
      { value: "End-to-End", label: "Claim Lifecycle" },
      { value: "Approval Matrix", label: "Multi-Level Routing" },
      { value: "Global Rollout", label: "Regions · Sites" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Consumer Products & Manufacturing · Supply Chain, Logistics & Operations · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Enterprise Workflow Platform Development · Process Standardization & Digitization",
      },
      {
        label: "Scope",
        value:
          "Global rollout across regions, sites, and departments, replacing Excel-based claim tracking",
      },
      { label: "Client", value: "United States · 6+ Engineers" },
    ],
    introHeading: "What is the Global Claims Management System?",
    intro: [
      "The GCM system is a web-based, role-based workflow platform that manages product and quality claims end to end across regions, sites, and departments replacing fragmented spreadsheet tracking with a single, standardized system.",
      "The client needed claims to move predictably through review, survey, approval, and settlement regardless of who raised them or where, with the right approvers automatically engaged based on claim value, region, and product category.",
    ],
    challengesLead:
      "Identifying the breakdowns in spreadsheet-based claims tracking and solving them with a standardized, role-based workflow.",
    challenges: [
      {
        title: "Claims Had No Consistent Lifecycle",
        challenge:
          "Claims raised from different sources customers, sales, QA, inland teams followed inconsistent, spreadsheet-tracked paths with no clear status.",
        solution:
          "An End-to-End Claim Lifecycle managing claims from creation through review, survey, approval, and settlement, with a clear status flow and multiple defined initiation paths.",
      },
      {
        title: "Routing Between Departments Was Manual",
        challenge:
          "Moving a claim between Sales, QA, Procurement, Regional Office, Surveyors, and Finance required manual coordination and follow-up.",
        solution:
          "Role-Based Workflow & Routing that automatically routes claims across all relevant departments, with role-specific tabs and task lists.",
      },
      {
        title: "Approval Authority Wasn't Systematically Enforced",
        challenge:
          "Determining who needed to approve a claim based on amount, currency, region, and product category was handled inconsistently.",
        solution:
          "A Configurable Approval Matrix that directs claims to the right approvers by amount, currency, region, country, site, and product category, with sequential multi-level sign-off and email notifications.",
      },
      {
        title: "Claim Evidence Was Scattered",
        challenge:
          "Quality defects, shipping details, vessel data, and surveyor reports were recorded in disconnected files rather than tied to the claim itself.",
        solution:
          "Quality, Shipping & Surveyor Capture that records defects, shipping and product details, vessel data, evidence, and independent surveyor reports, auto-calculating discounts and claim values.",
      },
      {
        title: "No Global View of Claim Activity",
        challenge:
          "Leadership had no consolidated, filterable view of claims across regions and sites.",
        solution:
          "A Dynamic Dashboard and Reporting system with real-time dashboards, filterable claim lists, one-click PDF export, and an admin portal for roles, approvals, and Active Directory-based provisioning.",
      },
    ],
    resultsLead:
      "The capabilities delivered by replacing Excel-based claim tracking with a standardized, global workflow system.",
    results: [
      "Standardized the claim lifecycle from creation through review, survey, approval, and settlement.",
      "Automated routing across Sales, QA, Procurement, Regional Office, Surveyors, and Finance.",
      "Enforced a configurable, multi-level approval matrix based on amount, currency, region, and product category.",
      "Centralized quality, shipping, and surveyor evidence directly against each claim.",
      "Gave leadership real-time, filterable dashboards and one-click reporting across regions and sites.",
    ],
    screenshots: [
      {
        src: "/case-studies/optimized/Global Claims Management System/global-claims.webp",
        alt: "Global Claims Management dashboard with claim-status metrics",
      },
      {
        src: "/case-studies/optimized/Global Claims Management System/image (11).png",
        alt: "Task queue across claim workflow roles",
      },
      {
        src: "/case-studies/optimized/Global Claims Management System/image (12).png",
        alt: "Guided, multi-tab claim-creation workflow",
      },
      {
        src: "/case-studies/optimized/Global Claims Management System/image (13).png",
        alt: "Filterable claims list with status tracking",
      },
    ],
  },

  /* ------------------------------------------------------------ 7.15 */
  {
    slug: "travel-expense-management",
    title: "Travel & Expense Management System",
    tagline: "One platform for travel booking, approvals & reimbursement",
    sector: "Enterprise",
    phase: "Automate",
    summary:
      "Booking business travel and getting reimbursed for it usually means switching between separate booking sites, approval emails, and expense spreadsheets. Funavry built an enterprise Travel & Expense Management System that centralizes the entire travel lifecycle from travel requests and bookings to advances, expense claims, multi-level approvals, and finance reimbursement.",
    stats: [
      { value: "Unified Cart", label: "Flights · Hotels · Cars" },
      { value: "Multi-Level Approvals", label: "Policy-Validated" },
      { value: "OCR Receipts", label: "Auto Reimbursement" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Enterprise Business Systems · Financial Services & FinTech",
      },
      {
        label: "Service",
        value:
          "Enterprise Travel & Expense Platform Development · Policy-Driven Approval Workflow Automation",
      },
      {
        label: "Scope",
        value:
          "Full travel lifecycle: profile setup, requests, bookings, advances, expenses, approvals, and reimbursement",
      },
      { label: "Client", value: "United States · 6 Engineers" },
    ],
    introHeading: "What does the Travel & Expense Management System do?",
    intro: [
      "The system centralizes the entire travel lifecycle from travel requests and flight, hotel, and car bookings to advances, expense claims, multi-level approvals, and finance reimbursement. Employees plan trips in a unified cart with real-time policy validation, while approvers and finance gain full visibility and control over travel spend.",
      "The organization needed travel spend to stay within policy automatically, rather than catching violations after the fact, while still giving employees a fast, self-service way to plan and book trips.",
    ],
    challengesLead:
      "Identifying the friction in fragmented travel booking and expense processes, and solving it with a unified, policy-aware platform.",
    challenges: [
      {
        title: "Travel Booking Was Split Across Multiple Tools",
        challenge:
          "Employees had to use separate tools for flights, hotels, and car rentals, each with its own checkout and no combined view of trip cost.",
        solution:
          "An End-to-End Travel Lifecycle managing the full journey: profile setup, travel requests (one-way, round-trip, multi-city), flight, hotel, and car booking, advances, and reimbursement tracking.",
      },
      {
        title: "No Combined View of Trip Cost Before Booking",
        challenge:
          "Employees couldn't see total trip cost across flights, hotels, and cars until after everything was already booked separately.",
        solution:
          "A Unified Travel Cart consolidating flights, hotels, and car rentals into one itinerary with cumulative cost, edit/remove controls, real-time policy validation, and a review step before submission.",
      },
      {
        title: "Approval Routing Was Inconsistent",
        challenge:
          "Who needed to approve a trip, and under what conditions, wasn't consistently or automatically enforced.",
        solution:
          "Multi-Level Approval Workflows with configurable manager-, cost-, and region-based hierarchies, budget-range routing, over-budget justification, escalation, and delegated approvers for absences.",
      },
      {
        title: "Policy Violations Were Caught Too Late",
        challenge:
          "Overspending on flights, hotels, or per-diem limits was often only discovered after the trip, not before booking.",
        solution:
          "Budget & Policy Control enforcing flight, hotel, rental-car, and per-diem limits and cost-center budgets in real time, keeping every request compliant with travel policy.",
      },
      {
        title: "Expense Reporting Was Manual and Slow",
        challenge:
          "Employees manually entered receipt data and finance manually verified it before reimbursement, slowing the whole cycle.",
        solution:
          "Expense Capture & Finance Verification with OCR/scan-based receipt capture that auto-fills expense details, draft saving, finance verification, and automated reimbursement processing.",
      },
    ],
    resultsLead:
      "The capabilities delivered by centralizing travel booking, approvals, and reimbursement in one platform.",
    results: [
      "Unified flight, hotel, and car booking into a single cart with real-time policy validation.",
      "Enforced configurable, multi-level approval workflows based on manager, cost, and region.",
      "Applied budget and per-diem policy controls automatically before a trip is booked, not after.",
      "Automated expense capture via OCR receipt scanning, cutting manual data entry.",
      "Streamlined finance verification and reimbursement processing end to end.",
    ],
    screenshots: shots("Travel & Expense Management", [
      [
        "travelExpense.jpg",
        "Travel requests, flight search and multi-city booking screens",
      ],
      [
        "Screenshot 2026-06-22 111329.png",
        "Home with travel requests, expense claims and advances",
        "contain",
      ],
      [
        "Screenshot 2026-06-22 111534.png",
        "Car and hotel booking with stay details",
        "contain",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.16 */
  {
    slug: "aivm",
    title: "AIVM",
    tagline: "A decentralized AI blockchain infrastructure",
    sector: "Web3 · AI",
    phase: "Build",
    summary:
      "Centralized AI infrastructure asks users to simply trust that a model ran as claimed, with no way to independently verify it. Funavry designed and built AIVM, a Layer-1 blockchain purpose-built for verifiable, decentralized AI execution connecting a global marketplace for compute, models, and data as a permissionless, cryptographically verifiable alternative to today's centralized AI infrastructure.",
    stats: [
      { value: "Layer-1", label: "Cosmos SDK" },
      { value: "Verifiable", label: "Cryptographic Proofs" },
      { value: "Open Marketplace", label: "Compute · Models · Data" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Financial Services & FinTech · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Layer-1 Blockchain Development · Decentralized AI Infrastructure · Cross-Chain Interoperability",
      },
      {
        label: "Technologies",
        value:
          "Cosmos SDK (Layer-1 chain) · native IBC support for cross-chain interoperability, with EVM bridging on the roadmap",
      },
      {
        label: "Architecture",
        value:
          "Dual-path execution: on-chain for simple models, verified off-chain for large language models, with specialized validator tracks",
      },
      { label: "Client", value: "United States · 15+ Engineers" },
    ],
    introHeading: "What is AIVM?",
    intro: [
      "AIVM is a Layer-1 blockchain purpose-built for verifiable, decentralized AI execution. The platform connects a global marketplace for compute, models, and data, offering a permissionless, cryptographically verifiable alternative to today's centralized AI infrastructure.",
      "The project needed to solve a fundamental trust problem in AI infrastructure proving that a model actually ran as claimed while still supporting both lightweight on-chain models and large, resource-intensive LLMs.",
    ],
    challengesLead:
      "Identifying the trust and infrastructure gaps in centralized AI, and solving them with verifiable, decentralized execution.",
    challenges: [
      {
        title: "No Way to Verify AI Outputs Are Genuine",
        challenge:
          "Centralized AI platforms ask users to trust that outputs came from the claimed model, with no independent way to verify it.",
        solution:
          "Verifiable AI Execution using cryptographic proofs of model execution to restore trust in AI outputs.",
      },
      {
        title: "Compute Access Is Gatekept by Cloud Providers",
        challenge:
          "Accessing AI compute typically requires going through centralized cloud intermediaries, limiting openness and pricing competition.",
        solution:
          "A Decentralized Resource Marketplace offering permissionless global compute access, cutting out cloud intermediaries.",
      },
      {
        title: "Large Models Can't Run Fully On-Chain",
        challenge:
          "Large language models are too resource-intensive to execute directly on-chain, but off-chain execution alone loses verifiability.",
        solution:
          "Dual-Path Execution with on-chain execution for simple models and verified off-chain execution for large language models.",
      },
      {
        title: "A Single Validator Type Can't Cover Every Function",
        challenge:
          "Consensus, model execution, compute provisioning, and data integrity each require different validation logic.",
        solution:
          "Specialized Validators with separate validator tracks for consensus, model, compute, and data.",
      },
      {
        title: "Isolated Chains Limit Ecosystem Reach",
        challenge:
          "A blockchain that can't communicate with others limits which assets, users, and applications can participate.",
        solution:
          "Cross-Chain Interoperability with native IBC support, and EVM bridging on the roadmap.",
      },
    ],
    resultsLead:
      "The capabilities AIVM delivers as a verifiable, decentralized AI blockchain infrastructure.",
    results: [
      "Built a Layer-1 blockchain on Cosmos SDK purpose-built for verifiable AI execution.",
      "Delivered cryptographic proof of model execution to restore trust in AI outputs.",
      "Enabled permissionless, decentralized access to global compute, cutting out cloud intermediaries.",
      "Supported both on-chain execution for simple models and verified off-chain execution for large language models.",
      "Delivered specialized validator tracks for consensus, model, compute, and data, with native IBC cross-chain support.",
    ],
    screenshots: shots("AIVM", [
      ["Picture3.png", "3D visualization of the AIVM compute network", "contain"],
      ["Picture4.png", "Signal-scanning view of the network interface", "contain"],
    ]),
  },

  /* ------------------------------------------------------------ 7.17 */
  {
    slug: "ai-trading-assistant",
    title: "AI Trading Assistant",
    tagline: "Real-time crypto market intelligence, in plain language",
    sector: "FinTech · Web3",
    phase: "Automate",
    summary:
      "Technical analysis of crypto markets spotting chart patterns, cross-referencing indicators, tracking whale activity has traditionally taken skilled analysts hours per asset, and doesn't scale across thousands of tokens and timeframes. Funavry built a crypto-native AI trading assistant that scans markets in real time, detects chart patterns, and forecasts likely price action through a conversational interface, turning that hours-long process into an instant, plain-language conversation.",
    stats: [
      { value: "2,000+", label: "Tokens Scanned" },
      { value: "15m – 1D", label: "Multi-Timeframe" },
      { value: "Automated", label: "Pattern Recognition" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Financial Services & FinTech · Blockchain & Digital Assets",
      },
      {
        label: "Service",
        value:
          "AI / Conversational Interface Development · Real-Time Market Data & Technical Analysis Engine",
      },
      {
        label: "Coverage",
        value:
          "2,000+ trading pairs · timeframes from 15 minutes to 1 day · on-chain and derivatives data",
      },
      { label: "Client", value: "United States · 6–10 Engineers" },
    ],
    introHeading: "What does the AI Trading Assistant do?",
    intro: [
      "The AI Trading Assistant is a crypto-native tool that scans markets in real time, detects chart patterns, and forecasts likely price action through a conversational interface turning technical analysis that once took analysts hours into an instant, plain-language conversation.",
      "The underlying challenge: skilled technical analysis doesn't scale. A human analyst can deeply study a handful of assets, but crypto markets span thousands of tokens across multiple timeframes simultaneously, and opportunities can appear and disappear within minutes.",
    ],
    challengesLead:
      "Identifying the limits of manual technical analysis and solving them with automated, AI-driven market intelligence.",
    challenges: [
      {
        title: "Technical Analysis Doesn't Scale Across Thousands of Assets",
        challenge:
          "Manually charting and analyzing patterns across thousands of trading pairs and multiple timeframes is not feasible for individual traders or small teams.",
        solution:
          "AI-Powered Technical Analysis that detects chart patterns across thousands of trading pairs and timeframes automatically, continuously, and in parallel.",
      },
      {
        title: "Reactive, Not Predictive, Chart Reading",
        challenge:
          "Traders typically only see patterns after they've fully formed, missing the window to act on an emerging setup.",
        solution:
          "Predictive Chart Forecasting that projects likely price formations for blue-chip tokens such as BTC and ETH, surfacing setups as they develop rather than after the fact.",
      },
      {
        title: "Indicator Overload Without Synthesis",
        challenge:
          "Dozens of individual indicators RSI, EMA, SMA, Bollinger Bands each tell part of the story, but manually cross-referencing all of them for every asset is slow and error-prone.",
        solution:
          "Deep Indicator Analysis that combines RSI, EMA, SMA, Bollinger Bands, on-chain data, and derivatives data into a single synthesized read per asset.",
      },
      {
        title: "Blind Spots on Large-Player Activity",
        challenge:
          "Retail traders typically have no visibility into large transactions or exchange flows that can signal major market moves before they show up in price.",
        solution:
          "Smart Money & Whale Tracking that surfaces large transactions and exchange flow signals, giving users visibility into activity that typically precedes major price moves.",
      },
      {
        title: "Technical Jargon Is a Barrier to Everyday Traders",
        challenge:
          "Raw indicator data and pattern terminology are inaccessible to traders without a technical-analysis background, limiting who can actually use the insights.",
        solution:
          "A Conversational Chat Interface that delivers plain-language, actionable chart analysis in seconds no technical-analysis background required to understand the output.",
      },
    ],
    resultsLead:
      "The capabilities delivered by turning hours of manual technical analysis into instant, conversational market intelligence.",
    results: [
      "Automated chart-pattern detection across 2,000+ trading pairs and timeframes from 15 minutes to 1 day.",
      "Delivered predictive price-formation forecasting for blue-chip tokens such as BTC and ETH.",
      "Synthesized RSI, EMA, SMA, Bollinger Bands, on-chain data, and derivatives data into unified, per-asset analysis.",
      "Surfaced smart-money and whale-transaction signals not visible through standard retail trading tools.",
      "Converted complex technical analysis into a plain-language conversational interface, removing the expertise barrier to using it.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.18 */
  {
    slug: "second-brain",
    title: "Second Brain",
    tagline: "A governed AI knowledge platform",
    sector: "Enterprise · AI",
    phase: "Build",
    summary:
      "An organization's knowledge is usually scattered across Slack, Notion, GitHub, and local files searchable by no one, and unusable by AI agents without exposing information they shouldn't see. Funavry built Second Brain, a centralized AI knowledge platform that turns scattered information into a governed, searchable layer for people and AI agents alike.",
    stats: [
      { value: "Governed", label: "Permission-Aware" },
      { value: "Any Model", label: "No Lock-In" },
      { value: "Tamper-Evident", label: "Verifiable Log" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Financial Services & FinTech · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "AI / Retrieval-Augmented Generation Development · Enterprise Knowledge Governance Platform",
      },
      {
        label: "Technologies",
        value:
          "Retrieval-augmented generation over a permission-scoped index · model-agnostic by design works with Claude, OpenAI, Gemini, or an organization's own models",
      },
      {
        label: "Integrations",
        value:
          "Slack, GitHub, Google Drive, Notion, Confluence, Salesforce, and more",
      },
      { label: "Client", value: "United States · 10–12 Engineers" },
    ],
    introHeading: "What is Second Brain?",
    intro: [
      "Second Brain is a centralized AI knowledge platform that turns an organization's scattered information into a governed, searchable layer for people and AI agents alike. Built on retrieval-augmented generation over a permission-scoped index, it connects tools such as Slack, Notion, GitHub, and local files, answers questions in plain language, and grounds every response in real sources with role-based access and a tamper-evident audit log.",
      "The organization needed AI-powered knowledge search that respected existing access permissions exactly, worked with any AI model rather than locking them into one vendor, and left an auditable trail of who accessed what.",
    ],
    challengesLead:
      "Identifying the risks of ungoverned AI knowledge access and solving them with a permission-aware, auditable platform.",
    challenges: [
      {
        title: "AI Answers Aren't Grounded in Real Sources",
        challenge:
          "Ungrounded AI knowledge tools risk confidently generating plausible-sounding but incorrect answers.",
        solution:
          "Governed Knowledge Retrieval that grounds every answer in real, connected sources rather than guesses.",
      },
      {
        title: "AI Tools Risk Exposing Information Users Shouldn't See",
        challenge:
          "Connecting AI to company knowledge without respecting existing access permissions creates a serious data-exposure risk.",
        solution:
          "Permission-Aware Access ensuring each person and AI agent sees only what they are cleared to see.",
      },
      {
        title: "Organizations Get Locked Into a Single AI Vendor",
        challenge:
          "Building knowledge infrastructure around one specific AI model creates vendor lock-in and limits flexibility.",
        solution:
          "Any-Framework Connectivity that works with Claude, OpenAI, Gemini, or an organization's own models.",
      },
      {
        title: "No Way to Audit Who Accessed What",
        challenge:
          "Without a verifiable access record, organizations can't confidently answer compliance or security questions about AI knowledge use.",
        solution:
          "A Tamper-Evident Audit Log that records and independently verifies every access.",
      },
      {
        title: "Knowledge Is Scattered Across Many Tools",
        challenge:
          "Relevant information lives across many disconnected tools, making it hard to build a single, coherent knowledge layer.",
        solution:
          "Enterprise-Grade Connectors integrating with Slack, GitHub, Drive, Notion, Confluence, Salesforce, and more.",
      },
    ],
    resultsLead:
      "The capabilities Second Brain delivers as a governed, model-agnostic AI knowledge platform.",
    results: [
      "Grounded every AI answer in real, connected organizational sources rather than ungrounded generation.",
      "Enforced permission-aware access so each person and AI agent sees only authorized information.",
      "Delivered model-agnostic connectivity across Claude, OpenAI, Gemini, and organization-owned models.",
      "Built a tamper-evident, independently verifiable audit log of every access.",
      "Connected knowledge across Slack, GitHub, Drive, Notion, Confluence, Salesforce, and more into one governed layer.",
    ],
    screenshots: shots("Brain", [
      [
        "brain-fe.staging.aivm.io_.png",
        "Second Brain the governed AI knowledge platform for people and agents",
        "contain",
      ],
      [
        "image (3).jpeg",
        "Control Center dashboard with the living knowledge graph",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.19 */
  {
    slug: "ai-nft-generator",
    title: "AI NFT Generator",
    tagline: "A prompt-to-mint NFT creation platform",
    sector: "Web3",
    phase: "Build",
    summary:
      "Creating and minting NFT art traditionally requires either artistic skill, design software, or hiring a designer followed by a separate, technically involved process to mint the artwork on-chain. Funavry built an AI-powered NFT platform that collapses both steps into one: turning a simple text prompt into unique artwork and minting it on-chain in a single click, with an integrated marketplace for instant resale.",
    stats: [
      { value: "22M+", label: "Images Generated" },
      { value: "110K+", label: "Active Users" },
      { value: "20+ Chains", label: "Multi-Chain Minting" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Blockchain & Digital Assets · Media & Broadcasting",
      },
      {
        label: "Service",
        value:
          "AI Generative Art · Web3 / NFT Platform Development · Multi-Chain Smart Contract Integration",
      },
      {
        label: "Marketplace Integration",
        value: "Connected with OpenSea for buying, selling, and discovery",
      },
      { label: "Client", value: "US · UAE · 10–12 Engineers" },
    ],
    introHeading: "What is the AI NFT Generator?",
    intro: [
      "The AI NFT Generator is an AI-powered NFT platform that turns text prompts into unique artwork and mints it on-chain in a single click, with an integrated marketplace for instant resale. The platform has generated more than 22 million images for over 110,000 active users.",
      "The product needed to remove every traditional barrier to NFT creation at once artistic skill, minting complexity, and chain fragmentation while still producing genuinely unique, mintable artwork at scale for a large and growing user base.",
    ],
    challengesLead:
      "Identifying the barriers to NFT creation and solving them with prompt-based generation and one-click minting.",
    challenges: [
      {
        title: "Artistic Skill as a Barrier to Entry",
        challenge:
          "Creating original NFT artwork traditionally requires design skill or hiring an artist, excluding the vast majority of people who might otherwise want to create and mint.",
        solution:
          "AI-Powered Art Generation where NLP-driven prompts generate unique, high-quality artwork from a simple text description no design skill required.",
      },
      {
        title: "Minting Requires Smart-Contract Knowledge",
        challenge:
          "Turning generated art into an actual NFT normally requires understanding smart contracts and metadata standards, a steep technical barrier for non-developers.",
        solution:
          "One-Click On-Chain Minting that produces mint-ready metadata automatically, with no smart-contract coding required from the user.",
      },
      {
        title: "Building a Full Collection Is Slow and Repetitive",
        challenge:
          "Creators launching a true NFT collection need many consistent, unique pieces generating and minting each one individually doesn't scale to collection-sized launches.",
        solution:
          "Full Collection Creation that generates entire collections of up to 10,000 images at once, ready for collection-scale launches.",
      },
      {
        title: "Chain Fragmentation Limits Reach",
        challenge:
          "Restricting minting to a single blockchain limits which wallets, marketplaces, and buyers a creator's NFTs can reach.",
        solution:
          "Multi-Chain Support that mints across 20+ networks, including Ethereum and Polygon, broadening where and how creators' NFTs can be bought and sold.",
      },
      {
        title: "No Easy Path From Creation to Sale",
        challenge:
          "Even after minting, creators need a separate marketplace and process to actually list, discover, and sell their NFTs.",
        solution:
          "An Integrated Marketplace that lets users buy, sell, and discover NFTs directly, connected with OpenSea for broader market reach.",
      },
    ],
    resultsLead:
      "The scale the AI NFT Generator has reached by removing every traditional barrier to NFT creation and minting.",
    results: [
      "Generated more than 22 million images for users across the platform.",
      "Grew to over 110,000 active users creating and minting AI-generated NFT art.",
      "Supported minting across 20+ blockchain networks, including Ethereum and Polygon.",
      "Enabled generation of full collections of up to 10,000 images in a single run, supporting collection-scale launches.",
      "Connected creators directly to buyers through an integrated marketplace linked with OpenSea.",
    ],
    screenshots: shots("AI NFT Generator", [
      ["AI_NFT.png", "Marketplace gallery of AI-generated NFT collections"],
      ["Picture2.png", "Minted AI-generated NFT detail card", "contain"],
    ]),
  },

  /* ------------------------------------------------------------ 7.20 */
  {
    slug: "crypto-ai-hub",
    title: "Crypto AI Hub",
    tagline: "A unified blockchain AI platform",
    sector: "Web3 · AI",
    phase: "Build",
    summary:
      "Crypto teams and traders typically need a chatbot, a contract auditor, a trading assistant, a compliance guide, and a research feed each from a different vendor. Funavry built Crypto AI Hub, a single platform that unifies trading intelligence, smart-contract generation and auditing, compliance guidance, and market research into seven integrated tools available through a web app and API.",
    stats: [
      { value: "7 Tools", label: "Unified Intelligence" },
      { value: "Crypto & Web3", label: "One Hub" },
      { value: "API & SDK", label: "Ready to Integrate" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Blockchain & Digital Assets · Financial Services & FinTech",
      },
      {
        label: "Service",
        value:
          "AI Platform Development · Web3 Tooling Suite · API / SDK Product",
      },
      {
        label: "Access",
        value:
          "Web app and API/SDK for integration into external products and workflows",
      },
      { label: "Client", value: "US · UAE · 10–15 Engineers" },
    ],
    introHeading: "What is Crypto AI Hub?",
    intro: [
      "Crypto AI Hub unifies trading intelligence, smart-contract generation and auditing, compliance guidance, and market research into seven integrated tools available through a single web app and API.",
      "The platform needed to bring together capabilities that are normally spread across separate crypto-AI products a chatbot, a contract auditor, a trading assistant, a compliance guide, and a market-alert engine into one coherent hub without diluting the depth of any individual tool.",
    ],
    challengesLead:
      "Identifying the fragmentation across separate crypto-AI tools and solving it with one unified hub.",
    challenges: [
      {
        title: "Users Need a Reliable Way to Understand Web3 Concepts",
        challenge:
          "Protocols, tokenomics, DeFi, and DAOs are complex topics with no single, always-available place to get clear answers.",
        solution:
          "An AI Crypto Chatbot an always-on Web3 assistant explaining protocols, tokenomics, DeFi, and DAOs.",
      },
      {
        title: "Auditing and Generating Smart Contracts Are Separate Steps",
        challenge:
          "Generating a contract and then getting it audited traditionally means two disconnected processes and toolsets.",
        solution:
          "A Smart Contract Generator & Auditor that generates and audits Solidity contracts in a single flow.",
      },
      {
        title: "Manual Chart Analysis Doesn't Scale for Active Traders",
        challenge:
          "Actively monitoring markets and reading charts manually across many assets is time-intensive and inconsistent.",
        solution:
          "AI Trading Intelligence delivering real-time technical analysis and predictive chart scenarios.",
      },
      {
        title: "Regulatory Requirements Vary Widely by Region",
        challenge:
          "Crypto projects need to understand licensing, AML/KYC, and tax obligations that differ significantly across jurisdictions.",
        solution:
          "Regulatory Compliance Guidance covering licensing, AML/KYC, and tax guidance across 100+ regions.",
      },
      {
        title: "Market-Moving Events Are Easy to Miss",
        challenge:
          "Significant price moves can happen quickly, and users without constant monitoring tools can miss them entirely.",
        solution:
          "Real-Time Crypto Alerts with AI-explained price moves paired with proprietary Bullishness Scores.",
      },
    ],
    resultsLead:
      "The capabilities Crypto AI Hub delivers by unifying seven crypto-AI tools into one platform.",
    results: [
      "Unified an always-on Web3 chatbot, smart-contract generator/auditor, trading intelligence, compliance guidance, and market alerts into one hub.",
      "Delivered real-time technical analysis and predictive chart scenarios alongside contract auditing in a single flow.",
      "Covered licensing, AML/KYC, and tax guidance across 100+ regions.",
      "Delivered AI-explained price moves with proprietary Bullishness Scores for real-time market awareness.",
      "Made all seven tools available through both a web app and API/SDK for external integration.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.25 */
  {
    slug: "systematic-review-platform",
    title: "Systematic Review Platform",
    tagline: "A structured, reproducible research platform for Mayo Clinic",
    sector: "Healthcare",
    phase: "Build",
    summary:
      "Running a rigorous systematic review from framing the research question to synthesizing evidence traditionally happens across disconnected spreadsheets, documents, and email threads, making transparency and reproducibility hard to guarantee. Funavry built a web-based platform for Mayo Clinic that guides research teams through the full systematic review lifecycle with rigor, transparency, and reproducibility.",
    stats: [
      { value: "PICO-Driven", label: "Structured Question Design" },
      { value: "Dual Screening", label: "Independent Review" },
      { value: "Meta-Analysis", label: "Evidence Synthesis" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Healthcare & Life Sciences · Clinical & Medical Research",
      },
      {
        label: "Service",
        value:
          "Research Workflow Platform Development · Evidence Synthesis & Reproducibility Tooling",
      },
      { label: "Client", value: "Mayo Clinic · United States · 10 Engineers" },
    ],
    introHeading: "What does this platform do?",
    intro: [
      "The platform guides Mayo Clinic research teams through the full systematic review lifecycle from framing the research question to synthesizing evidence with rigor, transparency, and reproducibility built into every stage.",
      "The client needed a structured way to keep every stage of a systematic review question framing, search, screening, quality checks, and synthesis auditable and consistent, rather than scattered across ad hoc tools.",
    ],
    challengesLead:
      "Identifying the risks of unstructured systematic reviews and solving them with a rigorous, staged research platform.",
    challenges: [
      {
        title: "Research Questions Need a Consistent, Locked Framework",
        challenge:
          "Without a fixed, upfront plan, research questions and scope can drift during the review, undermining transparency.",
        solution:
          "Research Question & Protocol tooling that frames objectives using PICO and locks a fixed plan upfront to keep the review honest and open.",
      },
      {
        title: "Literature Searches Risk Missing Relevant Studies",
        challenge:
          "Manually searching multiple scientific databases with consistent, precise keywords is easy to do inconsistently.",
        solution:
          "Comprehensive Literature Search that queries major scientific databases with precise keywords to capture every relevant study.",
      },
      {
        title: "Single-Reviewer Screening Risks Selection Bias",
        challenge:
          "Having only one person screen retrieved papers introduces subjectivity and risk of missed or wrongly excluded studies.",
        solution:
          "Dual Independent Screening where two reviewers assess retrieved papers separately to select the strongest evidence.",
      },
      {
        title: "Study Quality Isn't Always Consistently Assessed",
        challenge:
          "Not every included study is equally reliable, but manually assessing bias and quality for each one is easy to skip or do unevenly.",
        solution:
          "A Risk-of-Bias Quality Check that tests each included study for errors and bias.",
      },
      {
        title: "Synthesizing Findings Across Studies Is Complex",
        challenge:
          "Combining findings from many different studies into a coherent conclusion, including statistically, requires careful, structured synthesis.",
        solution:
          "Data Synthesis & Meta-Analysis that combines findings, including statistical meta-analysis where appropriate.",
      },
    ],
    resultsLead:
      "The capabilities delivered by structuring the systematic review lifecycle for Mayo Clinic research teams.",
    results: [
      "Structured research questions using the PICO framework with a locked, upfront review plan.",
      "Enabled comprehensive, consistent literature search across major scientific databases.",
      "Built in dual independent screening to reduce selection bias.",
      "Delivered systematic risk-of-bias quality checks for every included study.",
      "Supported data synthesis and statistical meta-analysis across included studies.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.26 */
  {
    slug: "dm-flow",
    title: "DM Flow",
    tagline:
      "An enterprise workflow management system for Del Monte Fresh Produce",
    sector: "Enterprise",
    phase: "Automate",
    summary:
      "Running approvals, evaluations, and operational forms across global regions manually creates inconsistency and makes governance hard to enforce. Funavry built DM Flow, an enterprise workflow and forms management system for Del Monte Fresh Produce that automates approvals, evaluations, and operations across global regions.",
    stats: [
      { value: "Multi-Region", label: "Configurable Approval Hierarchies" },
      { value: "SAP · Cube · ProducePro", label: "Enterprise Integrations" },
      { value: "Web & Mobile", label: "Cross-Platform Access" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Enterprise Business Systems · Food & Agriculture",
      },
      {
        label: "Service",
        value:
          "Enterprise Workflow & Forms Platform Development · Multi-System ERP Integration",
      },
      {
        label: "Technologies",
        value:
          "Integrates with SAP, Cube, and ProducePro across web and mobile",
      },
      {
        label: "Client",
        value:
          "Del Monte Fresh Produce · US · UAE · KSA · Costa Rica · 8–10 Developers",
      },
    ],
    introHeading: "What is DM Flow?",
    intro: [
      "DM Flow is an enterprise workflow and forms management system built for Del Monte Fresh Produce that automates approvals, evaluations, and operations across global regions, connecting directly with SAP, Cube, and ProducePro.",
      "The client needed configurable, auditable approval hierarchies that could work consistently across regions with different operational needs, while staying connected to the enterprise systems that already run the business.",
    ],
    challengesLead:
      "Identifying the inconsistency in manual, cross-region approvals and solving it with a configurable enterprise workflow system.",
    challenges: [
      {
        title: "Every Region Needs Different Forms and Approval Chains",
        challenge:
          "Approval hierarchies and form requirements vary across global regions, but building each one through custom development doesn't scale.",
        solution:
          "Configurable Forms & Workflows that build dynamic forms and templates with configurable approval hierarchies.",
      },
      {
        title: "Approvals Stalled Without Automated Follow-Up",
        challenge:
          "Manual approval routing had no built-in reminders or escalation, so requests could stall indefinitely.",
        solution:
          "Automated Approvals & Escalations that route approvals with notifications, reminders, and escalation rules.",
      },
      {
        title: "Governance Required a Reliable Audit Trail",
        challenge:
          "Demonstrating compliance and accountability required a dependable record of who approved what, and when.",
        solution:
          "Audit Trails & Compliance maintaining comprehensive audit trails for governance and accountability.",
      },
      {
        title: "Leadership Lacked Real-Time Visibility Into Activity",
        challenge:
          "Tracking pending items and overall workflow activity in real time wasn't possible with manual, spreadsheet-based tracking.",
        solution:
          "Executive Dashboards & Analytics tracking activity, statistics, and pending items in real time.",
      },
      {
        title: "Workflow Data Was Disconnected From Core Enterprise Systems",
        challenge:
          "Forms and approvals lived separately from the systems that actually run operations and finance.",
        solution:
          "Enterprise Integration connecting with SAP, Cube, and ProducePro across web and mobile.",
      },
    ],
    resultsLead:
      "The capabilities DM Flow delivers by automating workflow and approvals for Del Monte Fresh Produce.",
    results: [
      "Delivered configurable, region-specific forms and approval hierarchies.",
      "Automated approval routing with notifications, reminders, and escalation rules.",
      "Maintained comprehensive audit trails for governance and accountability.",
      "Gave leadership real-time dashboards on activity, statistics, and pending items.",
      "Connected workflow data directly to SAP, Cube, and ProducePro across web and mobile.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.27 */
  {
    slug: "restate",
    title: "REstate",
    tagline: "An ERP for managing government land assets",
    sector: "Public Sector",
    phase: "Build",
    summary:
      "Managing government housing allotments, rent recovery, waiting lists, and legal case tracking through manual, paper-driven processes makes it hard to enforce fair, rule-based decisions at scale. Funavry built REstate, an ERP platform that automates the Estate Office of the Government of Pakistan's workflows for allotments, rent recovery, waiting lists, and legal case management.",
    stats: [
      { value: "End-to-End Automation", label: "Digitized Estate Workflows" },
      { value: "GWL Management", label: "Waiting & Priority Lists" },
      { value: "Rent & Allotment", label: "Collection and Recovery" },
    ],
    meta: [
      { label: "Industry", value: "Public Sector · Real Estate" },
      {
        label: "Service",
        value:
          "Government ERP Platform Development · Public-Sector Workflow Digitization",
      },
      {
        label: "Client",
        value: "Estate Office, Government of Pakistan · 6–10 Engineers",
      },
    ],
    introHeading: "What is REstate?",
    intro: [
      "REstate is an ERP platform that automates the Estate Office of the Government of Pakistan's workflows allotments, rent recovery, waiting lists, and legal case management for government housing.",
      "The client needed to move fair, rule-based housing allotment and rent recovery off manual, paper-driven processes and into a consistent, auditable digital system spanning residential and commercial units.",
    ],
    challengesLead:
      "Identifying the challenges of manual government housing administration and solving them with a digitized ERP.",
    challenges: [
      {
        title: "No Centralized Record of Units and Assets",
        challenge:
          "Residential and commercial units across the government housing portfolio weren't tracked in a single, consistent system.",
        solution:
          "Unit & Asset Management that manages residential and commercial units across the portfolio.",
      },
      {
        title: "Allotment and Rent Recovery Were Manual and Inconsistent",
        challenge:
          "Assigning buildings to personnel and recovering rent relied on manual, paper-driven processes prone to inconsistency.",
        solution:
          "Allotment & Rent Collection that allots buildings to personnel and manages rent recovery.",
      },
      {
        title: "Waiting Lists Weren't Rule-Based or Transparent",
        challenge:
          "Prioritizing applicants for housing without a systematic, rule-based approach risked unfair or inconsistent outcomes.",
        solution:
          "A General Waiting List (GWL) system that manages waiting and priority lists based on business rules.",
      },
      {
        title: "Legal Cases and Audits Had No Digital Backbone",
        challenge:
          "Legal case management and audit reporting to authorities relied on manual record-keeping.",
        solution:
          "Legal Case & Audit Support for legal case management, audits, and reporting to authorities.",
      },
      {
        title: "Employee Registration Was Paper-Based",
        challenge:
          "Federal employees applying for government housing had to navigate a manual registration and application process.",
        solution:
          "Employee Registration & Applications that digitizes federal employee registration and application processing.",
      },
    ],
    resultsLead:
      "The capabilities REstate delivers by digitizing government housing administration.",
    results: [
      "Centralized management of residential and commercial units across the government housing portfolio.",
      "Automated allotment assignment and rent recovery processes.",
      "Delivered a rule-based General Waiting List system for fair, transparent prioritization.",
      "Digitized legal case management and audit reporting to authorities.",
      "Digitized federal employee registration and housing application processing.",
    ],
    screenshots: shots("Estate Office", [
      ["Landing_page.png", "Estate Office public information portal"],
      ["Web Landing Page.png", "REstate web landing page"],
      [
        "Applications.png",
        "Administrative dashboard tracking registrations and applications",
      ],
      ["Perfrma.png", "Digitized proforma processing"],
    ]),
  },

  /* ------------------------------------------------------------ 7.28 */
  {
    slug: "genai-marketing",
    title: "GenAI",
    tagline: "A generative-AI marketing automation platform",
    sector: "Marketing & AdTech",
    phase: "Automate",
    summary:
      "Producing marketing content and running campaigns across channels traditionally means coordinating copywriters, campaign managers, and analytics tools separately. Funavry built GenAI, a generative-AI platform that automates end-to-end marketing operations content creation, campaigns, segmentation, and analytics.",
    stats: [
      { value: "Generative AI", label: "Content at Scale" },
      { value: "Multi-Channel", label: "Cross-Platform Reach" },
      { value: "AI Targeting", label: "Personalized Engagement" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Marketing & AdTech · Enterprise Business Systems",
      },
      {
        label: "Service",
        value: "Generative AI Development · Marketing Automation Platform",
      },
      {
        label: "Scope",
        value:
          "Content generation, campaign automation, segmentation, and performance analytics in one platform",
      },
      { label: "Client", value: "United States · 4–5 Engineers" },
    ],
    introHeading: "What is GenAI?",
    intro: [
      "GenAI is a generative-AI platform that automates end-to-end marketing operations content creation, campaigns, segmentation, and analytics bringing what's normally a multi-tool marketing stack into one platform.",
      "The client needed marketing teams to create content, run multi-channel campaigns, personalize targeting, and track performance without switching between separate, disconnected tools for each function.",
    ],
    challengesLead:
      "Identifying the fragmentation across marketing content, campaigns, and analytics tools, and solving it with one generative-AI platform.",
    challenges: [
      {
        title: "Content Creation Is a Bottleneck",
        challenge:
          "Producing marketing copy for campaigns, emails, blogs, and social media at the pace modern marketing requires strains small teams.",
        solution:
          "AI Content Generation that creates marketing copy for campaigns, emails, blogs, and social media.",
      },
      {
        title: "Campaigns Span Multiple Disconnected Channels",
        challenge:
          "Planning and executing a campaign across multiple channels typically means managing each channel separately.",
        solution:
          "Campaign Automation that manages multi-channel campaigns from planning to execution.",
      },
      {
        title: "Generic Messaging Underperforms Targeted Messaging",
        challenge:
          "Sending the same message to an entire audience misses the performance gains of targeted, personalized outreach.",
        solution:
          "Personalization & Segmentation that targets audiences with AI-driven recommendations and data insights.",
      },
      {
        title: "Social and Email Require Constant Manual Scheduling",
        challenge:
          "Manually scheduling social posts and managing lead-nurturing email sequences is time-consuming and easy to fall behind on.",
        solution:
          "Social & Email Marketing that schedules social content and automates lead-nurturing email workflows.",
      },
      {
        title: "Performance and Compliance Are Hard to Track Centrally",
        challenge:
          "Without centralized tracking, it's difficult to see what's performing and to enforce content approval and compliance consistently.",
        solution:
          "Analytics & Governance that tracks performance with dashboards, plus content approval and compliance workflows.",
      },
    ],
    resultsLead:
      "The capabilities GenAI delivers as an end-to-end generative-AI marketing platform.",
    results: [
      "Automated AI-generated marketing copy across campaigns, emails, blogs, and social media.",
      "Unified multi-channel campaign planning and execution in one platform.",
      "Delivered AI-driven audience segmentation and personalized targeting.",
      "Automated social content scheduling and lead-nurturing email workflows.",
      "Centralized performance analytics alongside content approval and compliance governance.",
    ],
    screenshots: shots("GenAI Marketing", [
      ["Picture1.png", "Marketing platform sign-in experience"],
      ["Picture2.png", "Campaign planning workspace"],
      ["Picture3.png", "AI content generation"],
      ["Picture5.png", "Audience segmentation and targeting"],
      ["Picture7.png", "Social and email scheduling"],
      [
        "Picture8.png",
        "Campaign performance-analytics dashboard tracking channel CTR over time",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.29 */
  {
    slug: "talentedxpert",
    title: "TalentedXpert",
    tagline: "A Talent as a Service (TaaS) marketplace",
    sector: "HR Tech",
    phase: "Build",
    summary:
      "Finding vetted freelance talent for a specific task, and getting paid reliably for completed work, usually means navigating marketplaces that weren't designed with accessibility or trust in mind. Funavry built TalentedXpert, a global talent marketplace that connects businesses with vetted freelance experts enabling clients to post tasks, hire talent, and pay securely.",
    stats: [
      { value: "Talent as a Service", label: "Global Marketplace" },
      { value: "Inclusive by Design", label: "Accessibility-First" },
      { value: "Secure Payments", label: "Verified Reviews" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Marketplace & Gig Economy · HR Tech & Workforce Solutions",
      },
      {
        label: "Service",
        value:
          "Dual-Sided Marketplace Development · Accessibility-First Product Design",
      },
      {
        label: "Structure",
        value:
          "Dual-sided marketplace: separate TalentedXpert (talent) and TalentRequestor (business) experiences",
      },
      { label: "Client", value: "TalentedXpert · 6–10 Engineers" },
    ],
    introHeading: "What is TalentedXpert?",
    intro: [
      "TalentedXpert is a global talent marketplace that connects businesses with vetted freelance experts enabling clients to post tasks, hire talent, and pay securely, with disability-inclusion and accessibility built into the platform from the ground up.",
      "The platform needed to serve both sides of the marketplace well helping businesses find the right talent quickly, and giving talent, including those needing accessibility accommodations, a fair and inclusive way to find work.",
    ],
    challengesLead:
      "Identifying the gaps in typical freelance marketplaces and solving them with inclusive design and structured matching.",
    challenges: [
      {
        title: "Finding the Right Talent for a Specific Task Is Hard",
        challenge:
          "Businesses need a reliable way to find talent matched to a specific role, skill, or task locally or online.",
        solution:
          "Talent & Task Matching that provides localized matching for onsite and online tasks by role, skill, or keyword.",
      },
      {
        title: "Talent and Businesses Need Different Experiences",
        challenge:
          "Freelancers and the businesses hiring them have fundamentally different needs from the same marketplace.",
        solution:
          "A Dual-Sided Marketplace offering separate TalentedXpert and TalentRequestor experiences for talent and businesses.",
      },
      {
        title: "Payment and Trust Are Persistent Marketplace Risks",
        challenge:
          "Without secure payment handling and verified reputation signals, both sides of a marketplace face real risk.",
        solution:
          "Secure Payments & Reviews delivering secure payment processing with verified reviews and ratings.",
      },
      {
        title: "Tracking Active Work Across Many Tasks Is Hard",
        challenge:
          "Freelancers juggling multiple proposals and tasks need a single place to track everything, not scattered emails and messages.",
        solution:
          "Task & Proposal Management tracking active tasks, sent proposals, and opportunities in one dashboard.",
      },
      {
        title: "Most Marketplaces Aren't Built for Accessibility",
        challenge:
          "Freelancers with disabilities are often underserved by marketplaces that don't design for their needs from the start.",
        solution:
          "Inclusive & Accessible Design with built-in disability inclusion filters and accessibility features.",
      },
    ],
    resultsLead:
      "The capabilities TalentedXpert delivers as an inclusive, dual-sided talent marketplace.",
    results: [
      "Delivered localized talent-task matching by role, skill, or keyword, for both onsite and online work.",
      "Built separate, tailored experiences for talent (TalentedXpert) and businesses (TalentRequestor).",
      "Delivered secure payment processing with verified reviews and ratings.",
      "Gave talent a unified dashboard to track active tasks, proposals, and opportunities.",
      "Built in disability-inclusion filters and accessibility features from the ground up.",
    ],
    screenshots: shots("Talented Expert", [
      [
        "Talented Xperts 1.png",
        "TalentedXpert landing find experts or browse tasks",
        "contain",
      ],
      [
        "Talented Xperts_Default 1.png",
        "Xpert dashboard with matched opportunities and earnings",
      ],
      [
        "Talented Xperts_tasks.png",
        "Task detail with requirements, budget and proposal submission",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.30 */
  {
    slug: "ai-orchestration-platform",
    title: "AI Orchestration Platform",
    tagline:
      "A Business Brain and specialized AI agents that execute business processes",
    sector: "Enterprise · AI",
    phase: "Automate",
    summary:
      "Enterprises run on hundreds of disconnected systems, and the context needed to complete a piece of work is spread across all of them. Funavry built an enterprise AI orchestration platform that connects 700+ CRM, finance, and enterprise systems through a Business Brain and specialized AI agents that execute business processes end to end on schedule or on business event, pausing for human approval where it matters.",
    stats: [
      { value: "700+", label: "CRM, Finance & Enterprise Integrations" },
      { value: "Multi-Agent AI", label: "Specialized Orchestration" },
      { value: "Human-in-the-Loop", label: "Controlled Autonomous Execution" },
    ],
    meta: [
      {
        label: "Industry",
        value: "Enterprise Business Systems · AI & Data Platforms",
      },
      {
        label: "Service",
        value:
          "AI Orchestration Platform Development · Multi-Agent System Engineering · Enterprise Integration",
      },
      { label: "Client", value: "United States · 10+ Engineers" },
    ],
    introHeading: "What is this platform?",
    intro: [
      "The platform is an enterprise AI orchestration layer. It connects 700+ CRM, finance, and enterprise systems into a single intelligence layer, centralizes enterprise context in a Business Brain, and coordinates specialized AI agents that carry out real business processes across finance, CRM, research, reporting, and outreach.",
      "Rather than adding another assistant alongside the systems of record, the platform sits across them reading from and acting on the tools a business already runs, governed by the schedules, business events, and approval rules the business sets.",
    ],
    challengesLead:
      "Identifying what stops enterprise AI from doing real work, and solving each with an orchestration layer built across the systems already in use.",
    challenges: [
      {
        title: "Enterprise Systems Don't Share Context",
        challenge:
          "CRM, finance, and operational systems each hold part of the picture, so no single tool has enough context to complete a business process on its own.",
        solution:
          "Unified Enterprise Integration that connects 700+ CRM, finance, and enterprise systems into one unified intelligence layer.",
      },
      {
        title: "Information Without Meaning Can't Be Reasoned Over",
        challenge:
          "Raw records pulled from many systems are not the same as enterprise understanding an agent needs context, not just rows.",
        solution:
          "A Business Brain that centralizes enterprise context so information can be understood, enriched, and reasoned over before any action is taken.",
      },
      {
        title: "One General Assistant Can't Cover Every Function",
        challenge:
          "Finance, CRM, research, reporting, and outreach each demand different knowledge and different actions a single generalist agent handles none of them well.",
        solution:
          "Multi-Agent Orchestration that coordinates specialized agents across finance, CRM, research, reporting, and outreach.",
      },
      {
        title: "Work Still Waited for Someone to Start It",
        challenge:
          "Even automated steps sat idle until a person remembered to trigger them, leaving the process as slow as its slowest human handoff.",
        solution:
          "Autonomous Execution that runs orchestrations automatically based on schedules or defined business events.",
      },
      {
        title: "Full Autonomy Is Unacceptable for Sensitive Actions",
        challenge:
          "Payments, exceptions, and other sensitive steps cannot be handed to an agent without a control point, however capable the automation is.",
        solution:
          "Human-in-the-Loop control that pauses sensitive or exception-based actions for approval and resumes execution once authorized.",
      },
    ],
    resultsLead:
      "What the orchestration platform delivers once agents, systems, and enterprise context are connected.",
    results: [
      "Connected 700+ CRM, finance, and enterprise systems into a single unified intelligence layer.",
      "Centralized enterprise context in a Business Brain so information can be understood, enriched, and reasoned over.",
      "Coordinated specialized AI agents across finance, CRM, research, reporting, and outreach through multi-agent orchestration.",
      "Enabled autonomous execution of orchestrations on defined schedules or business events.",
      "Kept sensitive and exception-based actions under human control, pausing for approval and resuming after authorization.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.31 */
  {
    slug: "pharma-sales-intelligence",
    title: "Pharmaceutical Sales & Commercial Intelligence Platform",
    tagline:
      "Real-time executive visibility into sales performance and product profitability",
    sector: "Healthcare · Analytics",
    phase: "Build",
    summary:
      "Pharmaceutical leadership teams often see sales performance only after month-end reports are compiled by hand, long after the decisions those numbers should have informed. Funavry built an executive intelligence platform that gives leadership real-time visibility into pharmaceutical sales performance and product profitability across companies, products, cities, areas, and channels.",
    stats: [
      { value: "Commercial Analytics", label: "Sales Intelligence" },
      { value: "Revenue Insights", label: "Profitability Analysis" },
      { value: "Executive Reporting", label: "Real-Time Insight" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Healthcare & Life Sciences · Supply Chain, Logistics & Operations · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Business Intelligence & Analytics · Executive Reporting Platform · Commercial Performance Analysis",
      },
      { label: "Client", value: "Saudi Arabia · 2+ Engineers" },
    ],
    introHeading: "What does this platform do?",
    intro: [
      "The platform is an executive intelligence layer over pharmaceutical commercial data. It brings revenue, gross sales, discounts, and profitability into one real-time view, and breaks performance down by company, product, city, area, and channel.",
      "Leadership needed to understand not only what sold, but which products actually carried margin, and how this month compared with the last one and with the same month a year earlier without waiting on a manual reporting cycle.",
    ],
    challengesLead:
      "Identifying the gaps in manual pharmaceutical sales reporting and closing them with a real-time commercial intelligence platform.",
    challenges: [
      {
        title: "Leadership Saw Sales Performance Too Late",
        challenge:
          "Revenue, gross sales, discounts, and profitability were assembled manually, so executives reviewed performance well after the period it described.",
        solution:
          "Executive Sales Intelligence presenting revenue, gross sales, discounts, and profitability in one live executive view.",
      },
      {
        title: "One Total Hides Where Performance Comes From",
        challenge:
          "A single headline sales figure said nothing about which company, product, city, area, or channel was actually driving or dragging the number.",
        solution:
          "Multi-Dimensional Sales Analytics that break performance down by company, product, city, area, and channel.",
      },
      {
        title: "Volume Was Mistaken for Profitability",
        challenge:
          "The best-selling products were not necessarily the most profitable ones, and nothing in the reporting made that distinction visible.",
        solution:
          "Product Performance Intelligence that identifies top products alongside profitability trends.",
      },
      {
        title: "No Reliable Basis for Comparison",
        challenge:
          "Without consistent period-over-period views, it was difficult to separate genuine movement from ordinary seasonal variation.",
        solution:
          "Comparative Business Analysis covering month-over-month and year-over-year performance.",
      },
      {
        title: "Every New Question Needed an Analyst",
        challenge:
          "Any question the standard report did not answer became a request to the reporting team, adding days to each decision.",
        solution:
          "Interactive Executive Reporting with self-service analytics for strategic sales planning.",
      },
    ],
    resultsLead:
      "The visibility leadership gained once commercial performance moved into a single real-time platform.",
    results: [
      "Gave leadership a live executive view of revenue, gross sales, discounts, and profitability.",
      "Broke sales performance down by company, product, city, area, and channel.",
      "Surfaced top-performing products alongside their profitability trends, separating volume from margin.",
      "Enabled month-over-month and year-over-year comparison of commercial performance.",
      "Replaced analyst-dependent reporting with self-service analytics for strategic sales planning.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.32 */
  {
    slug: "virtual-gym-trainer",
    title: "Virtual Gym Trainer",
    tagline:
      "Structured training programmes with nutrition and wearable data in one app",
    sector: "Healthcare",
    phase: "Build",
    summary:
      "Fitness apps usually handle one thing well a workout log, a meal planner, or a step counter leaving the user to reconcile the rest. Funavry built a virtual fitness application that guides users through structured training programmes, tracks progress over time, and combines workout, nutrition, and wearable data in a single place.",
    stats: [
      { value: "Personalized", label: "Fitness Programmes" },
      { value: "Workout + Meal", label: "Guidance" },
      { value: "Wearables", label: "Real-Time Statistics" },
    ],
    meta: [
      { label: "Industry", value: "Healthcare & Life Sciences" },
      {
        label: "Service",
        value:
          "Mobile Application Development · Wearable Integration · Fitness & Nutrition Platform",
      },
      { label: "Region", value: "United Arab Emirates · 5 Engineers" },
    ],
    introHeading: "What does the app do?",
    intro: [
      "The application guides users through structured, phased training programmes, helps them choose the workout and meal plans that fit their goals, and reports back on their fitness status as they progress.",
      "It connects to smart watches to gather real-time activity statistics, so training, nutrition, and measured activity are read together rather than tracked across three separate tools.",
    ],
    challengesLead:
      "Identifying what fitness apps usually leave to the user, and solving each inside one guided programme.",
    challenges: [
      {
        title: "Training Without Structure Is Hard to Sustain",
        challenge:
          "Users starting out have no clear programme to follow and no reliable way to see whether they are actually progressing.",
        solution:
          "Programme Enrollment & Progress, letting users enroll in fitness programmes and monitor their progress over time.",
      },
      {
        title: "Choosing the Right Workout Plan Is Its Own Problem",
        challenge:
          "The number of available routines is itself a barrier most users cannot tell which plan actually suits their goal.",
        solution:
          "Workout Guidance that assists users in selecting the workout plan that fits their goals.",
      },
      {
        title: "Training and Nutrition Are Planned Separately",
        challenge:
          "Meal planning typically lives in a different app from the training routine, so the two are never planned against each other.",
        solution:
          "Meal Planning that supports meal-plan selection alongside the training routine, in the same app.",
      },
      {
        title: "Users Can't Tell Whether It Is Working",
        challenge:
          "Without periodic assessment, there is nothing to confirm progress or prompt a change of approach.",
        solution:
          "Periodic Fitness Feedback providing recurring feedback on the user's fitness status.",
      },
      {
        title: "Self-Reported Activity Is Incomplete",
        challenge:
          "Manually logged activity misses most of what a user actually does in a day, leaving progress tracking based on partial data.",
        solution:
          "Wearable Integration that connects with smart watches to gather real-time activity statistics.",
      },
    ],
    resultsLead:
      "What the application delivers by bringing training, nutrition, and wearable data together.",
    results: [
      "Delivered structured, personalized fitness programmes with progress tracking over time.",
      "Guided users to the workout plan matched to their individual goals.",
      "Brought meal planning alongside the training routine in a single application.",
      "Provided recurring feedback on each user's fitness status.",
      "Integrated smart watches to gather real-time activity statistics.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.33 */
  {
    slug: "construction-intelligence",
    title: "Executive Construction Intelligence Platform",
    tagline:
      "A unified executive view of projects, contract performance, and financial progress",
    sector: "Construction · FinTech",
    phase: "Build",
    summary:
      "Construction leadership teams carry a portfolio of projects whose commercial position committed cost, contract value, billing stage, net proceeds is usually reconstructed from spreadsheets one project at a time. Funavry built an executive analytics platform that gives leadership a single, unified view of construction projects, contract performance, and financial progress.",
    stats: [
      { value: "Construction Portfolio", label: "Executive Visibility" },
      { value: "Contract Analytics", label: "Commercial Performance" },
      { value: "Project Intelligence", label: "Real-Time Decision Support" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Financial Services & FinTech · Construction & Real Estate · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Executive Analytics Platform · Contract & Financial Intelligence · Portfolio Governance Reporting",
      },
      { label: "Client", value: "Saudi Arabia · 3+ Engineers" },
    ],
    introHeading: "What does this platform do?",
    intro: [
      "The platform gives construction leadership a live view of the whole portfolio: projects, contracts, and performance in one place, with progress, timelines, status, and milestones tracked against each contract.",
      "It carries the commercial position alongside the operational one committed cost, contract value, net proceeds, payable status, and billing by construction stage so governance and forecasting draw on the same numbers as delivery.",
    ],
    challengesLead:
      "Identifying where portfolio visibility broke down and rebuilding it as a single executive intelligence layer.",
    challenges: [
      {
        title: "No Single View of the Portfolio",
        challenge:
          "Projects, contracts, and their performance were tracked separately, so no one could see the portfolio as a whole without assembling it by hand.",
        solution:
          "Executive Portfolio Intelligence delivering a live view of projects, contracts, and performance in one place.",
      },
      {
        title: "Contract Progress Was Hard to Track",
        challenge:
          "Progress against each contract timelines, current status, milestones lived with individual project teams rather than in a shared record.",
        solution:
          "Contract Performance Monitoring that tracks progress, timelines, status, and milestones across every contract.",
      },
      {
        title: "Commercial Position Lagged Operational Reality",
        challenge:
          "Committed cost, contract value, and net proceeds were reconciled periodically, so the financial picture always trailed the work on site.",
        solution:
          "Financial & Commercial Analytics covering committed cost, contract value, and net proceeds.",
      },
      {
        title: "Billing and Payment Status Were Opaque",
        challenge:
          "What had been billed, what was payable, and which construction stage each amount belonged to required chasing across teams.",
        solution:
          "Billing & Payment Intelligence showing payable status and billing by construction stage.",
      },
      {
        title: "Governance Ran on Backward-Looking Reports",
        challenge:
          "Executive oversight depended on compiled reports, which supported review but not forecasting or early intervention.",
        solution:
          "Portfolio Governance Insights presenting executive KPIs for forecasting and governance.",
      },
    ],
    resultsLead:
      "The oversight leadership gained once the construction portfolio was consolidated into one platform.",
    results: [
      "Gave leadership a live, unified view of projects, contracts, and portfolio performance.",
      "Tracked contract progress, timelines, status, and milestones in one place.",
      "Brought committed cost, contract value, and net proceeds into the same executive view.",
      "Made payable status and billing by construction stage visible without chasing teams.",
      "Delivered executive KPIs supporting forecasting and portfolio governance.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.34 */
  {
    slug: "ai-nigraan",
    title: "AI Nigraan",
    tagline:
      "An AI narrative and sentiment intelligence platform for public conversation",
    sector: "Public Sector · Media",
    phase: "Automate",
    summary:
      "Public conversation moves across social platforms and news outlets in several languages at once, far faster than any team can read it. Funavry built AI Nigraan, an AI narrative and sentiment intelligence platform that turns public conversation across social and news sources into real-time, decision-ready intelligence.",
    stats: [
      { value: "Multi-Source", label: "X · Facebook · News" },
      { value: "Multilingual", label: "English · Urdu · Regional" },
      { value: "Real Time", label: "Continuous Monitoring" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Government & Public Sector · Media, Broadcasting & Infotainment",
      },
      {
        label: "Service",
        value:
          "AI Narrative & Sentiment Intelligence · Multilingual NLP · Real-Time Monitoring Platform",
      },
      { label: "Region", value: "Pakistan · 2 Engineers (MVP)" },
    ],
    introHeading: "What is AI Nigraan?",
    intro: [
      "AI Nigraan reads public conversation across X, Facebook, and news sources, clusters related posts into distinct narratives, and reports each narrative's participation and sentiment as it develops.",
      "It works across English, Urdu, Sindhi, Punjabi, Pashto, and Balochi, monitors tracked topics continuously, and answers questions in plain language so the output reads as a briefing rather than a dashboard to interpret.",
    ],
    challengesLead:
      "Identifying why public conversation resists manual monitoring, and solving each constraint with narrative-level AI analysis.",
    challenges: [
      {
        title: "Individual Posts Don't Show the Story",
        challenge:
          "Reading posts one at a time reveals volume but not the narratives forming across them, or how much support each is gathering.",
        solution:
          "Narrative Intelligence that clusters related posts into distinct narratives with participation and sentiment attached.",
      },
      {
        title: "The Conversation Isn't in One Language",
        challenge:
          "Public discussion runs simultaneously in several languages, and monitoring only one of them gives a partial and misleading reading.",
        solution:
          "Multilingual Analysis covering English, Urdu, Sindhi, Punjabi, Pashto, and Balochi.",
      },
      {
        title: "Unusual Activity Is Noticed Too Late",
        challenge:
          "By the time a shift in narrative activity is spotted manually, the window to respond to it has usually closed.",
        solution:
          "Real-Time Monitoring & Smart Alerts that track topics continuously and flag unusual narrative activity as it emerges.",
      },
      {
        title: "Analysis Still Had to Be Written Up by Hand",
        challenge:
          "Turning monitoring output into something a decision-maker can act on meant an analyst summarizing it manually, every time.",
        solution:
          "Executive Briefings plain-language summaries generated directly from the underlying data.",
      },
      {
        title: "Dashboards Require Interpretation",
        challenge:
          "Charts and filters put the burden of forming the question, and of reading the answer, back on the user.",
        solution:
          "Ask the Data, replacing dashboard interpretation with natural-language querying.",
      },
    ],
    resultsLead:
      "What the platform delivers as a real-time narrative and sentiment intelligence layer.",
    results: [
      "Clustered public conversation into distinct narratives with participation and sentiment for each.",
      "Analyzed conversation across English, Urdu, Sindhi, Punjabi, Pashto, and Balochi.",
      "Monitored tracked topics continuously and flagged unusual narrative activity through smart alerts.",
      "Generated plain-language executive briefings directly from the underlying data.",
      "Replaced dashboard interpretation with natural-language querying through Ask the Data.",
    ],
    screenshots: shots("AI Nigran", [
      [
        "Picture1.png",
        "Current picture narratives, sentiment breakdown, and active alerts",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.35 */
  {
    slug: "digital-agriculture-platform",
    title: "AI-Powered Digital Agriculture Platform",
    tagline:
      "A platform concept uniting agronomy advisory, crop diagnostics, and satellite analytics",
    sector: "AgriTech · IoT",
    phase: "Build",
    summary:
      "Agronomy advice, crop diagnostics, satellite analytics, and farmer communication are usually delivered by four separate systems, none of which reliably reaches a low-literacy farmer in the field. Funavry developed a concept for an AI-powered digital agriculture ecosystem that unifies all four on one platform.",
    stats: [
      { value: "AI Advisory", label: "LLM + RAG" },
      { value: "Precision Farming", label: "Satellite · Geospatial · CV" },
      { value: "Farmer Engagement", label: "App · Web · WhatsApp · Voice AI" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Industrial IoT & Automation · Supply Chain, Logistics & Operations",
      },
      {
        label: "Service",
        value:
          "Platform Concept · AI Advisory Engine · Crop Diagnostics & Geospatial Analytics",
      },
      { label: "Region", value: "Pakistan · 2+ Engineers (MVP)" },
    ],
    introHeading: "What is this platform concept?",
    intro: [
      "The concept describes an AI-powered digital agriculture ecosystem that brings agronomy advisory, crop diagnostics, satellite analytics, and farmer engagement onto a single platform.",
      "Advisory is grounded on an agronomy knowledge base through RAG rather than generated freely; diagnostics run on computer vision; satellite and NDVI analytics flag field stress before it is visible; and engagement reaches farmers through app, web, WhatsApp, and multilingual Voice AI.",
    ],
    challengesLead:
      "Identifying what keeps agronomy intelligence from reaching the field, and addressing each in the platform design.",
    challenges: [
      {
        title: "General AI Advice Isn't Safe Agronomy Advice",
        challenge:
          "Ungrounded model output cannot be trusted for decisions that affect a season's yield, where a wrong recommendation carries real cost.",
        solution:
          "An AI Advisory Engine delivering LLM advisory grounded on the agronomy knowledge base via RAG.",
      },
      {
        title: "Diagnosing Crop Problems Requires an Expert on Site",
        challenge:
          "Disease, pest damage, and nutrient deficiency all present visually, but telling them apart needs expertise the farmer rarely reaches in time.",
        solution:
          "Crop Diagnostics using computer vision for disease, pest, and nutrient-deficiency detection.",
      },
      {
        title: "Field Stress Is Noticed Only When It Is Visible",
        challenge:
          "By the time stress shows up on a walk through the field, the yield impact is already underway.",
        solution:
          "Geospatial Intelligence, where satellite and NDVI analytics flag field stress before it becomes visible.",
      },
      {
        title: "Input Decisions Are Made on Rules of Thumb",
        challenge:
          "Fertilizer type, quantity, and timing are commonly decided by habit rather than by field condition, affecting both yield and margin.",
        solution:
          "Fertilizer & Yield Optimization recommending type, quantity, and timing, and forecasting yield and margin.",
      },
      {
        title: "An App Alone Doesn't Reach the Farmer",
        challenge:
          "A platform that assumes a literate smartphone user excludes a large share of the farmers it is built to serve.",
        solution:
          "Farmer Engagement across app, WhatsApp, and multilingual Voice AI, designed to reach low-literacy farmers.",
      },
    ],
    resultsLead:
      "What the concept sets out to deliver as one connected agriculture platform.",
    results: [
      "Grounds AI agronomy advisory on a curated knowledge base through RAG, rather than on open-ended generation.",
      "Detects disease, pest damage, and nutrient deficiency from a photograph using computer vision.",
      "Flags field stress ahead of visible symptoms through satellite and NDVI analytics.",
      "Recommends fertilizer type, quantity, and timing, with yield and margin forecasting.",
      "Reaches low-literacy farmers through app, web, WhatsApp, and multilingual Voice AI.",
    ],
    screenshots: shots("Agri AI", [
      [
        "Web App/Dashboard.png",
        "Web dashboard weather alerts, advisory engines, and knowledge coverage",
      ],
      [
        "Mobile App/Dashboard.jpg",
        "Farmer app home photo screening, advisor, and seven-day weather alerts",
        "contain",
      ],
    ]),
  },

  /* ------------------------------------------------------------ 7.36 */
  {
    slug: "secure-home",
    title: "Secure Home",
    tagline:
      "AI perimeter security with event-based recording and real-time object alerts",
    sector: "IoT · Security",
    phase: "Build",
    summary:
      "Continuous video recording produces hours of footage in which nothing happens, and alerts triggered by any movement quickly train the owner to ignore them. Funavry built an AI-powered perimeter security solution that combines event-based video recording, intelligent noise rejection, and real-time object alerts at the edge.",
    stats: [
      { value: "Event-Based", label: "Video Recording" },
      { value: "Real-Time Alerts", label: "Humans + Vehicles" },
      { value: "Smart Box", label: "Up to 4 Cameras" },
    ],
    meta: [
      { label: "Industry", value: "Industrial IoT & Automation" },
      {
        label: "Service",
        value:
          "Computer Vision & Edge AI Development · Smart Security Hardware Integration",
      },
      { label: "Region", value: "Pakistan · 4 Engineers" },
    ],
    introHeading: "What is Secure Home?",
    intro: [
      "Secure Home is an AI perimeter security solution that records security events rather than continuous footage, rejects non-actionable activity, and raises real-time alerts when a human or vehicle is detected.",
      "Detection runs at the edge on a Smart Box that connects up to four IP cameras, and footage is recorded on site so the system stays useful without sending a household's video off-premises.",
    ],
    challengesLead:
      "Identifying why conventional camera systems go unwatched, and solving each with detection at the edge.",
    challenges: [
      {
        title: "Continuous Recording Buries the Events That Matter",
        challenge:
          "Recording around the clock produces hours of footage in which nothing happens, and the few relevant seconds are the hardest part to find.",
        solution:
          "Event-Based Recording that captures relevant security events instead of continuous noise.",
      },
      {
        title: "Motion Alerts Train Owners to Ignore Them",
        challenge:
          "Wind, animals, and passing shadows all trigger motion-based systems, and an alert stream full of false positives stops being read.",
        solution:
          "Intelligent Noise Rejection that filters non-actionable activity to reduce unnecessary recordings.",
      },
      {
        title: "An Alert Without Classification Says Nothing",
        challenge:
          "Knowing that something moved is not the same as knowing whether a person or a vehicle entered the perimeter.",
        solution:
          "Real-Time Alerts generated specifically for detected humans and vehicles.",
      },
      {
        title: "Cloud Footage Is a Privacy Exposure",
        challenge:
          "Routing household video to third-party storage creates a privacy risk that many owners are unwilling to accept.",
        solution:
          "Local Recording, keeping footage on site so the data stays private and secure.",
      },
      {
        title: "Detection Needs Grow After Deployment",
        challenge:
          "A system fixed to one set of detectable objects has to be replaced rather than extended when requirements change.",
        solution:
          "Expandable Classification, with an architecture that supports additional object classifications.",
      },
      {
        title: "One Camera Doesn't Cover a Perimeter",
        challenge:
          "A single viewpoint leaves blind spots, but a separate processing unit per camera makes full coverage expensive.",
        solution:
          "A Multi-Camera Edge Box a single Smart Box connecting up to four IP cameras.",
      },
    ],
    resultsLead:
      "What the solution delivers as an edge-based perimeter security system.",
    results: [
      "Captured relevant security events instead of continuous footage, through event-based recording.",
      "Reduced unnecessary recordings by filtering non-actionable activity.",
      "Delivered real-time alerts specifically for detected humans and vehicles.",
      "Kept footage recorded on site, so the data stays private and secure.",
      "Built an architecture that supports additional object classifications as needs grow.",
      "Covered a perimeter from one Smart Box connecting up to four IP cameras.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.37 */
  {
    slug: "ai-vehicle-classification",
    title: "AI Vehicle Classification",
    tagline: "Real-time vehicle classification from standard IP cameras",
    sector: "IoT · Mobility",
    phase: "Automate",
    summary:
      "Automated vehicle classification usually depends on specialized capture hardware, which limits where it can be deployed and how much it costs to cover a site. Funavry built real-time vehicle classification that runs on standard IP cameras, covering a broad range of vehicle categories for mobility, tolling, and audit applications.",
    stats: [
      { value: "Simple IP Cameras", label: "Low Hardware Overhead" },
      { value: "Real-Time", label: "Classification" },
      { value: "Motorbikes → Trucks", label: "Broad Vehicle Categories" },
    ],
    meta: [
      { label: "Industry", value: "Industrial IoT & Automation" },
      {
        label: "Service",
        value:
          "Computer Vision Development · Real-Time Video Analytics · Tolling & Audit Support",
      },
      { label: "Region", value: "Pakistan · 2 Engineers" },
    ],
    introHeading: "What does the system do?",
    intro: [
      "The system classifies vehicles directly from live IP-camera feeds in real time, covering categories from motorbikes through large trucks.",
      "Because it works with simple IP cameras rather than specialized capture hardware, it can support tolling workflows and act as an independent visual classification layer for operational audit without a dedicated sensor installation.",
    ],
    challengesLead:
      "Identifying what limits automated vehicle classification in practice, and solving each with camera-based computer vision.",
    challenges: [
      {
        title: "Classification Lagged Behind the Traffic",
        challenge:
          "Batch review of recorded footage cannot support workflows that need a decision while the vehicle is still at the point of capture.",
        solution:
          "Real-Time Classification directly from live IP-camera feeds.",
      },
      {
        title: "Narrow Category Coverage Limits Usefulness",
        challenge:
          "A model that recognizes only a few vehicle types leaves the rest of the traffic mix unclassified and the count incomplete.",
        solution:
          "Wide Vehicle Coverage supporting categories from motorbikes through large trucks.",
      },
      {
        title: "Specialized Hardware Restricts Deployment",
        challenge:
          "Purpose-built capture equipment raises the cost of every additional site and constrains where classification can be introduced.",
        solution:
          "Standard Camera Hardware the system works with simple IP cameras rather than specialized capture hardware.",
      },
      {
        title: "Manual Tolling Classification Doesn't Scale",
        challenge:
          "Classifying vehicles by hand for tolling is slow at volume and inconsistent between operators.",
        solution:
          "Toll Collection support, providing automated classification for tolling workflows.",
      },
      {
        title: "Operational Counts Had No Independent Check",
        challenge:
          "Where classification feeds revenue or reporting, a single source of truth leaves no way to verify what was recorded.",
        solution:
          "Audit & Verification, providing an independent visual classification layer for operational audit.",
      },
    ],
    resultsLead:
      "What the system delivers as a camera-based vehicle classification layer.",
    results: [
      "Classified vehicles in real time directly from live IP-camera feeds.",
      "Covered a broad range of categories, from motorbikes through large trucks.",
      "Ran on simple IP cameras rather than specialized capture hardware.",
      "Supported automated vehicle classification for tolling workflows.",
      "Provided an independent visual classification layer for operational audit.",
    ],
    screenshots: [],
  },

  /* ------------------------------------------------------------ 7.38 */
  {
    slug: "airline-financial-planning",
    title: "Financial Planning & Executive Intelligence",
    tagline:
      "Airline operational and financial data consolidated for planning and forecasting",
    sector: "Aviation · Analytics",
    phase: "Build",
    summary:
      "An airline's operational data and its financial data typically live in separate systems, so planning, forecasting, and board reporting each start with a reconciliation exercise. Funavry built an enterprise analytics platform that consolidates airline operational and financial data for planning, forecasting, and executive decisions.",
    stats: [
      { value: "Fuel Intelligence", label: "Operational Analytics" },
      { value: "Financial Forecasting", label: "Scenario Planning" },
      { value: "Board Reporting", label: "Enterprise KPIs" },
    ],
    meta: [
      {
        label: "Industry",
        value:
          "Airlines & Aviation · Supply Chain, Logistics & Operations · Enterprise Business Systems",
      },
      {
        label: "Service",
        value:
          "Enterprise Analytics Platform · Financial Planning & Forecasting · Executive KPI Reporting",
      },
      { label: "Client", value: "Saudi Arabia · 4+ Engineers" },
    ],
    introHeading: "What does this platform do?",
    intro: [
      "The platform consolidates airline operational and financial data into one analytics layer covering fuel performance, financial planning and forecasting, executive KPI reporting, scenario analysis, and enterprise financial reporting.",
      "Fuel consumption, cost trends, uplift stations, and variance is analyzed alongside rolling forecasts and P&L projections, so the largest operating variable and the financial plan are read against each other rather than in separate reports.",
    ],
    challengesLead:
      "Identifying where airline planning lost time and accuracy, and solving each with one consolidated analytics platform.",
    challenges: [
      {
        title: "Fuel Cost Was Analyzed After the Fact",
        challenge:
          "Consumption, cost trends, uplift stations, and variance were reviewed retrospectively, well after the operating decisions they should have shaped.",
        solution:
          "Fuel Performance Analytics covering consumption, cost trends, uplift stations, and variance.",
      },
      {
        title: "Forecasting Ran on Manual Models",
        challenge:
          "Rolling forecasts and P&L projections were rebuilt by hand each cycle, which limited how often they could be refreshed.",
        solution:
          "Financial Planning & Forecasting with rolling forecasts, P&L projections, and modelling built into the platform.",
      },
      {
        title: "Board Reporting Was Assembled by Hand",
        challenge:
          "Operational and financial KPIs came from different sources and had to be reconciled before every board pack.",
        solution:
          "Executive KPI Reporting bringing operational and financial KPIs together for board reporting.",
      },
      {
        title: "The Effect of a Fuel Price Move Was Unknown",
        challenge:
          "Without a modelling capability, the impact of a change in fuel price or operating assumptions could not be tested before it happened.",
        solution:
          "Scenario & What-If Analysis that models fuel price and operating assumption impact.",
      },
      {
        title: "Financial Statements Sat Outside the Analytics",
        challenge:
          "Balance sheet, income statement, and cashflow views lived apart from operational analysis, splitting the financial picture in two.",
        solution:
          "Enterprise Financial Reporting with balance sheet, income statement, and cashflow views in the same platform.",
      },
    ],
    resultsLead:
      "The planning capability the airline gained from consolidating operational and financial data.",
    results: [
      "Brought fuel consumption, cost trends, uplift stations, and variance into one operational analytics view.",
      "Delivered rolling forecasts, P&L projections, and financial modelling inside the platform.",
      "Consolidated operational and financial KPIs for board reporting.",
      "Enabled scenario and what-if modelling of fuel price and operating assumption impact.",
      "Added balance sheet, income statement, and cashflow reporting alongside operational analysis.",
    ],
    screenshots: [],
  },
];

export function getCaseStudyDetail(slug: string): CaseStudyDetail | undefined {
  return CASE_STUDY_DETAILS.find((d) => d.slug === slug);
}
