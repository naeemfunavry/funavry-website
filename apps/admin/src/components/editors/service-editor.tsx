"use client";

import {
  type CaseStudySummary,
  ContentStatus,
  DeliveryPhase,
  type ServiceDetail,
  ServiceGroup,
} from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  FormSection,
  SelectField,
  STATUS_OPTIONS,
  TextArea,
  TextField,
} from "@/components/form/fields";
import { RepeatableList } from "@/components/form/repeatable-list";
import { describe } from "@/components/resource/resource-table";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError } from "@/lib/api-client";
import { slugify } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Sub {
  title: string;
  description: string;
}

export function ServiceEditor({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [form, setForm] = useState({
    slug: "",
    number: "",
    title: "",
    group: ServiceGroup.TECH,
    phase: DeliveryPhase.BUILD,
    icon: "",
    summary: "",
    status: ContentStatus.DRAFT,
    subs: [] as Sub[],
    caseStudyIds: [] as string[],
  });
  const [version, setVersion] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: studies } = useQuery({
    queryKey: ["case-studies", "picker"],
    queryFn: () => api.list<CaseStudySummary>("/case-studies", { limit: 100 }),
  });

  useQuery({
    queryKey: ["services", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const service = await api.get<ServiceDetail>(`/services/${id}`);

      setForm({
        slug: service.slug,
        number: service.number,
        title: service.title,
        group: service.group,
        phase: service.phase,
        icon: service.icon,
        summary: service.summary,
        status: service.status,
        subs: service.subs.map((s) => ({ title: s.title, description: s.description })),
        caseStudyIds: (service.caseStudies ?? []).map((c) => c.id),
      });

      setVersion((service as unknown as { version?: number }).version);
      setLoaded(true);
      return service;
    },
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        slug: form.slug,
        number: form.number,
        title: form.title,
        group: form.group,
        phase: form.phase,
        icon: form.icon,
        summary: form.summary,
        status: form.status,
        subs: form.subs.map((s, i) => ({ ...s, position: i })),
        caseStudyIds: form.caseStudyIds,
        ...(isNew ? {} : { expectedVersion: version }),
      };

      return isNew
        ? api.post<ServiceDetail>("/services", body)
        : api.patch<ServiceDetail>(`/services/${id}`, body);
    },
    onSuccess: (saved) => {
      toast.success(isNew ? "Service created" : "Saved");
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      if (isNew) router.replace(`/dashboard/services/${saved.id}`);
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
      className="max-w-3xl"
    >
      <div className="mb-4">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          All services
        </Link>
      </div>

      <PageHeader
        eyebrow="Work"
        title={isNew ? "New service" : form.title || "Untitled"}
        actions={
          <>
            {!isNew && form.status === ContentStatus.PUBLISHED && (
              <a
                href={`${SITE_URL}/services/${form.slug}`}
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
        <FormSection title="Practice">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              name="title"
              required
              value={form.title}
              error={errors.title}
              onChange={(value) => {
                set("title", value);
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
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <TextField
              label="Number"
              name="number"
              required
              mono
              maxLength={2}
              value={form.number}
              error={errors.number}
              onChange={(value) => set("number", value)}
              hint="Two digits."
            />
            <SelectField
              label="Group"
              name="group"
              value={form.group}
              onChange={(value) => set("group", value)}
              options={[
                { value: ServiceGroup.TECH, label: "Technology" },
                { value: ServiceGroup.GBS, label: "GBS" },
              ]}
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
            <TextField
              label="Icon"
              name="icon"
              required
              value={form.icon}
              error={errors.icon}
              onChange={(value) => set("icon", value)}
              hint="lucide-react name."
            />
          </div>

          <TextArea
            label="Summary"
            name="summary"
            required
            rows={3}
            maxLength={2000}
            value={form.summary}
            error={errors.summary}
            onChange={(value) => set("summary", value)}
          />

          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={(value) => set("status", value)}
            options={STATUS_OPTIONS}
          />
        </FormSection>

        <FormSection
          title="Sub-services"
          description="The four practices listed under each service line."
        >
          <RepeatableList
            items={form.subs}
            onChange={(items) => set("subs", items)}
            newItem={() => ({ title: "", description: "" })}
            addLabel="Add sub-service"
            max={12}
            renderItem={(item, index, update) => (
              <div className="space-y-2">
                <input
                  value={item.title}
                  onChange={(e) => update({ ...item, title: e.target.value })}
                  placeholder="AI Solutions & Applications"
                  aria-label={`Sub-service ${index + 1} title`}
                  className="input font-medium"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => update({ ...item, description: e.target.value })}
                  placeholder="Agentic AI, AI agents as a service, enterprise assistants…"
                  rows={2}
                  aria-label={`Sub-service ${index + 1} description`}
                  className="textarea"
                />
              </div>
            )}
          />
        </FormSection>

        <FormSection
          title="Proof"
          description="Which case studies this practice points at. Curated on purpose — the briefs describe deliverables, not practice names, so this cannot be inferred. Order is the order they appear."
        >
          <div className="scrollbar-thin max-h-80 space-y-1 overflow-y-auto">
            {studies?.items.map((study) => {
              const index = form.caseStudyIds.indexOf(study.id);
              const selected = index !== -1;

              return (
                <label
                  key={study.id}
                  className="flex cursor-pointer items-start gap-2.5 px-2 py-1.5 text-sm transition-colors hover:bg-paper-deep/60"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      set(
                        "caseStudyIds",
                        selected
                          ? form.caseStudyIds.filter((i) => i !== study.id)
                          : [...form.caseStudyIds, study.id],
                      )
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{study.title}</span>
                    <span className="block truncate text-xs text-ink-400">{study.sector}</span>
                  </span>
                  {selected && (
                    <span className="shrink-0 font-mono text-micro text-ink-400">
                      #{index + 1}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </FormSection>
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-line bg-paper/90 py-3 backdrop-blur-sm">
        <Link href="/dashboard/services" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? (
            <Spinner className="border-paper-white/40 border-t-paper-white" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save service
        </button>
      </div>
    </form>
  );
}
