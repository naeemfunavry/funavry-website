"use client";

import {
  type CaseStudyDetail,
  CaseStudyFrame,
  CaseStudySurface,
  ContentStatus,
  DeliveryPhase,
  type Industry,
  type MediaAsset,
  MediaPurpose,
} from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { describe } from "@/components/resource/resource-table";
import {
  CheckboxField,
  FormSection,
  SelectField,
  STATUS_OPTIONS,
  TextArea,
  TextField,
} from "@/components/form/fields";
import { MediaPicker } from "@/components/form/media-picker";
import { RepeatableList } from "@/components/form/repeatable-list";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError } from "@/lib/api-client";
import { slugify } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** The editable shape, flattened from the API's read model. */
interface FormState {
  slug: string;
  title: string;
  tagline: string;
  sector: string;
  phase: DeliveryPhase;
  surface: CaseStudySurface;
  frame: CaseStudyFrame;
  summary: string;
  client: string;
  team: string;
  featured: boolean;
  status: ContentStatus;
  introHeading: string;
  intro: string[];
  challengesLead: string;
  resultsLead: string;
  results: string[];
  capabilities: { label: string }[];
  highlights: { value: string; detail: string }[];
  stats: { value: string; label: string }[];
  meta: { label: string; value: string }[];
  challenges: { title: string; challenge: string; solution: string }[];
  image: MediaAsset | { id: string; url: string; alt: string } | null;
  mobileImage: MediaAsset | { id: string; url: string; alt: string } | null;
  industryIds: string[];
}

const EMPTY: FormState = {
  slug: "",
  title: "",
  tagline: "",
  sector: "",
  phase: DeliveryPhase.BUILD,
  surface: CaseStudySurface.APP,
  frame: CaseStudyFrame.WINDOW,
  summary: "",
  client: "",
  team: "",
  featured: false,
  status: ContentStatus.DRAFT,
  introHeading: "",
  intro: [],
  challengesLead: "",
  resultsLead: "",
  results: [],
  capabilities: [],
  highlights: [],
  stats: [],
  meta: [],
  challenges: [],
  image: null,
  mobileImage: null,
  industryIds: [],
};

export function CaseStudyEditor({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [version, setVersion] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: industries } = useQuery({
    queryKey: ["industries", "all"],
    queryFn: () => api.list<Industry>("/industries", { limit: 100 }),
  });

  useQuery({
    queryKey: ["case-studies", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const study = await api.get<CaseStudyDetail>(`/case-studies/${id}`);

      setForm({
        slug: study.slug,
        title: study.title,
        tagline: study.tagline,
        sector: study.sector,
        phase: study.phase,
        surface: study.surface,
        frame: study.frame,
        summary: study.summary,
        client: study.client ?? "",
        team: study.team ?? "",
        featured: study.featured,
        status: study.status,
        introHeading: study.introHeading,
        intro: study.intro,
        challengesLead: study.challengesLead,
        resultsLead: study.resultsLead,
        results: study.results,
        capabilities: study.capabilities.map((c) => ({ label: c.label })),
        highlights: study.highlights.map((h) => ({ value: h.value, detail: h.detail })),
        stats: study.stats.map((s) => ({ value: s.value, label: s.label })),
        meta: study.meta.map((m) => ({ label: m.label, value: m.value })),
        challenges: study.challenges.map((c) => ({
          title: c.title,
          challenge: c.challenge,
          solution: c.solution,
        })),
        image: study.image,
        mobileImage: study.mobileImage,
        industryIds: (industriesToIds(study.industrySlugs, industries?.items) ?? []),
      });

      /* Captured for optimistic concurrency — sent back on save so a second
         editor's work is refused rather than silently overwritten. */
      setVersion((study as unknown as { version?: number }).version);
      setLoaded(true);

      return study;
    },
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        slug: form.slug,
        title: form.title,
        tagline: form.tagline,
        sector: form.sector,
        phase: form.phase,
        surface: form.surface,
        frame: form.frame,
        summary: form.summary,
        client: form.client || null,
        team: form.team || null,
        featured: form.featured,
        status: form.status,
        introHeading: form.introHeading,
        intro: form.intro.filter(Boolean),
        challengesLead: form.challengesLead || null,
        resultsLead: form.resultsLead || null,
        results: form.results.filter(Boolean),
        imageId: form.image?.id ?? null,
        mobileImageId: form.mobileImage?.id ?? null,
        industryIds: form.industryIds,
        capabilities: form.capabilities.map((c, i) => ({ label: c.label, position: i })),
        highlights: form.highlights.map((h, i) => ({ ...h, position: i })),
        stats: form.stats.map((s, i) => ({ ...s, position: i })),
        meta: form.meta.map((m, i) => ({ ...m, position: i })),
        challenges: form.challenges.map((c, i) => ({ ...c, position: i })),
        ...(isNew ? {} : { expectedVersion: version }),
      };

      return isNew
        ? api.post<CaseStudyDetail>("/case-studies", body)
        : api.patch<CaseStudyDetail>(`/case-studies/${id}`, body);
    },
    onSuccess: (saved) => {
      toast.success(isNew ? "Case study created" : "Saved", {
        description:
          saved.status === ContentStatus.PUBLISHED
            ? "The live site has been asked to re-render."
            : "Still in draft — not on funavry.com yet.",
      });
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: ["case-studies"] });
      if (isNew) router.replace(`/dashboard/case-studies/${saved.id}`);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.fields?.length) {
        setErrors(err.fieldErrors);
        toast.error("Some fields need attention", { description: err.message });
      } else {
        toast.error(describe(err));
      }
    },
  });

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="max-w-4xl"
    >
      <div className="mb-4">
        <Link
          href="/dashboard/case-studies"
          className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          All case studies
        </Link>
      </div>

      <PageHeader
        eyebrow="Work"
        title={isNew ? "New case study" : form.title || "Untitled"}
        description={
          isNew
            ? "The brief drives the detail page; the deck fields drive the home page card."
            : undefined
        }
        actions={
          <>
            {!isNew && form.status === ContentStatus.PUBLISHED && (
              <a
                href={`${SITE_URL}/case-studies/${form.slug}`}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </a>
            )}
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? (
                <Spinner className="border-paper-white/40 border-t-paper-white" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </button>
          </>
        }
      />

      <div className="space-y-5">
        {/* ------------------------------------------------------ identity */}
        <FormSection title="Identity" description="What the project is, and where it lives.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              name="title"
              required
              value={form.title}
              error={errors.title}
              onChange={(value) => {
                set("title", value);
                /* Only auto-fill the slug while creating — changing it on an
                   existing study breaks its published URL. */
                if (isNew && !form.slug) set("slug", slugify(value));
              }}
            />

            <TextField
              label="Slug"
              name="slug"
              required
              mono
              value={form.slug}
              error={errors.slug}
              onChange={(value) => set("slug", value)}
              hint={`/case-studies/${form.slug || "…"}`}
            />
          </div>

          <TextArea
            label="Tagline"
            name="tagline"
            required
            rows={2}
            maxLength={320}
            value={form.tagline}
            error={errors.tagline}
            onChange={(value) => set("tagline", value)}
            hint="The one-line “what it is”. The home deck, the index card and the detail hero all print this same string."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Sector"
              name="sector"
              required
              value={form.sector}
              error={errors.sector}
              onChange={(value) => set("sector", value)}
              hint="Stands in for the client name."
            />

            <SelectField
              label="Phase"
              name="phase"
              value={form.phase}
              onChange={(value) => set("phase", value)}
              options={[
                { value: DeliveryPhase.BUILD, label: "Build" },
                { value: DeliveryPhase.AUTOMATE, label: "Automate" },
                { value: DeliveryPhase.OPERATE, label: "Operate" },
              ]}
            />

            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={(value) => set("status", value)}
              options={STATUS_OPTIONS}
            />
          </div>

          <TextArea
            label="Summary"
            name="summary"
            required
            rows={4}
            maxLength={4000}
            value={form.summary}
            error={errors.summary}
            onChange={(value) => set("summary", value)}
          />
        </FormSection>

        {/* ---------------------------------------------------- the deck */}
        <FormSection
          title="Home deck"
          description="How the project is presented on the landing page. Only featured studies appear there."
        >
          <CheckboxField
            name="featured"
            label="Feature on the home page deck"
            checked={form.featured}
            onChange={(value) => set("featured", value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Surface"
              name="surface"
              value={form.surface}
              onChange={(value) => set("surface", value)}
              options={[
                { value: CaseStudySurface.APP, label: "App — signed-in, gets a toolbar" },
                { value: CaseStudySurface.SITE, label: "Site — public, gets browser chrome" },
              ]}
              hint="Who the product was built for. This is a claim about the work, not a style choice."
            />

            <SelectField
              label="Frame"
              name="frame"
              value={form.frame}
              onChange={(value) => set("frame", value)}
              options={[
                { value: CaseStudyFrame.WINDOW, label: "Window" },
                { value: CaseStudyFrame.LAPTOP, label: "Laptop" },
              ]}
              hint="Purely rhythm — a deck where every card wears the same body reads as a template."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Delivery footprint"
              name="client"
              value={form.client}
              onChange={(value) => set("client", value)}
              hint="e.g. “US · UAE · KSA”"
            />
            <TextField
              label="Team"
              name="team"
              value={form.team}
              onChange={(value) => set("team", value)}
              hint="e.g. “10+ Engineers”"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <MediaPicker
              label="Desktop capture"
              purpose={MediaPurpose.CASE_STUDY_CAPTURE}
              value={form.image}
              onChange={(asset) => set("image", asset)}
            />

            <MediaPicker
              label="Mobile capture"
              purpose={MediaPurpose.CASE_STUDY_MOBILE}
              value={form.mobileImage}
              onChange={(asset) => set("mobileImage", asset)}
              hint="Only if the product genuinely shipped a mobile surface. A phone frame on the page is a claim about what was built — never crop the desktop capture to fill this."
            />
          </div>
        </FormSection>

        {/* ------------------------------------------------- capabilities */}
        <FormSection
          title="Capabilities"
          description="What the platform does. Never a metric — this work is not counted."
        >
          <RepeatableList
            items={form.capabilities}
            onChange={(items) => set("capabilities", items)}
            newItem={() => ({ label: "" })}
            addLabel="Add capability"
            max={20}
            emptyLabel="No capabilities listed. The deck's leader-line callouts can only name one of these."
            renderItem={(item, index, update) => (
              <input
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="e.g. No-code inspection forms"
                aria-label={`Capability ${index + 1}`}
                className="input"
                maxLength={160}
              />
            )}
          />
        </FormSection>

        {/* ---------------------------------------------------- highlights */}
        <FormSection
          title="Highlights"
          description="Approved facts from the corporate deck — the one place a metric is allowed. Shown as the floating stat cards."
        >
          <RepeatableList
            items={form.highlights}
            onChange={(items) => set("highlights", items)}
            newItem={() => ({ value: "", detail: "" })}
            addLabel="Add highlight"
            max={10}
            renderItem={(item, index, update) => (
              <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <input
                  value={item.value}
                  onChange={(e) => update({ ...item, value: e.target.value })}
                  placeholder="14 Plants"
                  aria-label={`Highlight ${index + 1} value`}
                  className="input font-medium"
                  maxLength={80}
                />
                <input
                  value={item.detail}
                  onChange={(e) => update({ ...item, detail: e.target.value })}
                  placeholder="US + MENA"
                  aria-label={`Highlight ${index + 1} detail`}
                  className="input"
                  maxLength={160}
                />
              </div>
            )}
          />
        </FormSection>

        {/* -------------------------------------------------- detail page */}
        <FormSection title="Detail page" description="The long-form brief at /case-studies/[slug].">
          <TextField
            label="Intro heading"
            name="introHeading"
            value={form.introHeading}
            onChange={(value) => set("introHeading", value)}
            hint="e.g. “What is this platform?”"
          />

          <div>
            <p className="field-label">Intro paragraphs</p>
            <RepeatableList
              items={form.intro}
              onChange={(items) => set("intro", items)}
              newItem={() => ""}
              addLabel="Add paragraph"
              max={20}
              renderItem={(item, index, update) => (
                <textarea
                  value={item}
                  onChange={(e) => update(e.target.value)}
                  rows={3}
                  aria-label={`Intro paragraph ${index + 1}`}
                  className="textarea"
                />
              )}
            />
          </div>

          <div>
            <p className="field-label">Stat strip</p>
            <RepeatableList
              items={form.stats}
              onChange={(items) => set("stats", items)}
              newItem={() => ({ value: "", label: "" })}
              addLabel="Add stat"
              max={10}
              renderItem={(item, index, update) => (
                <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                  <input
                    value={item.value}
                    onChange={(e) => update({ ...item, value: e.target.value })}
                    placeholder="10"
                    aria-label={`Stat ${index + 1} value`}
                    className="input font-medium"
                  />
                  <input
                    value={item.label}
                    onChange={(e) => update({ ...item, label: e.target.value })}
                    placeholder="Facilities · North America"
                    aria-label={`Stat ${index + 1} label`}
                    className="input"
                  />
                </div>
              )}
            />
          </div>

          <div>
            <p className="field-label">Project meta</p>
            <RepeatableList
              items={form.meta}
              onChange={(items) => set("meta", items)}
              newItem={() => ({ label: "", value: "" })}
              addLabel="Add row"
              max={20}
              emptyLabel="Confirmed rows only — omit anything the brief marks as unconfirmed rather than guessing."
              renderItem={(item, index, update) => (
                <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                  <input
                    value={item.label}
                    onChange={(e) => update({ ...item, label: e.target.value })}
                    placeholder="Industry"
                    aria-label={`Meta ${index + 1} label`}
                    className="input"
                  />
                  <input
                    value={item.value}
                    onChange={(e) => update({ ...item, value: e.target.value })}
                    placeholder="Healthcare & Life Sciences"
                    aria-label={`Meta ${index + 1} value`}
                    className="input"
                  />
                </div>
              )}
            />
          </div>
        </FormSection>

        {/* ---------------------------------------------------- challenges */}
        <FormSection title="Challenges & solutions">
          <TextArea
            label="Challenges lead-in"
            name="challengesLead"
            rows={2}
            value={form.challengesLead}
            onChange={(value) => set("challengesLead", value)}
          />

          <RepeatableList
            items={form.challenges}
            onChange={(items) => set("challenges", items)}
            newItem={() => ({ title: "", challenge: "", solution: "" })}
            addLabel="Add challenge"
            max={20}
            renderItem={(item, index, update) => (
              <div className="space-y-2">
                <input
                  value={item.title}
                  onChange={(e) => update({ ...item, title: e.target.value })}
                  placeholder="Fragmented practice & patient data"
                  aria-label={`Challenge ${index + 1} title`}
                  className="input font-medium"
                />
                <textarea
                  value={item.challenge}
                  onChange={(e) => update({ ...item, challenge: e.target.value })}
                  placeholder="The challenge…"
                  rows={2}
                  aria-label={`Challenge ${index + 1} problem`}
                  className="textarea"
                />
                <textarea
                  value={item.solution}
                  onChange={(e) => update({ ...item, solution: e.target.value })}
                  placeholder="What was built…"
                  rows={2}
                  aria-label={`Challenge ${index + 1} solution`}
                  className="textarea"
                />
              </div>
            )}
          />
        </FormSection>

        {/* ------------------------------------------------------- results */}
        <FormSection title="Results">
          <TextArea
            label="Results lead-in"
            name="resultsLead"
            rows={2}
            value={form.resultsLead}
            onChange={(value) => set("resultsLead", value)}
          />

          <RepeatableList
            items={form.results}
            onChange={(items) => set("results", items)}
            newItem={() => ""}
            addLabel="Add result"
            max={30}
            renderItem={(item, index, update) => (
              <textarea
                value={item}
                onChange={(e) => update(e.target.value)}
                rows={2}
                aria-label={`Result ${index + 1}`}
                className="textarea"
              />
            )}
          />
        </FormSection>

        {/* ---------------------------------------------------- industries */}
        <FormSection
          title="Industries"
          description="Which sector pages this project appears on."
        >
          <div className="flex flex-wrap gap-2">
            {industries?.items.map((industry) => {
              const selected = form.industryIds.includes(industry.id);

              return (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() =>
                    set(
                      "industryIds",
                      selected
                        ? form.industryIds.filter((i) => i !== industry.id)
                        : [...form.industryIds, industry.id],
                    )
                  }
                  className={
                    selected
                      ? "badge border-ink bg-ink text-paper-white"
                      : "badge border-line bg-paper-white text-ink-500 hover:border-ink-400"
                  }
                >
                  {industry.name}
                </button>
              );
            })}
          </div>
        </FormSection>
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-line bg-paper/90 py-3 backdrop-blur-sm">
        <Link href="/dashboard/case-studies" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? (
            <Spinner className="border-paper-white/40 border-t-paper-white" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save case study
        </button>
      </div>
    </form>
  );
}

/** The read model returns industry slugs; the write model takes ids. */
function industriesToIds(slugs: string[], available?: Industry[]): string[] {
  if (!available) return [];
  return slugs
    .map((slug) => available.find((i) => i.slug === slug)?.id)
    .filter((id): id is string => Boolean(id));
}
