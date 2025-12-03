"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Lock, Globe } from "lucide-react";
import type { ApiCredentials } from "@/lib/types";
import { generateSignature } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<ApiCredentials>({
    apiKey: "",
    apiSecret: "",
    baseUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate signature generation
    // const signature = generateSignature(credentials);
    // console.log("[v0] Generated signature:", signature);

    // Store credentials in localStorage
    localStorage.setItem("api_credentials", JSON.stringify(credentials));

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-6 font-mono text-3xl font-bold text-foreground">
            API Tester
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect to your E-commerce API
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              API Credentials
            </CardTitle>
            <CardDescription>
              Enter your API credentials to start testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="sk_test_..."
                  value={credentials.apiKey}
                  onChange={(e) =>
                    setCredentials({ ...credentials, apiKey: e.target.value })
                  }
                  required
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  API Secret
                </Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.apiSecret}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      apiSecret: e.target.value,
                    })
                  }
                  required
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Base URL
                </Label>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://api.example.com"
                  value={credentials.baseUrl}
                  onChange={(e) =>
                    setCredentials({ ...credentials, baseUrl: e.target.value })
                  }
                  required
                  className="font-mono"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect to API"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> This is a
            frontend-only testing tool. All API calls are simulated and no real
            backend is required.
          </p>
        </div>
      </div>
    </div>
  );
}
