# Funavry website review

Reviewed on 9 October 2026. This is an assessment and a proposed implementation scope, not an approval to change the website.

## Project map

| Area | Purpose | Important files and folders |
| --- | --- | --- |
| Root | npm workspace orchestration | `package.json`, `package-lock.json`, `README.md`, `docs/SECURITY.md` |
| `apps/web` | Public Next.js App Router site, normally port 3000 | `src/app`, `src/components`, `src/lib`, `public`, `scripts`, `next.config.mjs`, `tailwind.config.ts` |
| `apps/admin` | Next.js CMS, normally port 3001 | Dashboard routes, entity editors, resource tables, authentication/query providers, API client |
| `apps/api` | NestJS content API backed by MySQL, normally port 4000 | Resource modules, shared guards/interceptors/filters, environment configuration, TypeORM entities, migrations, seeds and media storage drivers |
| `packages/types` | Shared API DTOs, enums and response envelopes | `src/index.ts`, `src/dto`, `src/enums.ts`, generated `dist` |
| Root `src/app/page.tsx` | Older homepage implementation | It is outside the active `apps/web` application. Do not use it as the source for current website changes. |

The public app contains 11 page entry points: home, About, Contact, Careers, Life at Funavry, Blog, case-study index and detail, service detail, industry detail, and the mockup lab. `/services` and `/industries` redirect to homepage sections. Metadata routes provide sitemap, robots, and social preview images; `/api/revalidate` handles CMS invalidation.

The 91 files under public-site `src/components` group into shared UI primitives, homepage/company sections, portfolio components, service components, careers, and life/culture. Some components are retained alternative implementations. For example, the homepage currently uses `CapabilitiesOS` and `HomeWork`; editing an older capabilities or work component may have no visible effect.

The admin covers case studies, services, industries, posts, testimonials, leadership, team, offices, clients, technologies, statistics, socials, media, audit logs, users and settings. The API has 13 module entry points: auth, users, services, industries, case studies, posts, people, organization, media, settings, audit, health and revalidation.

## Data and rendering

Public pages fetch CMS data on the server through `src/lib/api.ts`. Adapters turn shared DTOs into existing component shapes. `getChrome()` gathers services, industries, offices, delivery countries and socials for navigation/footer use. Tagged caching and API-triggered revalidation support publishing without a site redeploy.

The public app also has a CMS snapshot fallback. Production without an API URL reads that snapshot directly; configured environments can use it when API calls fail. This is part of existing availability behavior and must be preserved.

Content is not entirely CMS-controlled. Service-specific hero/expertise/approach overrides are embedded in `services/[slug]/page.tsx`, job listings live in `src/lib/careers.ts`, and other design/content constants remain local. Do not promise that every copy change can be made through the admin.

## Components and styling

The site uses React, Tailwind CSS 3, Lucide icons, Framer Motion, Lenis, and Next Image. Tailwind centralizes paper/ink/azure/amber/steel colors, Urbanist/monospace typography, clamped display sizes, and container widths. `globals.css` adds grids, focus rings, motion, mockup effects and mobile content visibility. The approved approach-card design adds a scoped CSS module.

Useful foundations already exist: semantic main landmarks, a skip link, visible focus styling, mobile stacking, responsive image sizes, reduced-motion handling in several animations, and a shared scroll-lock helper. Preserve these. Some new sections use hard-coded navy/blue values alongside tokens; future consolidation should retain the approved appearance rather than impose a redesign.

## Confirmed findings

| ID | Priority | Finding and evidence | Proposed change |
| --- | --- | --- | --- |
| F1 | High | Contact submission does not deliver a message. `Contact.tsx:62` only prevents default and sets success. `noValidate` at line 311 disables native required/email validation. In the browser, blank fields produced “Inquiry Dispatched” and a promise of a reply. No contact/inquiry controller was found in the API modules reviewed. | Add real validation, pending/error states, and a delivery mechanism. Show success only after delivery is acknowledged. Delivery requires a choice of email/service/CRM destination; an explicitly described email-draft flow is a possible interim option. |
| F2 | High | The root layout sets `alternates.canonical` to `/`. Every one of eight sampled secondary pages inherited `https://www.funavry.com`, including service, industry and case-study details. | Set canonical paths per index/static route and generate canonical paths for detail slugs. Check route-specific social metadata as part of the same change. |
| F3 | High | At 1024×600, the open Services mega-menu had links reaching about 738px. `Nav.tsx:880` gives the panel no viewport height limit or internal scrolling. Its scroll listener dismisses the menu when the page scrolls. | Bound panel height to the available viewport and allow internal scrolling compatible with Lenis. Preserve current menu content and desktop layout. |
| F4 | Medium | Escape does not close the mobile menu: the key handler at `Nav.tsx:640` only closes the mega-menu. Browser verification left “Close menu” expanded after Escape. Mobile locking sets `body.style.overflow` instead of using the existing root/Lenis lock helper. | Close all applicable navigation overlays with Escape; use shared locking and allow the menu's own scroll region to scroll. Add focus containment, restoration and background isolation. |
| F5 | Medium | The homepage's actual drawer is the local `Drawer` in `CapabilitiesOS.tsx`, not `ui/ServiceDrawer.tsx`. Its opening effect locks scrolling but does not move focus. Browser focus remained on the underlying Artificial Intelligence & Automation button after opening. Other shared overlays move initial focus but do not implement complete Tab containment. | Apply consistent dialog focus entry, containment, restoration and background isolation to the active drawer and screenshot lightbox. Keep all links and close behaviors. |
| F6 | Medium | Header Company → Blog has an empty href (`Nav.tsx:73`). On mobile it resolves to the current page. A real `/blog` route exists. Footer Our Entities and three policy links are `#` placeholders. | Route Blog to `/blog`. For unavailable destinations, agree on removal or an honest unavailable state; do not invent policy text or destination pages. |
| F7 | Medium | Three About-page flag images failed to load from localhost API upload URLs. The footer already uses local flags, but `Globe.tsx:411` and `Footprint.tsx:103` use CMS flag URLs directly. | Reuse one local-country flag resolver with a CMS fallback, and verify both components when the API/media server is unavailable. This failure is verified locally, not established for production. |
| F8 | Medium | Technology controls claim tab semantics but have no roving tab index, Arrow/Home/End behavior, or associated tab panel (`TechStack.tsx:589–650`). The purported mobile scroll strip also has unconditional `flex-wrap`. | Complete the tab interaction semantics and choose a deliberate mobile presentation. A single scrollable strip is consistent with the component's stated intent; retain all five domains. |
| F9 | Medium | Industries duplicates the entire slide list (`Industries.tsx:203`) to loop it, exposing 22 industry links for 11 industries in the desktop accessibility tree. | Keep seamless visual looping while exposing one navigable/announced set; ensure keyboard focus can still reach every original industry. |
| F10 | Low | Next Image requests qualities 80, 85 and 88 in several components, while the config allows only 75 and 90. Browser logs confirm quality-85 warnings. The installed Next documentation says component requests are coerced to the nearest allowed quality. | Standardize component qualities against the intended allowlist, preserving screenshot readability. These warnings alone do not establish broken images. |

## Additional opportunities and source-only concerns

- `SmoothScrollProvider` puts a full-screen pointer shield above every control during scrolling and for 150ms afterward. This can swallow a tap on a fixed header or CTA. Review a narrower way to suppress incidental hover without blocking deliberate activation. No performance benefit or regression is quantified in this audit.
- Careers “Apply now” links lead to the general contact form without carrying the selected role, and therefore share F1's delivery problem. Preserve role context if an application flow is approved.
- Carousels pause on hover/focus or under reduced motion, but an explicit persistent pause control would be clearer, particularly on touch devices.
- Public routes have no custom `loading.tsx`, `error.tsx` or `not-found.tsx` files. Assess branded recovery states after essential navigation and form fixes.
- The mobile admin sidebar is translated offscreen instead of hidden/inert; it has no overlay focus/scroll management. Admin form controls use small text that can trigger input zoom on iOS. These are source-review concerns; authenticated admin workflows were not browser-tested.
- The new approach illustrations display regions of the supplied 1.5 MB reference PNG. Separate optimized assets are a possible performance improvement, provided their appearance is preserved. No asset changes are approved by this review.
- Retained component variants and the older root homepage can confuse maintenance. Document active entry points before removing anything. The README also needs updates for snapshot behavior and the existing S3 driver.

## Validation performed and limitations

- Browser-reviewed home, About, Contact, Careers, Life at Funavry, Blog, case-study index, and representative service/industry/case-study details.
- Checked eight secondary pages at 390px; checked home, Contact, work index, service detail and industry detail at 768px and 1440px; checked the homepage at 320px and navigation at 1024×600.
- Sampled layouts had one h1 per page and no page-level horizontal overflow in the inspected rendered DOM. Global overflow hiding and deferred offscreen content mean this is not proof that every element is unclipped. Short-screen menu clipping is separately confirmed.
- Verified mobile Escape behavior, drawer initial focus, canonical URLs, empty-form false success, and local About image failures. No personal data was entered or sent.
- Public TypeScript checking fails with unresolved `@funavry/types`, resulting implicit-any errors in the API adapter, and stale generated references to the removed service/industry index routes. Shared `dist` exists, but the root `node_modules/@funavry/types` workspace link was not present in the inspected environment. Repair dependency linking and regenerate route types before treating type checking as a reliable gate.
- `npm run lint --workspace @funavry/web` fails because its `next lint` command is not supported by the installed CLI. Admin uses the same script. Introduce explicit ESLint configuration and a working command as a separate tooling change.
- No tracked test files were found under the apps/packages search. A production build, performance benchmark, authenticated CMS smoke test and exhaustive content/media audit were not run. No database, publishing, authentication or production configuration was changed.

## Proposed approval batches

**A — Navigation, accessibility, metadata and media reliability:** F2–F5, the existing Blog destination from F6, F7–F10. Preserve layout, page content, URLs, filtering, CMS adapters, cache tags, snapshots, and the already approved approach cards. Agree separately on how to present unavailable footer links.

**B — Contact and career delivery:** F1 plus selected-role context. Choose the actual destination and delivery method first. Keep the current visual form, introduce validation and honest feedback, and verify successful/failed delivery without submitting real inquiries during tests.

**C — Development checks:** repair workspace linking, regenerate route types, replace unsupported lint commands and add focused regression checks. Keep dependency upgrades and cleanup of old implementations outside this batch unless separately approved.

After approval, validate keyboard entry/Tab/Shift+Tab/Escape/focus restoration, nested scrolling, menu access at short heights, tab switching, industry links, filter behavior, contact outcomes, route metadata and media fallback. Recheck 320, 390, 768, 1024 and 1440px layouts and run the repaired type/lint checks. Do not deploy or alter CMS records as part of these UI fixes.

No new website code was changed during this review. The earlier approved approach-card edits remain intact.
