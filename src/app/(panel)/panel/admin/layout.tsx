import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("ADMIN");
  return children;
}
