"use client";

import { Edit, Eye, RefreshCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyTokenButton } from "@/components/shared/copy-token-button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useModels,useDeleteModel} from "@/lib/api/queries";
import { formatNumber } from "@/lib/utils";

export default function ModelTokensPage() {
  const router = useRouter();
  const { data = [] } = useModels();
  const deleteModel = useDeleteModel();
  const [deletingModelId,setDeletingModelId] = useState<string | null>(null);
  
  const handleDelete = async (modelId: string) => {
    if (confirm("Are you sure you want to delete this model token?")) {
      setDeletingModelId(modelId);
      try {
        await deleteModel.mutateAsync(modelId);
      } finally {
        setDeletingModelId(null);
      }
    }
  };

  const handleViewUsage = (modelId: string) => {
    router.push(`/models/tokens/${modelId}`);
  };
  return (
    <>
      <PageHeader
        title="Model Tokens"
        description="Reusable model access tokens. Full tokens are shown only once at creation—copy them immediately. Only masked versions are stored and displayed here."
        action={<Button variant="primary"><Link href="/models/connect">Connect Model</Link></Button>}
      />
      <DataTable
        headers={["Model", "Provider", "Created", "Status", "Usage", "Token", "Actions"]}
        rows={data.map((model) => [
          <button
            key="model-name"
            onClick={() => handleViewUsage(model.id)}
            className="text-left hover:text-[var(--primary)] transition-colors cursor-pointer font-medium"
          >
            {model.modelName}
          </button>,
          model.provider,
          new Date(model.createdAt).toLocaleDateString(),
          <StatusBadge key="status" status={model.status} />,
          <button
            key="usage"
            onClick={() => handleViewUsage(model.id)}
            className="hover:text-[var(--primary)] transition-colors cursor-pointer font-medium"
          >
            {formatNumber(model.usageCount)}
          </button>,
          <div className="flex items-center gap-2" key="token">
            <span className="font-mono text-xs" title="Full token only shown once at creation">{model.maskedKey}</span>
            <span className="text-xs text-[var(--muted)]">(Masked)</span>
          </div>,
          <div className="flex gap-2" key="actions"> 
            <Button size="icon" title="View Usage Details" onClick={() => handleViewUsage(model.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" title="Edit"><Edit className="h-4 w-4" /></Button>
            <Button size="icon" variant="danger" title="Delete token" onClick={() => handleDelete(model.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>,
        ])}
      />
    </>
  );
}
