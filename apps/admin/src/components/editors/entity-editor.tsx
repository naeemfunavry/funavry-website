"use client";

import { ContentStatus, type MediaAsset, type MediaPurpose } from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

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
import { describe } from "@/components/resource/resource-table";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError } from "@/lib/api-client";
import { slugify } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type FieldValue = string | number | boolean | string[] | MediaAsset | null;
export type FormValues = Record<string, FieldValue>;

export type FieldSpec =
  | {
      kind: "text" | "slug" | "email" | "url" | "number";
      name: string;
      label: string;
      hint?: string;
      required?: boolean;
      placeholder?: string;
      maxLength?: number;
      /** Half-width in the two-column grid. */
      half?: boolean;
    }
  | {
      kind: "textarea";
      name: string;
      label: string;
      hint?: string;
      required?: boolean;
      rows?: number;
      maxLength?: number;
      half?: boolean;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      hint?: string;
      options: { value: string; label: string }[];
      half?: boolean;
    }
  | {
      kind: "checkbox";
      name: string;
      label: string;
      hint?: string;
    }
  | {
      kind: "media";
      name: string;
      label: string;
      hint?: string;
      purpose: MediaPurpose;
    }
  | {
      kind: "stringList";
      name: string;
      label: string;
      hint?: string;
      addLabel?: string;
      max?: number;
      multiline?: boolean;
    };

export interface EntityEditorProps {
  /** API path segment and query key, e.g. "posts". */
  resource: string;
  /** Where the list lives. */
  listHref: string;
  eyebrow: string;
  singular: string;
  id?: string;
  sections: { title: string; description?: string; fields: FieldSpec[] }[];
  /** Initial values for a new record. */
  defaults: FormValues;
  /** Maps the loaded record onto form values. */
  fromRecord: (record: Record<string, unknown>) => FormValues;
  /** Maps form values onto the request body. */
  toBody: (values: FormValues) => Record<string, unknown>;
  /** Builds the public URL for the "view" link, when the record has one. */
  publicPath?: (values: FormValues) => string;
  /** Which field titles the page. */
  titleField?: string;
  /** Rendered after the generated sections — for anything bespoke. */
  extra?: (values: FormValues, set: (name: string, value: FieldValue) => void) => ReactNode;
  hasStatus?: boolean;
}

/**
 * A form built from a field schema.
 *
 * The same reasoning as the API's CRUD controller factory: eleven of the twelve
 * content types are a flat set of fields, a status and maybe an image, and
 * hand-writing eleven near-identical forms guarantees that one of them quietly
 * omits the optimistic-concurrency version or forgets to invalidate the cache
 * after saving. Case studies keep a bespoke editor because their child
 * collections have real rules; everything else is declared.
 */
export function EntityEditor({
  resource,
  listHref,
  eyebrow,
  singular,
  id,
  sections,
  defaults,
  fromRecord,
  toBody,
  publicPath,
  titleField = "title",
  extra,
  hasStatus = true,
}: EntityEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [values, setValues] = useState<FormValues>(defaults);
  const [version, setVersion] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useQuery({
    queryKey: [resource, id],
    enabled: Boolean(id),
    queryFn: async () => {
      const record = await api.get<Record<string, unknown>>(`/${resource}/${id}`);
      setValues(fromRecord(record));
      setVersion(typeof record.version === "number" ? record.version : undefined);
      setLoaded(true);
      return record;
    },
  });

  const set = (name: string, value: FieldValue) =>
    setValues((v) => ({ ...v, [name]: value }));

  const mutation = useMutation({
    mutationFn: () => {
      const body = { ...toBody(values), ...(isNew ? {} : { expectedVersion: version }) };

      return isNew
        ? api.post<Record<string, unknown>>(`/${resource}`, body)
        : api.patch<Record<string, unknown>>(`/${resource}/${id}`, body);
    },
    onSuccess: (saved) => {
      toast.success(isNew ? `${singular} created` : "Saved", {
        description:
          values.status === ContentStatus.PUBLISHED
            ? "The live site has been asked to re-render."
            : hasStatus
              ? "Still in draft — not on funavry.com yet."
              : undefined,
      });
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: [resource] });

      if (isNew && typeof saved.id === "string") {
        router.replace(`${listHref}/${saved.id}`);
      } else if (typeof saved.version === "number") {
        /* Keep the version in step, so a second save in the same session is not
           rejected as a conflict against the version we loaded with. */
        setVersion(saved.version);
      }
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

  const title = String(values[titleField] ?? "") || `Untitled ${singular.toLowerCase()}`;
  const isPublished = values.status === ContentStatus.PUBLISHED;

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
          href={listHref}
          className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
      </div>

      <PageHeader
        eyebrow={eyebrow}
        title={isNew ? `New ${singular.toLowerCase()}` : title}
        actions={
          <>
            {!isNew && isPublished && publicPath && (
              <a
                href={`${SITE_URL}${publicPath(values)}`}
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
        {sections.map((section) => (
          <FormSection
            key={section.title}
            title={section.title}
            description={section.description}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.name} className={"half" in field && field.half ? "" : "sm:col-span-2"}>
                  {renderField(field, values, set, errors, isNew)}
                </div>
              ))}
            </div>
          </FormSection>
        ))}

        {hasStatus && (
          <FormSection title="Publishing">
            <SelectField
              label="Status"
              name="status"
              value={(values.status as ContentStatus) ?? ContentStatus.DRAFT}
              onChange={(value) => set("status", value)}
              options={STATUS_OPTIONS}
            />
          </FormSection>
        )}

        {extra?.(values, set)}
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-line bg-paper/90 py-3 backdrop-blur-sm">
        <Link href={listHref} className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? (
            <Spinner className="border-paper-white/40 border-t-paper-white" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save {singular.toLowerCase()}
        </button>
      </div>
    </form>
  );
}

function renderField(
  field: FieldSpec,
  values: FormValues,
  set: (name: string, value: FieldValue) => void,
  errors: Record<string, string>,
  isNew: boolean,
): ReactNode {
  const error = errors[field.name];

  switch (field.kind) {
    case "text":
    case "email":
    case "url":
    case "number":
      return (
        <TextField
          label={field.label}
          name={field.name}
          hint={field.hint}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          type={field.kind === "number" ? "number" : field.kind === "email" ? "email" : "text"}
          value={String(values[field.name] ?? "")}
          onChange={(value) => set(field.name, value)}
        />
      );

    case "slug":
      return (
        <TextField
          label={field.label}
          name={field.name}
          hint={field.hint}
          error={error}
          required={field.required}
          mono
          maxLength={field.maxLength}
          value={String(values[field.name] ?? "")}
          onChange={(value) => set(field.name, value)}
        />
      );

    case "textarea":
      return (
        <TextArea
          label={field.label}
          name={field.name}
          hint={field.hint}
          error={error}
          required={field.required}
          rows={field.rows}
          maxLength={field.maxLength}
          value={String(values[field.name] ?? "")}
          onChange={(value) => set(field.name, value)}
        />
      );

    case "select":
      return (
        <SelectField
          label={field.label}
          name={field.name}
          hint={field.hint}
          error={error}
          value={String(values[field.name] ?? field.options[0]?.value ?? "")}
          onChange={(value) => set(field.name, value)}
          options={field.options}
        />
      );

    case "checkbox":
      return (
        <CheckboxField
          name={field.name}
          label={field.label}
          hint={field.hint}
          checked={Boolean(values[field.name])}
          onChange={(checked) => set(field.name, checked)}
        />
      );

    case "media":
      return (
        <MediaPicker
          label={field.label}
          hint={field.hint}
          purpose={field.purpose}
          value={(values[field.name] as MediaAsset | null) ?? null}
          onChange={(asset) => set(field.name, asset)}
        />
      );

    case "stringList": {
      const items = (values[field.name] as string[]) ?? [];

      return (
        <div>
          <p className="field-label">{field.label}</p>
          <RepeatableList
            items={items}
            onChange={(next) => set(field.name, next)}
            newItem={() => ""}
            addLabel={field.addLabel ?? "Add"}
            max={field.max}
            renderItem={(item, index, update) =>
              field.multiline ? (
                <textarea
                  value={item}
                  onChange={(e) => update(e.target.value)}
                  rows={2}
                  aria-label={`${field.label} ${index + 1}`}
                  className="textarea"
                />
              ) : (
                <input
                  value={item}
                  onChange={(e) => update(e.target.value)}
                  aria-label={`${field.label} ${index + 1}`}
                  className="input"
                />
              )
            }
          />
          {field.hint && <p className="mt-1 text-xs text-ink-400">{field.hint}</p>}
        </div>
      );
    }

    default:
      return null;
  }
}

/** Auto-fills a slug from a title while creating, never while editing. */
export function useSlugSync(
  isNew: boolean,
  values: FormValues,
  set: (name: string, value: FieldValue) => void,
) {
  return (titleValue: string) => {
    set("title", titleValue);
    if (isNew && !values.slug) set("slug", slugify(titleValue));
  };
}
