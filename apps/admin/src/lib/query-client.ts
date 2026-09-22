"use client";

import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./api-client";

/**
 * The shared query client.
 *
 * `retry` deliberately refuses to retry 4xx responses. A 400 or a 403 is a
 * settled answer — retrying it three times just delays the error the user needs
 * to see and triples the load doing it. Only genuine transport failures and 5xx
 * are worth a second attempt.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
