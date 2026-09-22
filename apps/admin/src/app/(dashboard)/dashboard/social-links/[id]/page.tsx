"use client";

import { use } from "react";

import { EntityEditor } from "@/components/editors/entity-editor";
import { socialLinkSchema } from "@/components/editors/entity-schemas";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <EntityEditor {...socialLinkSchema} id={id} />;
}
