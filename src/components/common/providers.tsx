"use client";

import type React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

