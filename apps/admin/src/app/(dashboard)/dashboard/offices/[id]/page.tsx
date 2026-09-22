"use client";

import { use } from "react";

import { OfficeEditor } from "@/components/editors/office-editor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <OfficeEditor id={id} />;
}
