"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Clock, DollarSign, Gauge, Layers, TrendingUp } from "lucide-react";
import { RequestTimeline, TokenTimeline } from "@/components/shared/chart-panel";
import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { useAgents, useMetrics, useModels } from "@/lib/api/queries";
import { useUiStore } from "@/stores/ui-store";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function MonitoringPage() {
  const { data } = useMetrics();
  const { data: agents = [] } = useAgents();
  const { data: models = [] } = useModels();
  const store = useUiStore();
  const requests = data?.requests ?? [];
  const totalRequests = (data?.metricSeries ?? []).reduce((sum, point) => sum + point.requests, 0);
  const totalErrors = (data?.metricSeries ?? []).reduce((sum, point) => sum + point.errors, 0);
  const totalTokens = (data?.metricSeries ?? []).reduce((sum, point) => sum + point.inputTokens + point.outputTokens, 0);
  const avgLatency = Math.round((data?.metricSeries ?? []).reduce((sum, point) => sum + point.latency, 0) / Math.max(data?.metricSeries.length ?? 1, 1));
  const cost = requests.reduce((sum, request) => sum + request.estimatedCost, 0);

  return (
    <>
      <PageHeader title="Monitoring" description="Deep observability for requests, latency, token consumption, provider distribution, errors, agent analytics, and model analytics." />
      <section className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 md:grid-cols-5">
        <div className="space-y-2">
          <Label>Time Range</Label>
          <Select value={store.timeRange} onChange={(event) => store.setTimeRange(event.target.value as typeof store.timeRange)}>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Agent</Label>
          <Select value={store.selectedAgentId} onChange={(event) => store.setSelectedAgentId(event.target.value)}>
            <option value="all">All agents</option>
            {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={store.selectedModelId} onChange={(event) => store.setSelectedModelId(event.target.value)}>
            <option value="all">All models</option>
            {models.map((model) => <option key={model.id} value={model.id}>{model.modelName}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select defaultValue="all"><option value="all">All providers</option><option>OpenAI</option><option>Anthropic</option><option>OpenRouter</option></Select>
        </div>
        <div className="space-y-2">
          <Label>CID</Label>
          <Select defaultValue="all"><option value="all">All CIDs</option>{agents.map((agent) => <option key={agent.cid}>{agent.cid}</option>)}</Select>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Requests" value={formatNumber(totalRequests)} hint="Gateway traffic" icon={Activity} />
        <MetricCard label="Success Rate" value={`${Math.round((1 - totalErrors / Math.max(totalRequests, 1)) * 100)}%`} hint="2xx responses" icon={TrendingUp} />
        <MetricCard label="Failure Rate" value={`${Math.round((totalErrors / Math.max(totalRequests, 1)) * 100)}%`} hint="4xx and 5xx" icon={AlertTriangle} />
        <MetricCard label="Latency" value={`${avgLatency}ms`} hint="Mean response time" icon={Clock} />
        <MetricCard label="Tokens" value={formatNumber(totalTokens)} hint="Input + output" icon={Layers} />
        <MetricCard label="Cost" value={formatCurrency(cost)} hint="Estimated" icon={DollarSign} />
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <RequestTimeline data={data?.metricSeries ?? []} />
        <TokenTimeline data={data?.metricSeries ?? []} />
      </section>
      <section className="mt-6">
        <DataTable
          headers={["Timestamp", "Agent", "Model", "Endpoint", "Status", "Latency", "Request ID"]}
          rows={requests.map((request) => [
            new Date(request.timestamp).toLocaleString(),
            agents.find((agent) => agent.id === request.agentId)?.name,
            models.find((model) => model.id === request.modelId)?.modelName,
            <span className="font-mono text-xs" key="endpoint">{request.endpoint}</span>,
            <StatusBadge key="status" status={request.status < 300 ? "active" : "error"} />,
            <span key="latency" className="inline-flex items-center gap-1"><Gauge className="h-3 w-3" />{request.latencyMs}ms</span>,
            <Button key="trace" size="sm"><Link href={`/traces/${request.id}`}>{request.id}</Link></Button>,
          ])}
        />
      </section>
    </>
  );
}
