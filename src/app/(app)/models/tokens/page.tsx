"use client";

import { Eye, RefreshCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyTokenButton } from "@/components/shared/copy-token-button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useModels } from "@/lib/api/queries";
import { formatNumber } from "@/lib/utils";

export default function ModelTokensPage() {
  const { data = [] } = useModels();

  return (
    <>
      <PageHeader
        title="Model Tokens"
        description="Reusable model access tokens. Raw provider secrets stay backend-owned and are never displayed after generation."
        action={<Button variant="primary"><Link href="/models/connect">Connect Model</Link></Button>}
      />
      <DataTable
        headers={["Model", "Provider", "Endpoint", "Created", "Status", "Usage", "Token", "Actions"]}
        rows={data.map((model) => [
          model.modelName,
          model.provider,
          <span className="font-mono text-xs text-[var(--muted)]" key="endpoint">{model.endpointUrl}</span>,
          new Date(model.createdAt).toLocaleDateString(),
          <StatusBadge key="status" status={model.status} />,
          formatNumber(model.usageCount),
          <span className="font-mono text-xs" key="token">{model.maskedToken}</span>,
          <div className="flex gap-2" key="actions">
            <CopyTokenButton token={model.maskedToken} />
            <Button size="icon" title="View metrics"><Eye className="h-4 w-4" /></Button>
            <Button size="icon" title="Rotate token"><RefreshCcw className="h-4 w-4" /></Button>
            <Button size="icon" variant="danger" title="Delete token"><Trash2 className="h-4 w-4" /></Button>
          </div>,
        ])}
      />
    </>
  );
}
