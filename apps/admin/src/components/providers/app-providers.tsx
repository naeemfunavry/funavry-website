"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import { createQueryClient } from "@/lib/query-client";

import { AuthProvider } from "./auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  /* Created in state, not at module scope: a module-level client would be
     shared across requests during SSR and leak one user's cache into another's
     render. */
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "!bg-paper-white !border !border-line !text-ink !rounded-none !shadow-panel !font-sans",
              description: "!text-ink-500",
              actionButton: "!bg-ink !text-paper-white !rounded-none",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
