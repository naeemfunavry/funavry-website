"use client";

import { use } from "react";

import { CaseStudyEditor } from "@/components/editors/case-study-editor";

export default function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  /* Next 15+ hands route params as a promise; `use` unwraps it in the client
     component without an effect. */
  const { id } = use(params);

  return <CaseStudyEditor id={id} />;
}
