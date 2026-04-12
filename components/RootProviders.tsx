"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
