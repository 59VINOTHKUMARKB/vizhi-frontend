"use client";

import Link from "next/link";
import { Eye, Mail, Radar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="dev@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type="password" placeholder="••••••••" className="pr-10" />
                <Eye className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--muted)]" />
              </div>
            </div>
            <Button className="w-full" variant="primary" type="button">
              <Link href="/dashboard">Login</Link>
            </Button>
          </form>
          <div className="my-5 h-px bg-white/10" />
          <div className="grid grid-cols-2 gap-2">
            <Button>
              <Shield className="h-4 w-4" />
              GitHub
            </Button>
            <Button>
              <Mail className="h-4 w-4" />
              Google
            </Button>
          </div>
          <Link href="#" className="mt-5 block text-center text-sm text-[var(--muted)] hover:text-white">
            Forgot password?
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
