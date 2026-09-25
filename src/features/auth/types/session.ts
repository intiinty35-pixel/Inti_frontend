import type { UserRole } from "@/shared/config/roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type Session = SessionUser | null;