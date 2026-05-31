"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle, KeyRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Label, Select, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/shared/page-header";
import { useCreateModelConnection } from "@/lib/api/queries";

const schema = z.object({
  provider: z.enum(["OpenAI", "Anthropic", "OpenRouter", "Ollama", "Custom"]),
  modelName: z.string().min(2, "Model name is required"),
  metadata: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ConnectModelPage() {
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const createModel = useCreateModelConnection();
  const { register, handleSubmit, watch } = useForm<FormValues>();

  const MODELS_BY_PROVIDER = {
  OpenAI: [
    "gpt-4.1",
    "gpt-4o",
    "gpt-4o-mini",
  ],

  Anthropic: [
    "claude-opus-4",
    "claude-sonnet-4",
  ],

  OpenRouter: [
    "openai/gpt-4o",
    "anthropic/claude-sonnet-4",
  ],

  Ollama: [
    "llama3",
    "mistral",
    "deepseek-r1",
  ],

  Custom: [],
 };

 const selectedProvider = watch("provider");

 const availableModels = MODELS_BY_PROVIDER[selectedProvider] || [];
  function submit(values: FormValues) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    setErrors({});
    createModel.mutate(parsed.data, {
      onSuccess(data) {
        setGeneratedToken(data.apiKey);
      },
    });
  }

  return (
    <>
      <PageHeader title="Connect Model Provider" description="Create an LLM provider configuration, validate connectivity, and generate a reusable Vizhi model token." />
      <form onSubmit={handleSubmit(submit)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Provider Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select {...register("provider")}>
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>OpenRouter</option>
                <option>Ollama</option>
                <option>Custom</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
               <Select {...register("modelName")}>
               {availableModels.map((model)=> <option key={model} value={model}>{model}</option>)}
               </Select>
              <FieldError message={errors.modelName} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea {...register("metadata")} />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="submit" variant="primary" disabled={createModel.isPending}>
                <KeyRound className="h-4 w-4" />
                Generate Model Token
              </Button>
            </div>
            {generatedToken ? (
              <div className="md:col-span-2 rounded-lg border border-slate-500/20 bg-slate-950/80 p-4 text-sm text-slate-100">
                <p className="font-semibold">Vizhi model token created</p>
                <p className="mt-2 break-all text-xs">{generatedToken}</p>
                <p className="mt-2 text-[var(--muted)]">This token is shown only once. Store it securely.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--muted)]">
              <p>
              Vizhi generates a reusable model token and stores only a masked version. The raw token is shown once after creation.
              </p>
            <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-100">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Token creation is handled by Vizhi</span>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
