"use client";

import { EntityEditor } from "@/components/editors/entity-editor";
import { clientSchema } from "@/components/editors/entity-schemas";

export default function Page() {
  return <EntityEditor {...clientSchema} />;
}
