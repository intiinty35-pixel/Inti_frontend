export type SubscriptionStatus = "PENDING_PAYMENT" | "ACTIVE" | "REJECTED" | "EXPIRED";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: string;
  currency: "PEN" | "USD";
  durationDays: number;
  propertyLimit: number;
  projectLimit: number;
  features: string[];
  isFree: boolean;
  isDefault: boolean;
  highlight: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  receiptUrl: string | null;
  rejectionReason: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  plan: Plan;
}
