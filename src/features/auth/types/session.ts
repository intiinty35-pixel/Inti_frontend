import type { UserRole } from "@/shared/config/roles";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalStatus: ApprovalStatus | null;
}

export type Session = SessionUser | null;
