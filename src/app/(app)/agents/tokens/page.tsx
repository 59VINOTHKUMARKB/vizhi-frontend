"use client";

import { RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyTokenButton } from "@/components/shared/copy-token-button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgents, useDeleteAgent, useLinks } from "@/lib/api/queries";
import { useState } from "react";

export default function AgentTokensPage() {
  const { data: agents = [] } = useAgents();
  const { data: links = [] } = useLinks();
  const deleteAgent = useDeleteAgent();
  const [deleteCID, setDeleteCID] = useState<string | null>(null);
  const handleDelete = async (cid: string) => {
    if (confirm("Are you sure you want to delete this agent token?")) {
      setDeleteCID(cid);

      try {
        await deleteAgent.mutateAsync(cid);
      }
      finally{
        setDeleteCID(null);
      }
    }
  };
  
  return (
    <>
      <PageHeader title="Agent Tokens" description="Monitoring identities for external applications. Full tokens are shown only once at creation—copy them immediately. Only masked versions are displayed here." />
      <DataTable
        headers={["Agent", "CID", "Token Status", "Linked Models", "Agent Token", "Actions"]}
        rows={agents.map((agent) => [
          agent.name,
          <span className="font-mono text-xs" key="cid">{agent.cid}</span>,
          <StatusBadge key="status" status={agent.status} />,
          links.filter((link) => link.agentId === agent.id).length,
          <div className="flex items-center gap-2" key="token">
            <span className="font-mono text-xs" title="Full token only shown once at creation">{agent.maskedKey}</span>
            <span className="text-xs text-[var(--muted)]">(Masked)</span>
          </div>,
          <div className="flex gap-2" key="actions">
            <Button size="icon" title="Rotate token"><RefreshCcw className="h-4 w-4" /></Button>
            <Button size="icon" variant="danger" title="Delete token" disabled={deleteCID === agent.cid} onClick={() => handleDelete(agent.cid)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>,
        ])}
      />
    </>
  );
}
