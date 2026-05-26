import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type CreateAgentInput, type CreateModelConnectionInput } from "@/lib/api/client";

export const queryKeys = {
  dashboard: ["dashboard"],
  models: ["models"],
  agents: ["agents"],
  links: ["links"],
  metrics: ["metrics"],
  trace: (id: string) => ["trace", id],
};

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: api.getDashboard, refetchInterval: 30_000 });
}

export function useModels() {
  return useQuery({ queryKey: queryKeys.models, queryFn: api.getModels });
}

export function useAgents() {
  return useQuery({ queryKey: queryKeys.agents, queryFn: api.getAgents });
}

export function useLinks() {
  return useQuery({ queryKey: queryKeys.links, queryFn: api.getLinks });
}

export function useMetrics() {
  return useQuery({ queryKey: queryKeys.metrics, queryFn: api.getMetrics, refetchInterval: 15_000 });
}

export function useTrace(id: string) {
  return useQuery({ queryKey: queryKeys.trace(id), queryFn: () => api.getTrace(id) });
}

export function useCreateModelConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateModelConnectionInput) => api.createModelConnection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models });
      toast.success("Model token generated");
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAgentInput) => api.createAgent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents });
      toast.success("Agent token generated");
    },
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, modelId }: { agentId: string; modelId: string }) => api.createLink(agentId, modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links });
      toast.success("Agent linked to model token");
    },
  });
}
