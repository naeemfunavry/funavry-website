"use client";

import { use } from "react";

import { EntityEditor } from "@/components/editors/entity-editor";
import { teamMemberSchema } from "@/components/editors/entity-schemas";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <EntityEditor {...teamMemberSchema} id={id} />;
}
