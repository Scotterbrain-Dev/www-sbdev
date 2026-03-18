import { db } from "@/db";
import { openrouterModels } from "@/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FastestPage() {
  const [latest] = await db.select({ week: openrouterModels.snapshotWeek }).from(openrouterModels).orderBy(desc(openrouterModels.snapshotWeek)).limit(1);

  const models = latest
    ? await db.select().from(openrouterModels).where(eq(openrouterModels.snapshotWeek, latest.week)).orderBy(desc(openrouterModels.tokensPerSec)).limit(30)
    : [];

  const withSpeed = models.filter((m) => m.tokensPerSec != null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fastest LLMs</h1>
          <p className="text-muted-foreground">Ranked by tokens per second</p>
        </div>
        <AgentRunButton agentId="openrouter" />
      </div>

      {withSpeed.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-muted-foreground">Speed data requires scraping openrouter.ai/rankings (client-rendered page).</p>
          <p className="text-xs text-muted-foreground">Future: Add Playwright to scrape full rankings including tokens/sec data.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Tokens/sec</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withSpeed.map((model, i) => (
                  <TableRow key={model.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{model.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{model.provider}</Badge></TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        {model.tokensPerSec?.toFixed(0)}
                      </span>
                    </TableCell>
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
