import type { Subscription } from "@/features/owner/types/plan";

export const CUSTOMER_TRIAL_PLAN_SLUG = "ariz-particular-prueba-30-dias";

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  biography: string | null;
  avatarUrl: string | null;
}

export interface CustomerMembership {
  subscription: Subscription | null;
  trialAvailable: boolean;
  propertyCount: number;
}
