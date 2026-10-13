export type ReferralStatus = 'CONTACTED' | 'VISIT' | 'OPERATION_COMPLETED';
export type CampaignStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface CampaignPoints {
  CONTACTED: number;
  VISIT: number;
  OPERATION_COMPLETED: number;
}

export interface Campaign {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  points: CampaignPoints;
  projectIds: string[];
  projects: Array<{ id: string; name: string }>;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  items: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  points: CampaignPoints;
  projectIds: string[];
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  points?: CampaignPoints;
  projectIds?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}
