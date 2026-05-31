"use client";

import { RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyTokenButton } from "@/components/shared/copy-token-button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgents, useLinks } from "@/lib/api/queries";

export default function AgentTokensPage() {
  const { data: agents = [] } = useAgents();
  const { data: links = [] } = useLinks();

  return (
    <>
      <PageHeader title="Agent Tokens" description="Monitoring identities for external applications. Use these tokens to attribute requests to an agent CID." />
      <DataTable
        headers={["Agent", "CID", "Token Status", "Linked Models", "Agent Token", "Actions"]}
        rows={agents.map((agent) => [
          agent.name,
          <span className="font-mono text-xs" key="cid">{agent.cid}</span>,
          <StatusBadge key="status" status={agent.status} />,
          links.filter((link) => link.agentId === agent.id).length,
          <span className="font-mono text-xs" key="token">{agent.maskedKey}</span>,
          <div className="flex gap-2" key="actions">
            <CopyTokenButton token={agent.maskedKey} />
            <Button size="icon" title="Rotate token"><RefreshCcw className="h-4 w-4" /></Button>
            <Button size="icon" variant="danger" title="Delete token"><Trash2 className="h-4 w-4" /></Button>
          </div>,
        ])}
      />
    </>
  );
}
