"use client";

import { EntityEditor } from "@/components/editors/entity-editor";
import { industrySchema } from "@/components/editors/entity-schemas";

export default function Page() {
  return <EntityEditor {...industrySchema} />;
}
