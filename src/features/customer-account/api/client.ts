import { apiClient } from "@/shared/lib/api/client";
import { uploadToCloudinary } from "@/shared/lib/api/cloudinary";
import type { Subscription } from "@/features/owner/types/plan";
import type { CustomerProfile } from "@/features/customer-account/types/customer-account";

export function updateCustomerProfile(
  input: Partial<Pick<CustomerProfile, "firstName" | "lastName" | "phone" | "biography" | "avatarUrl">>,
): Promise<CustomerProfile> {
  return apiClient.patch<CustomerProfile>("/customer-account/me", input);
}

export function changeCustomerPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiClient.patch<{ message: string }>("/customer-account/me/password", input);
}

export function requestCustomerMembership(input: {
  propertyLimit: number;
  receiptUrl: string;
}): Promise<Subscription> {
  return apiClient.post<Subscription>("/customer/membership", input);
}

export function uploadCustomerAvatar(file: File) {
  return uploadToCloudinary(file, "ariz/users", "image");
}

export function uploadCustomerPaymentReceipt(file: File) {
  return uploadToCloudinary(file, "ariz/receipts", "auto");
}
