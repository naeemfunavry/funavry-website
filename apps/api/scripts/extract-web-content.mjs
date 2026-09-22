/**
 * One-time extraction of the website's hardcoded content into a JSON snapshot
 * the database seed reads.
 *
 * Why a snapshot rather than importing the modules directly: several of them
 * are not importable outside Next. `case-studies.ts` imports .webp files that
 * only a bundler can resolve, and the client, testimonial and leadership lists
 * live inside .tsx components alongside JSX. Rather than teach the seed to
 * parse React, this runs once, writes a plain JSON file, and that file becomes
 * the reviewable record of exactly what was imported.
 *
 * Array literals are extracted by locating the declaration and reading to its
 * matching bracket, then evaluated in an isolated context. That is safe here
 * because every array involved contains only string, number and boolean
 * literals — this script is never run against untrusted input, only against
 * this repository's own source.
 *
 *   node scripts/extract-web-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const webSrc = resolve(here, "../../web/src");
const outPath = resolve(here, "../src/database/seeds/data/web-content.json");

/**
 * Reads from `declaration` to the bracket that closes its initializer.
 *
 * The scan starts after the `=`, not after the declaration name. A typed
 * declaration like `const CLIENTS: { name: string }[] = [...]` contains a `[]`
 * in its type annotation, and starting from the name would find that empty
 * pair first and silently extract nothing.
 */
function extractArrayLiteral(source, declaration) {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`Declaration not found: ${declaration}`);

  const equalsIndex = source.indexOf("=", start);
  if (equalsIndex === -1) throw new Error(`No initializer for: ${declaration}`);

  const openIndex = source.indexOf("[", equalsIndex);
  if (openIndex === -1) throw new Error(`No array literal after: ${declaration}`);

  let depth = 0;
  let inString = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    /* Comments are skipped before string tracking, not after. The source
       comments contain apostrophes ("the client's system") and unbalanced
       quotes, and treating those as string delimiters desynchronises the
       scanner for the rest of the file. */
    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inString) {
      if (char === "\\") escaped = true;
      else if (char === inString) inString = null;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }

    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(openIndex, i + 1);
        /* Strip TypeScript's `as const` and trailing type assertions, which are
           not valid in a plain JS expression. */
        const cleaned = literal.replace(/\s+as\s+const\b/g, "").replace(/\s+as\s+\w+/g, "");
        return runInNewContext(`(${cleaned})`, Object.create(null), { timeout: 5000 });
      }
    }
  }

  throw new Error(`Unterminated array literal for: ${declaration}`);
}

const read = (relativePath) => readFileSync(join(webSrc, relativePath), "utf8");

/* ------------------------------------------------------------- clients -- */

const clientsSource = read("components/sections/Clients.tsx");
const clients = extractArrayLiteral(
  clientsSource,
  "const CLIENTS: { name: string; file: string }[]",
);

/* -------------------------------------------------------- testimonials -- */

const testimonialsSource = read("components/sections/Testimonials.tsx");
const testimonials = extractArrayLiteral(testimonialsSource, "const TESTIMONIALS: Testimonial[]");

/* ---------------------------------------------------------- leadership -- */

const aboutSource = read("app/about/page.tsx");
const leaders = extractArrayLiteral(aboutSource, "const LEADERS");
const stats = extractArrayLiteral(aboutSource, "const STATS");

/* -------------------------------------- case-study deck metadata (6 of) -- */

/* `case-studies.ts` cannot be evaluated as-is because of the .webp imports, so
   each import is rewritten to the public path it resolves to before the array
   is read. The paths are exactly what the bundler would have produced. */
let caseStudiesSource = read("lib/case-studies.ts");

const imageBindings = {};
const importRe = /import\s+(\w+)\s+from\s+"\.\.\/\.\.\/public(\/[^"]+)";/g;
let match;
while ((match = importRe.exec(caseStudiesSource)) !== null) {
  imageBindings[match[1]] = match[2];
}

/* Replace each identifier where it is used as a value in the array. */
for (const [binding, publicPath] of Object.entries(imageBindings)) {
  caseStudiesSource = caseStudiesSource.replace(
    new RegExp(`(image|mobileImage):\\s*${binding}\\b`, "g"),
    `$1: ${JSON.stringify(publicPath)}`,
  );
}

const caseStudyDeck = extractArrayLiteral(caseStudiesSource, "const CASE_STUDIES: CaseStudy[]");

/* ------------------------------------------------- service → work links -- */

const relationsSource = read("lib/relations.ts");
const serviceWorkStart = relationsSource.indexOf("const SERVICE_WORK: Record<string, string[]>");
if (serviceWorkStart === -1) throw new Error("SERVICE_WORK not found in relations.ts");

const objOpen = relationsSource.indexOf("{", serviceWorkStart);
let objDepth = 0;
let serviceWorkLiteral = null;
for (let i = objOpen; i < relationsSource.length; i += 1) {
  if (relationsSource[i] === "{") objDepth += 1;
  else if (relationsSource[i] === "}") {
    objDepth -= 1;
    if (objDepth === 0) {
      serviceWorkLiteral = relationsSource.slice(objOpen, i + 1);
      break;
    }
  }
}
const serviceWork = runInNewContext(`(${serviceWorkLiteral})`, Object.create(null), {
  timeout: 5000,
});

/* --------------------------------------------------------------- socials - */

const socialsSource = read("lib/socials.ts");
const socials = [...socialsSource.matchAll(/label:\s*"([^"]+)",\s*href:\s*"([^"]+)",\s*icon:\s*(\w+)/g)].map(
  ([, label, href, icon]) => ({ label, href, icon }),
);

/* ------------------------------------------ the pure data modules ------- */

/*
 * These five are plain TypeScript data with no imports, so their array literals
 * evaluate directly once the type annotations are gone.
 *
 * `CASE_STUDY_DETAILS` is the exception: its screenshot lists are produced by a
 * local `shots(folder, files)` helper rather than written out, so the same
 * helper is supplied to the evaluation context. Reimplementing it here keeps
 * the extraction faithful to what the site actually renders.
 */
const shotsHelper = (folder, files) =>
  files.map(([file, alt, fit, lead]) => ({
    src: `/case-studies/optimized/${folder}/${file}`,
    alt,
    fit,
    lead,
  }));

function extractWithContext(source, declaration, context = {}) {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`Declaration not found: ${declaration}`);

  const equalsIndex = source.indexOf("=", start);
  const openIndex = source.indexOf("[", equalsIndex);

  let depth = 0;
  let inString = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString) {
      if (char === "\\") escaped = true;
      else if (char === inString) inString = null;
      continue;
    }
    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }
    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        const literal = source
          .slice(openIndex, i + 1)
          .replace(/\s+as\s+const\b/g, "")
          .replace(/\s+as\s+\w+/g, "");
        return runInNewContext(`(${literal})`, { ...context }, { timeout: 10000 });
      }
    }
  }

  throw new Error(`Unterminated array literal for: ${declaration}`);
}

const caseStudyDetails = extractWithContext(
  read("lib/case-study-details.ts"),
  "const CASE_STUDY_DETAILS: CaseStudyDetail[]",
  { shots: shotsHelper },
);

const services = extractArrayLiteral(read("lib/services.ts"), "const SERVICES: Service[]");
const industries = extractArrayLiteral(read("lib/industries.ts"), "const INDUSTRIES: Industry[]");

const officesSource = read("lib/offices.ts");
const offices = extractArrayLiteral(officesSource, "const OFFICES: Office[]");
const deliveryCountries = extractArrayLiteral(officesSource, "const DELIVERY_COUNTRIES");

const posts = extractArrayLiteral(read("lib/posts.ts"), "const POSTS: Post[]");

/* ---------------------------------------------------------- write it out - */

const snapshot = {
  generatedAt: new Date().toISOString(),
  note:
    "Extracted from the hardcoded website content by scripts/extract-web-content.mjs. " +
    "The database is the source of truth once seeded; this file records what was imported.",
  clients,
  testimonials,
  leaders,
  stats,
  caseStudyDeck,
  caseStudyDetails,
  services,
  industries,
  offices,
  deliveryCountries,
  posts,
  serviceWork,
  socials,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log("Extracted to", outPath);
console.log({
  clients: clients.length,
  testimonials: testimonials.length,
  leaders: leaders.length,
  stats: stats.length,
  caseStudyDeck: caseStudyDeck.length,
  caseStudyDetails: caseStudyDetails.length,
  services: services.length,
  industries: industries.length,
  offices: offices.length,
  deliveryCountries: deliveryCountries.length,
  posts: posts.length,
  servicePractices: Object.keys(serviceWork).length,
  socials: socials.length,
});
