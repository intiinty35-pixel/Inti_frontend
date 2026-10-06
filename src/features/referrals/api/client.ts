import { apiClient } from '@/shared/lib/api/client';

export interface PublicReferralInput {
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  referrerCode?: string;
  name: string;
  email: string;
  phone: string;
  projectId: string;
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

export function submitPublicReferral(input: PublicReferralInput) {
  return apiClient.post<PublicReferralResponse>('/referrals', input);
}

export function validateReferrerCode(code: string) {
  return apiClient.get<ValidateCodeResponse>(`/referrals/validate-code?code=${encodeURIComponent(code)}`);
}

export async function checkReferrerExists(email: string): Promise<boolean> {
  try {
    await apiClient.get(`/referrals/check?email=${encodeURIComponent(email)}`);
    return true;
  } catch {
    return false;
  }
}
