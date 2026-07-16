/**
 * Codegen: emits src/lib/tech-marks.ts — the real, full-colour brand marks for
 * the technology stack, pulled from Iconify's icon sets.
 *
 *   node scripts/gen-tech-marks.mjs
 *
 * Why not simple-icons alone: it is monochrome by design, and it drops marks on
 * trademark-holder request, so Amazon, Microsoft and OpenAI have none at all.
 * Iconify's `logos` (SVG Logos), `devicon` and `token-branded` sets carry the
 * actual artwork in the actual brand colours, which is what a reader recognises.
 *
 * Two flags come out of this and matter on a dark stage:
 *   mono — the artwork paints with `currentColor`, so the caller sets the colour.
 *   dark — every colour in the artwork is near-black (Next.js, Express, OpenAI).
 *          Those vendors publish a white-on-dark variant; we get there with an
 *          invert filter rather than shipping a second file.
 */
import { writeFileSync } from "node:fs";

/** Display name -> Iconify id. A product with no mark of its own takes its
    vendor's: AKS and Azure AI Search are Azure, GKE and Vertex AI are Google
    Cloud, SageMaker is AWS — which is how those products are branded anyway. */
const MAP = {
  // ---- Cloud & Infrastructure ----
  AWS: "logos:aws",
  Azure: "logos:microsoft-azure",
  GCP: "logos:google-cloud",
  Docker: "logos:docker-icon",
  Kubernetes: "logos:kubernetes",
  "Azure AKS": "logos:microsoft-azure",
  "Google GKE": "logos:google-cloud",
  "Amazon EKS": "logos:aws-eks",
  Terraform: "logos:terraform-icon",
  Ansible: "logos:ansible",
  "GitHub Actions": "logos:github-actions",
  "GitLab CI/CD": "logos:gitlab",
  Jenkins: "logos:jenkins",
  "Azure DevOps": "devicon:azuredevops",
  Prometheus: "logos:prometheus",
  Grafana: "logos:grafana",
  "ELK Stack": "logos:elasticsearch",
  OpenTelemetry: "logos:opentelemetry-icon",
  PostgreSQL: "logos:postgresql",
  MySQL: "logos:mysql-icon",
  MongoDB: "logos:mongodb-icon",
  Redis: "logos:redis",
  IPFS: "simple-icons:ipfs",
  "Amazon S3": "logos:aws-s3",

  // ---- AI & Agentic ----
  OpenAI: "logos:openai-icon",
  "Anthropic Claude": "logos:claude-icon",
  "Google Gemini": "logos:google-gemini",
  "Meta Llama": "logos:meta-icon",
  Mistral: "logos:mistral-ai-icon",
  LangChain: "simple-icons:langchain",
  LangGraph: "simple-icons:langgraph",
  CrewAI: "simple-icons:crewai",
  Pinecone: "logos:pinecone-icon",
  Chroma: "logos:chroma",
  "Azure AI Search": "logos:microsoft-azure",
  Elasticsearch: "logos:elasticsearch",
  "MongoDB Atlas Vector Search": "logos:mongodb-icon",
  Zapier: "logos:zapier",
  n8n: "simple-icons:n8n",
  PyTorch: "logos:pytorch-icon",
  TensorFlow: "logos:tensorflow",
  Keras: "devicon:keras",
  "Hugging Face": "logos:hugging-face-icon",
  "Amazon SageMaker": "logos:aws",
  "Vertex AI": "logos:google-cloud",
  MLflow: "simple-icons:mlflow",
  Kubeflow: "devicon:kubeflow",

  // ---- Full Stack ----
  Python: "logos:python",
  JavaScript: "logos:javascript",
  TypeScript: "logos:typescript-icon",
  Go: "logos:go",
  "Node.js": "logos:nodejs-icon",
  NestJS: "logos:nestjs",
  "Express.js": "logos:express",
  FastAPI: "logos:fastapi-icon",
  Flask: "logos:flask",
  React: "logos:react",
  "Next.js": "logos:nextjs-icon",
  Angular: "logos:angular-icon",
  "Vue.js": "logos:vue",
  "Material UI": "logos:material-ui",
  "Tailwind CSS": "logos:tailwindcss-icon",
  Bootstrap: "logos:bootstrap",
  Redux: "logos:redux",
  Flutter: "logos:flutter",
  "React Native": "logos:react",
  Swift: "logos:swift",
  Kotlin: "logos:kotlin-icon",

  // ---- Blockchain ----
  Ethereum: "token-branded:eth",
  Polygon: "token-branded:polygon",
  Solana: "token-branded:solana",
  "BNB Chain": "token-branded:bnb",
  Avalanche: "token-branded:avalanche",
  Arbitrum: "token-branded:arbitrum-one",
  Optimism: "token-branded:optimism",
  Base: "token-branded:base",
  Solidity: "logos:solidity",
  Rust: "logos:rust",
  Alchemy: "simple-icons:alchemy",
  Chainlink: "token-branded:link",

  // ---- Immersive (AR / VR / XR) ----
  Unity: "logos:unity",
  "Unreal Engine": "logos:unrealengine-icon",
  ARKit: "simple-icons:apple",
  ARCore: "simple-icons:google",
  "Meta Quest": "logos:meta-icon",
  "Oculus SDK": "simple-icons:oculus",
  Blender: "logos:blender",
  "Autodesk Maya": "devicon:maya",
  "Autodesk 3ds Max": "devicon:3dsmax",
};

const LUM = (hex) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

/* Group the ids by prefix so this is a handful of requests, not a hundred. One
   icon can serve several tools — logos:aws is both AWS and SageMaker, azure is
   three — so a prefix maps an icon to the *list* of names that want it. */
const byPrefix = new Map();
for (const [name, id] of Object.entries(MAP)) {
  const [prefix, icon] = id.split(":");
  if (!byPrefix.has(prefix)) byPrefix.set(prefix, new Map());
  const icons = byPrefix.get(prefix);
  icons.set(icon, [...(icons.get(icon) ?? []), name]);
}

const out = {};
const missing = [];

for (const [prefix, icons] of byPrefix) {
  const res = await fetch(
    `https://api.iconify.design/${prefix}.json?icons=${[...icons.keys()].join(",")}`,
  );
  const data = await res.json();

  for (const [icon, names] of icons) {
    const alias = data.aliases?.[icon]?.parent;
    const entry = data.icons?.[icon] ?? (alias ? data.icons?.[alias] : null);
    if (!entry) {
      missing.push(`${names.join(", ")} (${prefix}:${icon})`);
      continue;
    }

    const body = entry.body;
    const width = entry.width ?? data.width ?? 24;
    const height = entry.height ?? data.height ?? 24;

    const mono = body.includes("currentColor");
    // Every literal colour in the artwork. If the brightest is still near-black,
    // the mark is a black-on-white lockup and needs flipping on a dark stage.
    const colours = [...body.matchAll(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)].map(
      (m) => m[0],
    );
    const dark =
      !mono && colours.length > 0 && Math.max(...colours.map(LUM)) < 0.32;

    for (const name of names) out[name] = { body, width, height, mono, dark };
  }
}

if (missing.length) {
  console.warn(`No Iconify mark for ${missing.length}:\n  ${missing.join("\n  ")}`);
}

const body = Object.entries(out)
  .map(
    ([name, m]) =>
      `  ${JSON.stringify(name)}: {\n    w: ${m.width},\n    h: ${m.height},${
        m.mono ? "\n    mono: true," : ""
      }${m.dark ? "\n    dark: true," : ""}\n    body: ${JSON.stringify(m.body)},\n  },`,
  )
  .join("\n");

writeFileSync(
  new URL("../src/lib/tech-marks.ts", import.meta.url),
  `// GENERATED by scripts/gen-tech-marks.mjs — do not edit by hand.
// Real brand artwork from Iconify (logos / devicon / token-branded / simple-icons).
//
// mono: the artwork paints with currentColor — the caller owns the colour.
// dark: every colour in it is near-black, so it needs inverting on a dark stage.

export type TechMark = {
  w: number;
  h: number;
  mono?: boolean;
  dark?: boolean;
  body: string;
};

export const TECH_MARKS: Record<string, TechMark> = {
${body}
};
`,
);

const monos = Object.values(out).filter((m) => m.mono).length;
const darks = Object.values(out).filter((m) => m.dark).length;
console.log(
  `Wrote src/lib/tech-marks.ts — ${Object.keys(out).length} marks (${monos} mono, ${darks} dark).`,
);
