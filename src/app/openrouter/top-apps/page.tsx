import { db } from "@/db";
import { openrouterTopApps } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

function formatTokens(b: number | null): string {
  if (b == null) return "—";
  if (b >= 1000) return `${(b / 1000).toFixed(2)}T`;
  return `${b.toFixed(0)}B`;
}

export default async function TopAppsPage() {
  const [latest] = await db
    .select({ date: openrouterTopApps.snapshotDate })
    .from(openrouterTopApps)
    .orderBy(desc(openrouterTopApps.snapshotDate))
    .limit(1);

  const apps = latest
    ? await db
        .select()
        .from(openrouterTopApps)
        .where(eq(openrouterTopApps.snapshotDate, latest.date))
        .orderBy(openrouterTopApps.rank)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Top Apps</h1>
          <p className="text-muted-foreground">
            Most popular apps on OpenRouter
            {latest ? ` · ${latest.date}` : ""}
          </p>
        </div>
        <AgentRunButton agentId="frank-router" />
      </div>

      {apps.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No data yet. Run the OpenRouter agent.</p>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Weekly Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="text-muted-foreground font-mono">{app.rank}</TableCell>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.description && app.description !== "new" ? app.description : (
                        app.description === "new" ? <Badge variant="secondary" className="text-xs">new</Badge> : "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatTokens(app.weeklyTokensB)}
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
