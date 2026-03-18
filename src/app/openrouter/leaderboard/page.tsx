import { db } from "@/db";
import { openrouterModels } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  // Get most recent snapshot week
  const [latest] = await db
    .select({ week: openrouterModels.snapshotWeek })
    .from(openrouterModels)
    .orderBy(desc(openrouterModels.snapshotWeek))
    .limit(1);

  const models = latest
    ? await db
        .select()
        .from(openrouterModels)
        .where(eq(openrouterModels.snapshotWeek, latest.week))
        .orderBy(openrouterModels.rank, openrouterModels.name)
        .limit(100)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LLM Leaderboard</h1>
          <p className="text-muted-foreground">
            Top models from OpenRouter
            {latest ? ` · Week of ${latest.week}` : ""}
          </p>
        </div>
        <AgentRunButton agentId="openrouter" />
      </div>

      {models.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No data yet. Run the OpenRouter agent to fetch model rankings.</p>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Context</TableHead>
                  <TableHead className="text-right">Intelligence</TableHead>
                  <TableHead className="text-right">Coding</TableHead>
                  <TableHead className="text-right">Agentic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model, i) => (
                  <TableRow key={model.id}>
                    <TableCell className="text-muted-foreground">{model.rank ?? i + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{model.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{model.provider}</Badge></TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {model.contextLength ? `${(model.contextLength / 1000).toFixed(0)}K` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">{model.scoreIntelligence?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm">{model.scoreCoding?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm">{model.scoreAgentic?.toFixed(1) ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
