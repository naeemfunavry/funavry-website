"use client";

import { use } from "react";

import { LeaderEditor } from "@/components/editors/leader-editor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <LeaderEditor id={id} />;
}
