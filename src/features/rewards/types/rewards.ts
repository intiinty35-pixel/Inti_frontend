export type IncentiveStatus = "ACTIVE" | "INACTIVE";

export type RedemptionStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED" | "CANCELLED";

export interface Incentive {
  id: string;
  name: string;
  description: string;
  promotion?: string | null;
  imageUrl?: string | null;
  publicId?: string | null;
  pointsRequired: number;
  stock: number;
  status: IncentiveStatus;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveListResponse {
  items: Incentive[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Redemption {
  id: string;
  referrerId: string;
  referralCode: string;
  incentiveId: string;
  incentiveName: string;
  incentiveImageUrl?: string | null;
  pointsSpent: number;
  status: RedemptionStatus;
  requestedAt: string;
  processedAt?: string | null;
  processedById?: string | null;
  deliveredAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface RedemptionWithDetails extends Redemption {
  referrer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    code: string;
  };
  processedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  pointMovements?: Array<{
    id: string;
    points: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export interface RedemptionListResponse {
  items: RedemptionWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReferrerAccess {
  valid: boolean;
  message?: string;
  referrer?: {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    totalPoints: number;
  };
}

export interface CampaignPoints {
  CONTACTED: number;
  VISIT: number;
  OPERATION_COMPLETED: number;
}

export interface ActiveCampaign {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  points: CampaignPoints;
  projects: Array<{ id: string; name: string }>;
}
