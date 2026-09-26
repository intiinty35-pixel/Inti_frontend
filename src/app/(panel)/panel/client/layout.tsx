import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  await requireRole("USER");
  return children;
}
