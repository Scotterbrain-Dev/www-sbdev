import { db } from "@/db";
import { openrouterModels } from "@/db/schema";
import { desc, eq, isNotNull, or } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function BenchmarksPage() {
  const [latest] = await db.select({ week: openrouterModels.snapshotWeek }).from(openrouterModels).orderBy(desc(openrouterModels.snapshotWeek)).limit(1);

  const models = latest
    ? await db
        .select()
        .from(openrouterModels)
        .where(eq(openrouterModels.snapshotWeek, latest.week))
        .orderBy(desc(openrouterModels.scoreIntelligence))
        .limit(50)
    : [];

  const benchmarks = [
    { key: "scoreIntelligence", label: "Intelligence Score" },
    { key: "scoreCoding", label: "Coding Score" },
    { key: "scoreAgentic", label: "Agentic Index Score" },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Benchmarks</h1>
          <p className="text-muted-foreground">Intelligence, Coding & Agentic Index scores</p>
        </div>
        <AgentRunButton agentId="frank-router" />
      </div>

      {models.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No benchmark data yet. Run the OpenRouter agent.</p>
      ) : (
        <div className="space-y-6">
          {benchmarks.map((bench) => {
            const sorted = [...models].sort((a, b) => (b[bench.key] ?? 0) - (a[bench.key] ?? 0)).filter((m) => m[bench.key] != null).slice(0, 15);
            return (
              <Card key={bench.key}>
                <CardHeader>
                  <CardTitle className="text-base">{bench.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {sorted.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No scores available. OpenRouter rankings page scraping needed for full benchmark data.</p>
                  ) : (
                    <div className="space-y-2">
                      {sorted.map((model, i) => (
                        <div key={model.id} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-sm font-medium truncate">{model.name}</span>
                              <span className="text-sm font-bold shrink-0">{model[bench.key]?.toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${((model[bench.key] ?? 0) / 100) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
