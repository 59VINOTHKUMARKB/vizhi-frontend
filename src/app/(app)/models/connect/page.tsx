"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle, FlaskConical, KeyRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/shared/page-header";
import { api } from "@/lib/api/client";
import { useCreateModelConnection } from "@/lib/api/queries";

const schema = z.object({
  provider: z.enum(["OpenAI", "Anthropic", "OpenRouter", "Ollama", "Custom"]),
  modelName: z.string().min(2, "Model name is required"),
  endpointUrl: z.string().url("Use a valid endpoint URL"),
  apiKey: z.string().min(4, "API key is required"),
  metadata: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ConnectModelPage() {
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [tested, setTested] = useState(false);
  const createModel = useCreateModelConnection();
  const { register, handleSubmit, getValues } = useForm<FormValues>({
    defaultValues: {
      provider: "OpenAI",
      modelName: "gpt-4o",
      endpointUrl: "https://api.openai.com/v1/chat/completions",
      apiKey: "",
      metadata: "production",
    },
  });

  async function testConnection() {
    const parsed = schema.safeParse(getValues());
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    setErrors({});
    await api.testConnection();
    setTested(true);
  }

  function submit(values: FormValues) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    setErrors({});
    createModel.mutate(parsed.data);
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
              <Input {...register("modelName")} />
              <FieldError message={errors.modelName} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endpoint URL</Label>
              <Input {...register("endpointUrl")} />
              <FieldError message={errors.endpointUrl} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>API Key</Label>
              <Input type="password" {...register("apiKey")} placeholder="Stored securely by backend" />
              <FieldError message={errors.apiKey} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Optional Metadata</Label>
              <Textarea {...register("metadata")} />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="button" onClick={testConnection}>
                <FlaskConical className="h-4 w-4" />
                Test Connection
              </Button>
              <Button type="submit" variant="primary" disabled={createModel.isPending}>
                <KeyRound className="h-4 w-4" />
                Generate Model Token
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--muted)]">
            <p>Provider credentials are sent to the backend for vault storage. The frontend receives only a masked Vizhi token after creation.</p>
            <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-100">
              {tested ? (
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Connection verified</span>
              ) : (
                "Run a connection test before production use."
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
