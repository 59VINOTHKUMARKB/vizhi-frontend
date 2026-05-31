import type { Agent, AgentModelLink, ModelConnection, Provider, RequestEvent, MetricPoint, Status } from "@/types/domain";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type CreateModelConnectionInput = {
  provider: Provider;
  modelName: string;
  metadata?: string;
};

export type ModelConnectionCreated = {
  id: string;
  provider: Provider;
  modelName: string;
  status: Status;
  createdAt: string;
  usageCount: number;
  maskedKey: string;
  metadata?: string;
  apiKey: string;
};

export type CreateAgentInput = {
  name: string;
  description: string;
  cid: string;
  owner: string;
  tags: string;
};

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP error ${response.status}`);
  }
  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  async getDashboard(): Promise<{
    totals: {
      agents: number;
      modelTokens: number;
      requestsToday: number;
      tokensConsumed: number;
      errors: number;
      activeModels: number;
    };
    metricSeries: MetricPoint[];
    recentRequests: RequestEvent[];
  }> {
    const data = await request("/v1/dashboard");
    return {
      totals: {
        agents: data.totals.agents,
        modelTokens: data.totals.model_tokens,
        requestsToday: data.totals.requests_today,
        tokensConsumed: data.totals.tokens_consumed,
        errors: data.totals.errors,
        activeModels: data.totals.active_models,
      },
      metricSeries: data.metric_series.map((point: any) => ({
        time: point.time,
        requests: point.requests,
        inputTokens: point.input_tokens,
        outputTokens: point.output_tokens,
        latency: point.latency,
        errors: point.errors,
      })),
      recentRequests: data.recent_requests.map((req: any) => ({
        id: req.id,
        timestamp: req.timestamp,
        agentId: req.agent_id,
        modelId: req.model,
        endpoint: req.endpoint,
        status: req.status,
        latencyMs: req.latency_ms,
        inputTokens: req.input_tokens,
        outputTokens: req.output_tokens,
        estimatedCost: req.estimated_cost,
        errorMessage: req.error_message,
      })),
    };
  },

  async getModels(): Promise<ModelConnection[]> {
    const list = await request("/v1/models");
    return list.map((item: any) => ({
      id: item.id,
      provider: (item.provider.charAt(0).toUpperCase() + item.provider.slice(1)) as Provider,
      modelName: item.model_name,
      status: item.status as Status,
      createdAt: item.created_at,
      usageCount: item.usage_count,
      maskedKey: item.masked_key || "vz_live_...",
      metadata: item.metadata || undefined,
    }));
  },

  async createModelConnection(input: CreateModelConnectionInput): Promise<ModelConnectionCreated> {
    const res = await request("/v1/models", {
      method: "POST",
      body: JSON.stringify({
        provider: input.provider.toLowerCase(),
        model_name: input.modelName,
        metadata: input.metadata || "",
      }),
    });
    return {
      id: res.model_connection.id,
      provider: (res.model_connection.provider.charAt(0).toUpperCase() + res.model_connection.provider.slice(1)) as Provider,
      modelName: res.model_connection.model_name,
      status: res.model_connection.status as Status,
      createdAt: res.model_connection.created_at,
      usageCount: res.model_connection.usage_count,
      maskedKey: res.model_connection.masked_key || "vz_live_...",
      metadata: res.model_connection.metadata || undefined,
      apiKey: res.api_key,
    };
  },

 

  async getAgents(): Promise<Agent[]> {
    const list = await request("/v1/agents");
    return list.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      cid: item.agent_id,
      owner: item.owner,
      tags: item.tags || [],
      status: item.status as Status,
      createdAt: item.created_at,
      maskedKey: item.masked_key,
    }));
  },

  async createAgent(input: CreateAgentInput): Promise<Agent> {
    const res = await request("/v1/agents", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        cid: input.cid,
        owner: input.owner,
        tags: input.tags,
      }),
    });
    return {
      id: res.agent.id,
      name: res.agent.name,
      description: res.agent.description,
      cid: res.agent.agent_id,
      owner: res.agent.owner,
      tags: res.agent.tags || [],
      status: res.agent.status as Status,
      createdAt: res.agent.created_at,
      maskedKey: res.api_key, // Provide full API key here on creation so user can copy it!
    };
  },

  async getLinks(): Promise<AgentModelLink[]> {
    if (typeof window === "undefined") return [];
    const local = localStorage.getItem("vizhi_links");
    if (local) return JSON.parse(local);
    const initial: AgentModelLink[] = [];
    localStorage.setItem("vizhi_links", JSON.stringify(initial));
    return initial;
  },

  async createLink(agentId: string, modelId: string): Promise<AgentModelLink> {
    const links = await this.getLinks();
    const newLink: AgentModelLink = {
      id: `ln_${Math.random().toString(36).substring(2, 7)}`,
      agentId,
      modelId,
      status: "active",
      createdAt: new Date().toISOString(),
      requestCount: 0,
      tokenConsumption: 0,
    };
    links.push(newLink);
    if (typeof window !== "undefined") {
      localStorage.setItem("vizhi_links", JSON.stringify(links));
    }
    return newLink;
  },

  async getMetrics(): Promise<{
    metricSeries: MetricPoint[];
    requests: RequestEvent[];
  }> {
    const data = await request("/v1/metrics");
    return {
      metricSeries: data.metric_series.map((point: any) => ({
        time: point.time,
        requests: point.requests,
        inputTokens: point.input_tokens,
        outputTokens: point.output_tokens,
        latency: point.latency,
        errors: point.errors,
      })),
      requests: data.requests.map((req: any) => ({
        id: req.id,
        timestamp: req.timestamp,
        agentId: req.agent_id,
        modelId: req.model,
        endpoint: req.endpoint,
        status: req.status,
        latencyMs: req.latency_ms,
        inputTokens: req.input_tokens,
        outputTokens: req.output_tokens,
        estimatedCost: req.estimated_cost,
        errorMessage: req.error_message,
      })),
    };
  },

  async getTrace(id: string): Promise<RequestEvent> {
    const req = await request(`/v1/queries/${id}`);
    return {
      id: req.id,
      timestamp: req.timestamp,
      agentId: req.agent_id,
      modelId: req.model,
      endpoint: req.endpoint,
      status: req.status,
      latencyMs: req.latency_ms,
      inputTokens: req.input_tokens,
      outputTokens: req.output_tokens,
      estimatedCost: req.estimated_cost,
      errorMessage: req.error_message,
    };
  },

  async deleteModel(modelId: string): Promise<void> {
    await request(`/v1/models/${modelId}`, {
      method: "DELETE",
    });
  },
};


 