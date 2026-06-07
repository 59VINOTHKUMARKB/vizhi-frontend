"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Mail, Radar } from "lucide-react";
import { api } from "@/lib/api/client";
import { saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/field";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session =
        mode === "signup"
          ? await api.signup({ email, password, name })
          : await api.login({ email, password });
      saveSession(session);
      router.replace("/dashboard");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function initializeGoogle() {
    if (!googleClientId || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        if (!response.credential) {
          setError("Google did not return an identity token");
          return;
        }
        setError("");
        setLoading(true);
        try {
          const session = await api.loginWithGoogle(response.credential);
          saveSession(session);
          router.replace("/dashboard");
        } catch (exc) {
          setError(exc instanceof Error ? exc.message : "Google login failed");
        } finally {
          setLoading(false);
        }
      },
    });
    setGoogleReady(true);
  }

  function startGoogleLogin() {
    if (!googleClientId) {
      setError("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google login");
      return;
    }
    if (!window.google || !googleReady) {
      setError("Google login is still loading");
      return;
    }
    window.google.accounts.id.prompt();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent)] text-black">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-lg">Vizhi</CardTitle>
              <p className="text-sm text-[var(--muted)]">Sign in to the control plane</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Gopinath" />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="dev@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  className="pr-10"
                  minLength={mode === "signup" ? 8 : 1}
                  required
                />
                <Eye className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--muted)]" />
              </div>
            </div>
            <FieldError message={error} />
            <Button className="w-full" variant="primary" type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "signup" ? "Create Account" : "Login"}
            </Button>
          </form>
          <div className="my-5 h-px bg-white/10" />
          <Button className="w-full" type="button" onClick={startGoogleLogin} disabled={loading}>
            <Mail className="h-4 w-4" />
            Google
          </Button>
          <button
            type="button"
            className="mt-5 block w-full text-center text-sm text-[var(--muted)] transition hover:text-white"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "signup" : "login");
            }}
          >
            {mode === "login" ? "Create an email password account" : "I already have an account"}
          </button>
        </CardContent>
      </Card>
    </main>
  );
}
