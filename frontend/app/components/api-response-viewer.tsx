"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { ApiResponse } from "@/lib/types";

interface ApiResponseViewerProps {
  response: ApiResponse | null;
  method?: string;
  endpoint?: string;
}

export function ApiResponseViewer({
  response,
  method = "GET",
  endpoint = "/api/products",
}: ApiResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!response) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-card-foreground">
            API Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No API response yet. Perform an action to see the response.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusColor =
    response.status >= 200 && response.status < 300
      ? "bg-success/20 text-success border-success/30"
      : "bg-destructive/20 text-destructive border-destructive/30";

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          API Response
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {method}
          </Badge>
          <code className="text-xs text-muted-foreground">{endpoint}</code>
          <Badge className={statusColor}>{response.status}</Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Timestamp:</span>
            <code className="font-mono text-foreground">
              {new Date(response.timestamp).toLocaleString()}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Signature:</span>
            <code className="font-mono text-foreground">
              {response.signature.slice(0, 20)}...
            </code>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-secondary p-3">
          <pre className="overflow-x-auto text-xs text-secondary-foreground">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
