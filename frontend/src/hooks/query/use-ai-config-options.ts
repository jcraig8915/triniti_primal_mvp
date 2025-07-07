import { useQuery } from "@tanstack/react-query";
import OpenHands from "#/api/open-hands";
import { safeguardApiCall } from "#/utils/defensive-programming";

const fetchAiConfigOptions = async () => ({
  models: await safeguardApiCall(OpenHands.getModels, []),
  agents: await safeguardApiCall(OpenHands.getAgents, []),
  securityAnalyzers: await safeguardApiCall(OpenHands.getSecurityAnalyzers, []),
});

export const useAIConfigOptions = () =>
  useQuery({
    queryKey: ["ai-config-options"],
    queryFn: fetchAiConfigOptions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
