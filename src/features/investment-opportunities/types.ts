export type InvestmentGoal = "plusvalia" | "construccion" | "renta";
export type InvestmentStatus = "AVAILABLE" | "COMING_SOON" | "CLOSED";
export type InvestmentRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface InvestmentType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentOpportunity {
  id: string;
  investmentTypeId: string | null;
  investmentType?: InvestmentType | null;
  name: string;
  slug: string;
  summary: string;
  description: string;
  areaLabel: string;
  investmentKind: string;
  assetType: string;
  initialInvestment: number;
  currency: "PEN";
  roiPercent: number;
  estimatedReturnLabel: string | null;
  estimatedTermMonths: number | null;
  investmentGoal: InvestmentGoal;
  status: InvestmentStatus;
  riskLevel: InvestmentRiskLevel | null;
  featured: boolean;
  sortOrder: number;
  ctaLabel: string;
  location: string;
  department: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  coverImagePublicId: string | null;
  galleryImages: string[];
  highlights: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InvestmentOpportunityInput = Omit<
  InvestmentOpportunity,
  "id" | "slug" | "currency" | "createdAt" | "updatedAt" | "investmentType"
>;

export type InvestmentTypeInput = Pick<
  InvestmentType,
  "name" | "description" | "isActive" | "sortOrder"
>;

export const INVESTMENT_GOAL_LABELS: Record<InvestmentGoal, string> = {
  plusvalia: "Plusvalia",
  construccion: "Construccion",
  renta: "Renta futura",
};

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  AVAILABLE: "Disponible",
  COMING_SOON: "Proximamente",
  CLOSED: "Cerrada",
};

export const INVESTMENT_RISK_LABELS: Record<InvestmentRiskLevel, string> = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
};
