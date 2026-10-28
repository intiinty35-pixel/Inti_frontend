import { backendFetch } from '@/shared/lib/api/server';
import { normalizeProfileDistribution, type Distribution } from '../lib/profile-distribution';

const CACHE_TTL_MS = 60_000;

let cachedDistribution: Distribution | undefined;
let cacheExpiresAt = 0;
let pendingRequest: Promise<{ data?: Distribution; status: number }> | undefined;

async function fetchProfileDistribution(): Promise<{ data?: Distribution; status: number }> {
  const response = await backendFetch('/admin/professionals/distribution');
  if (!response.ok) return { status: response.status };
  return { status: 200, data: normalizeProfileDistribution(await response.json()) };
}

export async function loadProfileDistribution(): Promise<{ data?: Distribution; status: number }> {
  if (cachedDistribution && Date.now() < cacheExpiresAt) {
    return { status: 200, data: cachedDistribution };
  }

  pendingRequest ??= fetchProfileDistribution();
  try {
    const result = await pendingRequest;
    if (result.data) {
      cachedDistribution = result.data;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }
    return result;
  } finally {
    pendingRequest = undefined;
  }
}
