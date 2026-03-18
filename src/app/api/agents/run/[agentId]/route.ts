import { NextRequest, NextResponse } from "next/server";
import { AGENT_MAP, runAgent } from "@/agents";
import { env } from "@/lib/env";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  // Validate secret in production
  if (env.NODE_ENV === "production") {
    const secret = request.headers.get("x-agent-secret");
    if (secret !== env.AGENT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const agent = AGENT_MAP.get(agentId);
  if (!agent) {
    return NextResponse.json(
      { error: `Unknown agent: ${agentId}`, available: Array.from(AGENT_MAP.keys()) },
      { status: 404 }
    );
  }

  try {
    await runAgent(agent);
    return NextResponse.json({ success: true, agentId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const agents = Array.from(AGENT_MAP.values()).map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    schedule: a.schedule,
  }));
  return NextResponse.json({ agents });
}
