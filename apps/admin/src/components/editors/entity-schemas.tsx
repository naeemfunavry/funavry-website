"use client";

import { ContentStatus, MediaPurpose, PostKind } from "@funavry/types";

import type { EntityEditorProps, FormValues } from "./entity-editor";

/** Reads a nullable string off a loaded record. */
const str = (value: unknown): string => (typeof value === "string" ? value : "");

/** An empty string means "clear this optional field", not "leave it". */
const orNull = (value: unknown): string | null => {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
};

const media = (value: unknown) =>
  value && typeof value === "object" ? (value as FormValues["x"]) : null;

type Schema = Omit<EntityEditorProps, "id">;

/* ================================================================= posts == */

export const postSchema: Schema = {
  resource: "posts",
  listHref: "/dashboard/posts",
  eyebrow: "Editorial",
  singular: "Post",
  publicPath: (v) => `/blog/${v.slug}`,
  defaults: {
    slug: "",
    title: "",
    kind: PostKind.BLOG,
    excerpt: "",
    body: "",
    displayDate: "",
    externalUrl: "",
    featured: false,
    readingMinutes: "",
    image: null,
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    slug: str(r.slug),
    title: str(r.title),
    kind: str(r.kind) || PostKind.BLOG,
    excerpt: str(r.excerpt),
    body: str(r.body),
    displayDate: str(r.date),
    externalUrl: str(r.externalUrl),
    featured: Boolean(r.featured),
    readingMinutes: r.readingMinutes === null ? "" : String(r.readingMinutes),
    image: media(r.image),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    slug: v.slug,
    title: v.title,
    kind: v.kind,
    excerpt: v.excerpt,
    body: orNull(v.body),
    displayDate: orNull(v.displayDate),
    externalUrl: orNull(v.externalUrl),
    featured: v.featured,
    readingMinutes: v.readingMinutes ? Number(v.readingMinutes) : null,
    imageId: (v.image as { id?: string } | null)?.id ?? null,
    status: v.status,
  }),
  sections: [
    {
      title: "The piece",
      fields: [
        { kind: "text", name: "title", label: "Title", required: true, half: true, maxLength: 255 },
        {
          kind: "slug",
          name: "slug",
          label: "Slug",
          required: true,
          half: true,
          maxLength: 160,
          hint: "Lower-case words joined by hyphens.",
        },
        {
          kind: "select",
          name: "kind",
          label: "Kind",
          half: true,
          options: [
            { value: PostKind.BLOG, label: "Blog" },
            { value: PostKind.NEWS, label: "News" },
            { value: PostKind.CASE_NOTE, label: "Case Note" },
          ],
        },
        {
          kind: "text",
          name: "displayDate",
          label: "Date",
          half: true,
          placeholder: "2026-03-14",
          hint: "Leave empty and the site renders “Coming soon”. No date is invented for an unpublished piece.",
        },
        {
          kind: "textarea",
          name: "excerpt",
          label: "Excerpt",
          required: true,
          rows: 3,
          maxLength: 1000,
        },
        {
          kind: "textarea",
          name: "body",
          label: "Body",
          rows: 12,
          hint: "Leave empty while this is only a slot.",
        },
      ],
    },
    {
      title: "Presentation",
      fields: [
        { kind: "media", name: "image", label: "Hero image", purpose: MediaPurpose.POST_HERO },
        {
          kind: "checkbox",
          name: "featured",
          label: "Feature on the landing deck",
          hint: "The one post the landing page blows up into its 2×2 lead tile.",
        },
        {
          kind: "text",
          name: "externalUrl",
          label: "External URL",
          half: true,
          hint: "Set only if the piece lives elsewhere.",
        },
        {
          kind: "number",
          name: "readingMinutes",
          label: "Reading time (minutes)",
          half: true,
        },
      ],
    },
  ],
};

/* ============================================================ industries == */

export const industrySchema: Schema = {
  resource: "industries",
  listHref: "/dashboard/industries",
  eyebrow: "Work",
  singular: "Industry",
  titleField: "name",
  publicPath: (v) => `/industries/${v.slug}`,
  defaults: {
    slug: "",
    name: "",
    description: "",
    proof: "",
    image: null,
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    slug: str(r.slug),
    name: str(r.name),
    description: str(r.description),
    proof: str(r.proof),
    image: media(r.image),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    slug: v.slug,
    name: v.name,
    description: v.description,
    proof: v.proof,
    imageId: (v.image as { id?: string } | null)?.id ?? null,
    status: v.status,
  }),
  sections: [
    {
      title: "Industry",
      fields: [
        { kind: "text", name: "name", label: "Name", required: true, half: true, maxLength: 160 },
        { kind: "slug", name: "slug", label: "Slug", required: true, half: true, maxLength: 140 },
        {
          kind: "textarea",
          name: "description",
          label: "Card description",
          required: true,
          rows: 2,
          maxLength: 320,
          hint: "Two lines on the card. Anything longer is clipped, so write it to fit.",
        },
        {
          kind: "text",
          name: "proof",
          label: "Proof",
          maxLength: 255,
          hint: "Client names shown as proof, e.g. “Mayo Clinic · CitiMed”.",
        },
        {
          kind: "media",
          name: "image",
          label: "Cover image",
          purpose: MediaPurpose.INDUSTRY_COVER,
        },
      ],
    },
  ],
};

/* =========================================================== testimonials == */

export const testimonialSchema: Schema = {
  resource: "testimonials",
  listHref: "/dashboard/testimonials",
  eyebrow: "Editorial",
  singular: "Testimonial",
  titleField: "author",
  defaults: {
    quote: "",
    author: "",
    role: "",
    company: "",
    avatar: null,
    pending: true,
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    quote: str(r.quote),
    author: str(r.author),
    role: str(r.role),
    company: str(r.company),
    avatar: media(r.avatar),
    pending: Boolean(r.pending),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    quote: v.quote,
    author: v.author,
    role: v.role,
    company: v.company,
    avatarId: (v.avatar as { id?: string } | null)?.id ?? null,
    pending: v.pending,
    status: v.status,
  }),
  sections: [
    {
      title: "The quote",
      fields: [
        {
          kind: "textarea",
          name: "quote",
          label: "Quote",
          required: true,
          rows: 4,
          maxLength: 2000,
        },
        { kind: "text", name: "author", label: "Author", required: true, half: true },
        { kind: "text", name: "role", label: "Role", required: true, half: true },
        { kind: "text", name: "company", label: "Company", required: true, half: true },
        {
          kind: "media",
          name: "avatar",
          label: "Portrait",
          purpose: MediaPurpose.TESTIMONIAL_AVATAR,
        },
      ],
    },
    {
      title: "Approval",
      description:
        "An unapproved quote renders on the site with a Placeholder badge, so sample copy can never be mistaken for a real endorsement.",
      fields: [
        {
          kind: "checkbox",
          name: "pending",
          label: "Still awaiting written client approval",
          hint: "Clear this only once the wording has been approved in writing.",
        },
      ],
    },
  ],
};

/* ================================================================ clients == */

export const clientSchema: Schema = {
  resource: "clients",
  listHref: "/dashboard/clients",
  eyebrow: "Company",
  singular: "Client",
  titleField: "name",
  defaults: {
    slug: "",
    name: "",
    logo: null,
    websiteUrl: "",
    isPartner: false,
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    slug: str(r.slug),
    name: str(r.name),
    logo: media(r.logo),
    websiteUrl: str(r.websiteUrl),
    isPartner: Boolean(r.isPartner),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    slug: v.slug,
    name: v.name,
    logoId: (v.logo as { id?: string } | null)?.id ?? null,
    websiteUrl: orNull(v.websiteUrl),
    isPartner: v.isPartner,
    status: v.status,
  }),
  sections: [
    {
      title: "The mark",
      fields: [
        {
          kind: "text",
          name: "name",
          label: "Name",
          required: true,
          half: true,
          maxLength: 200,
          hint: "Read off the artwork, not off the filename.",
        },
        { kind: "slug", name: "slug", label: "Slug", required: true, half: true },
        { kind: "media", name: "logo", label: "Logo", purpose: MediaPurpose.CLIENT_LOGO },
        { kind: "text", name: "websiteUrl", label: "Website", half: true },
        {
          kind: "checkbox",
          name: "isPartner",
          label: "This is a partner, not just a client",
        },
      ],
    },
  ],
};

/* =========================================================== technologies == */

export const technologySchema: Schema = {
  resource: "technologies",
  listHref: "/dashboard/technologies",
  eyebrow: "Company",
  singular: "Technology",
  titleField: "name",
  defaults: {
    slug: "",
    name: "",
    category: "",
    iconSlug: "",
    logo: null,
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    slug: str(r.slug),
    name: str(r.name),
    category: str(r.category),
    iconSlug: str(r.iconSlug),
    logo: media(r.logo),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    iconSlug: orNull(v.iconSlug),
    logoId: (v.logo as { id?: string } | null)?.id ?? null,
    status: v.status,
  }),
  sections: [
    {
      title: "Technology",
      fields: [
        { kind: "text", name: "name", label: "Name", required: true, half: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, half: true },
        {
          kind: "text",
          name: "category",
          label: "Category",
          required: true,
          half: true,
          hint: "The strip's row label, e.g. “AI/ML”.",
        },
        {
          kind: "text",
          name: "iconSlug",
          label: "simple-icons slug",
          half: true,
          hint: "Use this instead of an upload where the mark exists in simple-icons.",
        },
        { kind: "media", name: "logo", label: "Logo", purpose: MediaPurpose.TECH_LOGO },
      ],
    },
  ],
};

/* ================================================================== stats == */

export const statSchema: Schema = {
  resource: "stats",
  listHref: "/dashboard/stats",
  eyebrow: "Company",
  singular: "Stat",
  titleField: "label",
  defaults: {
    key: "",
    value: "",
    label: "",
    group: "about",
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    key: str(r.key),
    value: str(r.value),
    label: str(r.label),
    group: str(r.group) || "about",
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    key: v.key,
    value: v.value,
    label: v.label,
    group: v.group,
    status: v.status,
  }),
  sections: [
    {
      title: "Figure",
      description:
        "These are approved company facts, shared by the About page, the home Proof section and the footer. A change lands on all three at once.",
      fields: [
        {
          kind: "text",
          name: "value",
          label: "Value",
          required: true,
          half: true,
          placeholder: "500+",
        },
        {
          kind: "text",
          name: "label",
          label: "Label",
          required: true,
          half: true,
          placeholder: "Projects delivered",
        },
        {
          kind: "slug",
          name: "key",
          label: "Key",
          required: true,
          half: true,
          hint: "Lower-case letters, digits and underscores.",
        },
        {
          kind: "select",
          name: "group",
          label: "Shown on",
          half: true,
          options: [
            { value: "about", label: "About page" },
            { value: "proof", label: "Home — Proof section" },
            { value: "footer", label: "Footer" },
          ],
        },
      ],
    },
  ],
};

/* =========================================================== social links == */

export const socialLinkSchema: Schema = {
  resource: "social-links",
  listHref: "/dashboard/social-links",
  eyebrow: "Company",
  singular: "Social link",
  titleField: "label",
  defaults: { label: "", url: "", icon: "", status: ContentStatus.DRAFT },
  fromRecord: (r) => ({
    label: str(r.label),
    url: str(r.url),
    icon: str(r.icon),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({ label: v.label, url: v.url, icon: v.icon, status: v.status }),
  sections: [
    {
      title: "Channel",
      fields: [
        { kind: "text", name: "label", label: "Label", required: true, half: true },
        {
          kind: "text",
          name: "icon",
          label: "Icon",
          required: true,
          half: true,
          placeholder: "Linkedin",
          hint: "A lucide-react icon name, resolved by the site.",
        },
        {
          kind: "text",
          name: "url",
          label: "URL",
          required: true,
          hint: "Must be https.",
        },
      ],
    },
  ],
};

/* ============================================================ team member == */

export const teamMemberSchema: Schema = {
  resource: "team",
  listHref: "/dashboard/team",
  eyebrow: "People",
  singular: "Team member",
  titleField: "name",
  defaults: {
    slug: "",
    name: "",
    role: "",
    department: "",
    initials: "",
    photo: null,
    bio: "",
    linkedinUrl: "",
    status: ContentStatus.DRAFT,
  },
  fromRecord: (r) => ({
    slug: str(r.slug),
    name: str(r.name),
    role: str(r.role),
    department: str(r.department),
    initials: str(r.initials),
    photo: media(r.photo),
    bio: str(r.bio),
    linkedinUrl: str(r.linkedinUrl),
    status: str(r.status) || ContentStatus.DRAFT,
  }),
  toBody: (v) => ({
    slug: v.slug,
    name: v.name,
    role: v.role,
    department: orNull(v.department),
    initials: String(v.initials ?? "").toUpperCase(),
    photoId: (v.photo as { id?: string } | null)?.id ?? null,
    bio: orNull(v.bio),
    linkedinUrl: orNull(v.linkedinUrl),
    status: v.status,
  }),
  sections: [
    {
      title: "Person",
      fields: [
        { kind: "text", name: "name", label: "Name", required: true, half: true },
        { kind: "slug", name: "slug", label: "Slug", required: true, half: true },
        { kind: "text", name: "role", label: "Role", required: true, half: true },
        { kind: "text", name: "department", label: "Department", half: true },
        {
          kind: "text",
          name: "initials",
          label: "Initials",
          required: true,
          half: true,
          maxLength: 4,
          hint: "Upper-case. Shown until a portrait is supplied, so the card holds its space.",
        },
        { kind: "text", name: "linkedinUrl", label: "LinkedIn", half: true },
        { kind: "media", name: "photo", label: "Portrait", purpose: MediaPurpose.TEAM_PORTRAIT },
        { kind: "textarea", name: "bio", label: "Bio", rows: 4 },
      ],
    },
  ],
};
