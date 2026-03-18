import { db } from "@/db";
import { agentRuns, githubTrending, aiArticles, changelogs, claudeSkills } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AGENTS } from "@/agents";

export const dynamic = "force-dynamic";

async function getStats() {
  const [trendingCount] = await db.select({ count: count() }).from(githubTrending);
  const [articleCount] = await db.select({ count: count() }).from(aiArticles);
  const [changelogCount] = await db.select({ count: count() }).from(changelogs);
  const [skillCount] = await db.select({ count: count() }).from(claudeSkills);

  const recentRuns = await db
    .select()
    .from(agentRuns)
    .orderBy(desc(agentRuns.startedAt))
    .limit(10);

  return { trendingCount: trendingCount.count, articleCount: articleCount.count, changelogCount: changelogCount.count, skillCount: skillCount.count, recentRuns };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">SB Dev — AI-powered personal dev dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Trending Repos" value={stats.trendingCount} />
        <StatCard title="AI Articles" value={stats.articleCount} />
        <StatCard title="Changelogs" value={stats.changelogCount} />
        <StatCard title="Claude Skills" value={stats.skillCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AGENTS.map((agent) => {
              const lastRun = stats.recentRuns.find((r) => r.agentId === agent.id);
              return (
                <div key={agent.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.schedule} · {agent.description}</p>
                  </div>
                  <div className="text-right">
                    {lastRun ? (
                      <>
                        <Badge variant={lastRun.status === "success" ? "default" : lastRun.status === "error" ? "destructive" : "secondary"}>
                          {lastRun.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(lastRun.startedAt).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <Badge variant="outline">Never run</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {stats.recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Agent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {stats.recentRuns.map((run) => (
                <div key={run.id} className="flex items-center gap-3 text-sm">
                  <Badge variant={run.status === "success" ? "default" : run.status === "error" ? "destructive" : "secondary"} className="shrink-0">
                    {run.status}
                  </Badge>
                  <span className="font-medium">{run.agentId}</span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    {run.durationMs ? `${run.durationMs}ms` : ""} · {run.rowsAffected ?? 0} rows · {new Date(run.startedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | bigint }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-bold">{Number(value).toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
