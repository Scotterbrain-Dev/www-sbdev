"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AgentRunButtonProps {
  agentId: string;
  label?: string;
}

export function AgentRunButton({ agentId, label = "Run Now" }: AgentRunButtonProps) {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");

  async function handleRun() {
    setStatus("running");
    try {
      const res = await fetch(`/api/agents/run/${agentId}`, { method: "POST" });
      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <Button
      size="sm"
      variant={status === "error" ? "destructive" : "outline"}
      onClick={handleRun}
      disabled={status === "running"}
    >
      <RefreshCw className={`h-3 w-3 mr-1.5 ${status === "running" ? "animate-spin" : ""}`} />
      {status === "running" ? "Running..." : status === "success" ? "Done!" : status === "error" ? "Failed" : label}
    </Button>
  );
}
