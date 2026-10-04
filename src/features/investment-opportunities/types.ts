export type InvestmentGoal = "plusvalia" | "construccion" | "renta";

export interface InvestmentOpportunity {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  areaLabel: string;
  initialInvestment: number;
  currency: "PEN";
  roiPercent: number;
  investmentGoal: InvestmentGoal;
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
  "id" | "slug" | "currency" | "createdAt" | "updatedAt"
>;

export const INVESTMENT_GOAL_LABELS: Record<InvestmentGoal, string> = {
  plusvalia: "Plusvalía",
  construccion: "Construcción",
  renta: "Renta futura",
};
