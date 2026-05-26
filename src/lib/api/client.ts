import { agents, links, metricSeries, modelConnections, requests } from "@/lib/mock-data";
import type { Agent, AgentModelLink, ModelConnection, Provider } from "@/types/domain";

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export type CreateModelConnectionInput = {
  provider: Provider;
  modelName: string;
  endpointUrl: string;
  apiKey: string;
  metadata?: string;
};

export type CreateAgentInput = {
  name: string;
  description: string;
  cid: string;
  owner: string;
  tags: string;
};

export const api = {
  async getDashboard() {
    await wait();
    const totalRequests = metricSeries.reduce((sum, point) => sum + point.requests, 0);
    const totalInput = metricSeries.reduce((sum, point) => sum + point.inputTokens, 0);
    const totalOutput = metricSeries.reduce((sum, point) => sum + point.outputTokens, 0);
    const errors = metricSeries.reduce((sum, point) => sum + point.errors, 0);

    return {
      totals: {
        agents: agents.length,
        modelTokens: modelConnections.length,
        requestsToday: totalRequests,
        tokensConsumed: totalInput + totalOutput,
        errors,
        activeModels: modelConnections.filter((model) => model.status === "active").length,
      },
      metricSeries,
      recentRequests: requests,
    };
  },
  async getModels() {
    await wait();
    return modelConnections;
  },
  async createModelConnection(input: CreateModelConnectionInput): Promise<ModelConnection> {
    await wait(500);
    return {
      id: `mt_${crypto.randomUUID().slice(0, 8)}`,
      provider: input.provider,
      modelName: input.modelName,
      endpointUrl: input.endpointUrl,
      status: "active",
      createdAt: new Date().toISOString(),
      usageCount: 0,
      maskedToken: "vizhi_mt_new...once",
      metadata: input.metadata,
    };
  },
  async testConnection() {
    await wait(650);
    return { ok: true };
  },
  async getAgents() {
    await wait();
    return agents;
  },
  async createAgent(input: CreateAgentInput): Promise<Agent> {
    await wait(420);
    return {
      id: `ag_${crypto.randomUUID().slice(0, 8)}`,
      name: input.name,
      description: input.description,
      cid: input.cid,
      owner: input.owner,
      tags: input.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: "active",
      createdAt: new Date().toISOString(),
      maskedToken: "vizhi_at_new...once",
    };
  },
  async getLinks() {
    await wait();
    return links;
  },
  async createLink(agentId: string, modelId: string): Promise<AgentModelLink> {
    await wait(350);
    return {
      id: `ln_${crypto.randomUUID().slice(0, 5)}`,
      agentId,
      modelId,
      status: "active",
      createdAt: new Date().toISOString(),
      requestCount: 0,
      tokenConsumption: 0,
    };
  },
  async getMetrics() {
    await wait();
    return { metricSeries, requests };
  },
  async getTrace(id: string) {
    await wait();
    return requests.find((request) => request.id === id) ?? requests[0];
  },
};
