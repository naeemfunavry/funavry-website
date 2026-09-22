"use client";

import { ContentStatus, type Leader, type MediaAsset, MediaPurpose } from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { initialsOf, slugify } from "@/lib/utils";

export function LeaderEditor({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [form, setForm] = useState({
    slug: "",
    name: "",
    role: "",
    initials: "",
    bio: "",
    email: "",
    linkedinUrl: "",
    isFounder: false,
    isCoFounder: false,
    status: ContentStatus.DRAFT,
    points: [] as string[],
    photo: null as MediaAsset | { id: string; url: string; alt: string } | null,
  });
  const [version, setVersion] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useQuery({
    queryKey: ["leaders", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const leader = await api.get<Leader>(`/leaders/${id}`);

      setForm({
        slug: leader.slug,
        name: leader.name,
        role: leader.role,
        initials: leader.initials,
        bio: leader.bio ?? "",
        email: leader.email ?? "",
        linkedinUrl: leader.linkedinUrl ?? "",
        isFounder: leader.isFounder,
        isCoFounder: leader.isCoFounder,
        status: leader.status,
        points: leader.points.map((p) => p.text),
        photo: leader.photo,
      });

      setVersion((leader as unknown as { version?: number }).version);
      setLoaded(true);
      return leader;
    },
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        slug: form.slug,
        name: form.name,
        role: form.role,
        initials: form.initials.toUpperCase(),
        bio: form.bio || null,
        email: form.email || null,
        linkedinUrl: form.linkedinUrl || null,
        isFounder: form.isFounder,
        isCoFounder: form.isCoFounder,
        status: form.status,
        points: form.points.filter(Boolean),
        photoId: form.photo?.id ?? null,
        ...(isNew ? {} : { expectedVersion: version }),
      };

      return isNew
        ? api.post<Leader>("/leaders", body)
        : api.patch<Leader>(`/leaders/${id}`, body);
    },
    onSuccess: (saved) => {
      toast.success(isNew ? "Profile created" : "Saved");
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: ["leaders"] });
      if (isNew) router.replace(`/dashboard/leadership/${saved.id}`);
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
          href="/dashboard/leadership"
          className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          All leadership
        </Link>
      </div>

      <PageHeader
        eyebrow="People"
        title={isNew ? "New profile" : form.name || "Untitled"}
        actions={
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? (
              <Spinner className="border-paper-white/40 border-t-paper-white" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
        }
      />

      <div className="space-y-5">
        <FormSection title="Person">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              name="name"
              required
              value={form.name}
              error={errors.name}
              onChange={(value) => {
                set("name", value);
                if (isNew && !form.slug) set("slug", slugify(value));
                if (isNew && !form.initials) set("initials", initialsOf(value));
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

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <TextField
              label="Role"
              name="role"
              required
              value={form.role}
              error={errors.role}
              onChange={(value) => set("role", value)}
              hint="As printed, e.g. “Founder & CEO”."
            />
            <TextField
              label="Initials"
              name="initials"
              required
              maxLength={4}
              value={form.initials}
              error={errors.initials}
              onChange={(value) => set("initials", value.toUpperCase())}
              hint="Upper-case."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(value) => set("email", value)}
            />
            <TextField
              label="LinkedIn"
              name="linkedinUrl"
              value={form.linkedinUrl}
              error={errors.linkedinUrl}
              onChange={(value) => set("linkedinUrl", value)}
              hint="Must be https."
            />
          </div>

          <MediaPicker
            label="Portrait"
            purpose={MediaPurpose.TEAM_PORTRAIT}
            value={form.photo}
            onChange={(asset) => set("photo", asset)}
            hint="Until one is supplied the card shows the initials, at the same dimensions — so a real photo drops in with no layout change."
          />

          <TextArea
            label="Bio"
            name="bio"
            rows={4}
            value={form.bio}
            onChange={(value) => set("bio", value)}
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
          title="Standing"
          description="Flags rather than something parsed out of the role line — the role is free text an editor can reword, and the site needs to pick the founders out of the set reliably."
        >
          <CheckboxField
            name="isFounder"
            label="Founder"
            checked={form.isFounder}
            onChange={(value) => set("isFounder", value)}
          />
          <CheckboxField
            name="isCoFounder"
            label="Co-founder"
            checked={form.isCoFounder}
            onChange={(value) => set("isCoFounder", value)}
          />
        </FormSection>

        <FormSection
          title="Card points"
          description="The bullets under the name on the leadership card."
        >
          <RepeatableList
            items={form.points}
            onChange={(items) => set("points", items)}
            newItem={() => ""}
            addLabel="Add point"
            max={10}
            renderItem={(item, index, update) => (
              <input
                value={item}
                onChange={(e) => update(e.target.value)}
                placeholder="20+ years in technology leadership"
                aria-label={`Point ${index + 1}`}
                className="input"
                maxLength={255}
              />
            )}
          />
        </FormSection>
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-line bg-paper/90 py-3 backdrop-blur-sm">
        <Link href="/dashboard/leadership" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? (
            <Spinner className="border-paper-white/40 border-t-paper-white" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save profile
        </button>
      </div>
    </form>
  );
}
