"use client";

import { ContentStatus, type MediaAsset, MediaPurpose, type Office } from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Save } from "lucide-react";
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
import { slugify } from "@/lib/utils";

export function OfficeEditor({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [form, setForm] = useState({
    slug: "",
    city: "",
    country: "",
    role: "",
    blurb: "",
    longitude: "",
    latitude: "",
    isHeadquarters: false,
    email: "",
    phone: "",
    status: ContentStatus.DRAFT,
    addressLines: [] as string[],
    flag: null as MediaAsset | { id: string; url: string; alt: string } | null,
  });
  const [version, setVersion] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useQuery({
    queryKey: ["offices", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const office = await api.get<Office>(`/offices/${id}`);

      setForm({
        slug: office.slug,
        city: office.city,
        country: office.country,
        role: office.role,
        blurb: office.blurb,
        longitude: String(office.location.lon),
        latitude: String(office.location.lat),
        isHeadquarters: office.isHeadquarters,
        email: office.email ?? "",
        phone: office.phone ?? "",
        status: office.status,
        addressLines: office.addressLines,
        flag: office.flag,
      });

      setVersion((office as unknown as { version?: number }).version);
      setLoaded(true);
      return office;
    },
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        slug: form.slug,
        city: form.city,
        country: form.country,
        role: form.role,
        blurb: form.blurb,
        longitude: Number(form.longitude),
        latitude: Number(form.latitude),
        isHeadquarters: form.isHeadquarters,
        email: form.email || null,
        phone: form.phone || null,
        status: form.status,
        addressLines: form.addressLines.filter(Boolean),
        flagId: form.flag?.id ?? null,
        ...(isNew ? {} : { expectedVersion: version }),
      };

      return isNew
        ? api.post<Office>("/offices", body)
        : api.patch<Office>(`/offices/${id}`, body);
    },
    onSuccess: (saved) => {
      toast.success(isNew ? "Office created" : "Saved");
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: ["offices"] });
      if (isNew) router.replace(`/dashboard/offices/${saved.id}`);
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

  const lat = Number(form.latitude);
  const lon = Number(form.longitude);
  const coordsValid =
    Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

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
          href="/dashboard/offices"
          className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" />
          All locations
        </Link>
      </div>

      <PageHeader
        eyebrow="Company"
        title={isNew ? "New location" : form.city || "Untitled"}
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
        <FormSection title="Office">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="City"
              name="city"
              required
              value={form.city}
              error={errors.city}
              onChange={(value) => {
                set("city", value);
                if (isNew && !form.slug) set("slug", slugify(value));
              }}
              hint="Unique — it heads each footer block and labels the globe marker."
            />
            <TextField
              label="Country"
              name="country"
              required
              value={form.country}
              error={errors.country}
              onChange={(value) => set("country", value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Slug"
              name="slug"
              required
              mono
              value={form.slug}
              error={errors.slug}
              onChange={(value) => set("slug", value)}
            />
            <TextField
              label="Role"
              name="role"
              required
              value={form.role}
              error={errors.role}
              onChange={(value) => set("role", value)}
              hint="e.g. “Engineering & Delivery Center”."
            />
          </div>

          <TextArea
            label="Blurb"
            name="blurb"
            required
            rows={2}
            maxLength={320}
            value={form.blurb}
            error={errors.blurb}
            onChange={(value) => set("blurb", value)}
            hint="The one-line caption the About footprint cards print."
          />

          <CheckboxField
            name="isHeadquarters"
            label="This is the headquarters"
            checked={form.isHeadquarters}
            onChange={(value) => set("isHeadquarters", value)}
          />
        </FormSection>

        <FormSection
          title="Position on the globe"
          description="The office's real city, not a country centroid. The Capabilities globe projects this to place its marker and picks it as a camera target — a centroid for the USA would land in Kansas rather than on the coast the office is actually on."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Latitude"
              name="latitude"
              required
              mono
              value={form.latitude}
              error={errors.latitude}
              onChange={(value) => set("latitude", value)}
              placeholder="33.69"
            />
            <TextField
              label="Longitude"
              name="longitude"
              required
              mono
              value={form.longitude}
              error={errors.longitude}
              onChange={(value) => set("longitude", value)}
              placeholder="73.04"
            />
          </div>

          {coordsValid ? (
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs text-azure-ink underline-offset-2 hover:underline"
            >
              <MapPin className="h-3 w-3" />
              Check this pin on a map before saving
            </a>
          ) : (
            <p className="text-xs text-danger">
              Those coordinates are not valid. Latitude is −90 to 90, longitude −180 to 180.
            </p>
          )}
        </FormSection>

        <FormSection title="Contact">
          <MediaPicker
            label="Flag"
            purpose={MediaPurpose.OFFICE_FLAG}
            value={form.flag}
            onChange={(asset) => set("flag", asset)}
          />

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
              label="Phone"
              name="phone"
              value={form.phone}
              error={errors.phone}
              onChange={(value) => set("phone", value)}
            />
          </div>

          <div>
            <p className="field-label">Postal address</p>
            <RepeatableList
              items={form.addressLines}
              onChange={(items) => set("addressLines", items)}
              newItem={() => ""}
              addLabel="Add line"
              max={8}
              emptyLabel="One entry per printed line of the address."
              renderItem={(item, index, update) => (
                <input
                  value={item}
                  onChange={(e) => update(e.target.value)}
                  aria-label={`Address line ${index + 1}`}
                  className="input"
                />
              )}
            />
          </div>

          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={(value) => set("status", value)}
            options={STATUS_OPTIONS}
          />
        </FormSection>
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-line bg-paper/90 py-3 backdrop-blur-sm">
        <Link href="/dashboard/offices" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={mutation.isPending || !coordsValid} className="btn-primary">
          {mutation.isPending ? (
            <Spinner className="border-paper-white/40 border-t-paper-white" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save location
        </button>
      </div>
    </form>
  );
}
