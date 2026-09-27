import { apiClient } from "@/shared/lib/api/client";
import type { AgentProfile } from "@/features/agents/types/agent";

export async function getAgentProfile(id: string): Promise<AgentProfile> {
  return apiClient.get<AgentProfile>(`/agents/${encodeURIComponent(id)}`);
}
