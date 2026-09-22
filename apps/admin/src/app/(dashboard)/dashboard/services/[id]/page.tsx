"use client";

import { use } from "react";

import { ServiceEditor } from "@/components/editors/service-editor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <ServiceEditor id={id} />;
}
