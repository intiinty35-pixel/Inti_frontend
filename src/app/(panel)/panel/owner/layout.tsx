import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  await requireRole("REAL_ESTATE");
  return children;
}
