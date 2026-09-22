"use client";

import { EntityEditor } from "@/components/editors/entity-editor";
import { testimonialSchema } from "@/components/editors/entity-schemas";

export default function Page() {
  return <EntityEditor {...testimonialSchema} />;
}
