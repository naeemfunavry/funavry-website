"use client";

import { EntityEditor } from "@/components/editors/entity-editor";
import { statSchema } from "@/components/editors/entity-schemas";

export default function Page() {
  return <EntityEditor {...statSchema} />;
}
