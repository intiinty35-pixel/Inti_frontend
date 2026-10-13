import { apiClient } from '@/shared/lib/api/client';

export interface PublicReferralInput {
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  referrerCode?: string;
  referrerBankAccount?: string;
  referrerYape?: string;
  referrerPlin?: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  availability?: string;
}

export interface PublicReferralResponse {
  id: string;
  code: string;
  referrer: { code: string };
}

export interface ValidateCodeResponse {
  valid: boolean;
  referrer?: { id: string; name: string; email: string; phone: string };
}

export type ReferralStatus = 'PENDING_VALIDATION' | 'CONTACTED' | 'VISIT' | 'OPERATION_COMPLETED' | 'REJECTED';

export interface MyReferral {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ReferralStatus;
  statusLabel: string;
  interest: string;
  interestLabel: string;
  availability: string;
  points: number;
  project: { id: string; name: string } | null;
  createdAt: string;
}

export interface MyReferralsResponse {
  valid: boolean;
  message?: string;
  referrer?: { code: string; name: string };
  total?: number;
  referrals: MyReferral[];
}

export function submitPublicReferral(input: PublicReferralInput) {
  return apiClient.post<PublicReferralResponse>('/referrals', input);
}

export function validateReferrerCode(code: string) {
  return apiClient.get<ValidateCodeResponse>(`/referrals/validate-code?code=${encodeURIComponent(code)}`);
}

/** Lista los referidos de un referente (por su codigo) con su estado actual. */
export function getMyReferrals(code: string) {
  return apiClient.get<MyReferralsResponse>(`/referrals/my?code=${encodeURIComponent(code)}`);
}

export async function checkReferrerExists(email: string): Promise<boolean> {
  try {
    await apiClient.get(`/referrals/check?email=${encodeURIComponent(email)}`);
    return true;
  } catch {
    return false;
  }
}
