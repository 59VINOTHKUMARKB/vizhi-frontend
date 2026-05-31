export type Provider = "OpenAI" | "Anthropic" | "OpenRouter" | "Ollama" | "Custom";

export type Status = "active" | "disabled" | "error" | "testing" | "archived";

export type ModelConnection = {
  id: string;
  provider: Provider;
  modelName: string;
  status: Status;
  createdAt: string;
  usageCount: number;
  maskedKey: string;
  metadata?: string;
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  cid: string;
  tags: string[];
  status: Status;
  createdAt: string;
  maskedKey: string;
};

export type AgentModelLink = {
  id: string;
  agentId: string;
  modelId: string;
  status: Status;
  createdAt: string;
  requestCount: number;
  tokenConsumption: number;
};

export type MetricPoint = {
  time: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  errors: number;
};

export type RequestEvent = {
  id: string;
  timestamp: string;
  agentId: string;
  modelId: string;
  endpoint: string;
  status: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  errorMessage?: string;
};
