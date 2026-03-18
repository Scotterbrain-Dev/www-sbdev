import { db } from "@/db";
import { githubTrending } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { Star, GitFork, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getTrending(period: string) {
  return db
    .select()
    .from(githubTrending)
    .where(eq(githubTrending.period, period as any))
    .orderBy(desc(githubTrending.snapshotDate), desc(githubTrending.starsToday))
    .limit(25);
}

export default async function GithubTrendingPage() {
  const [daily, weekly, monthly] = await Promise.all([
    getTrending("daily"),
    getTrending("weekly"),
    getTrending("monthly"),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GitHub Trending</h1>
          <p className="text-muted-foreground">Latest trending repositories on GitHub</p>
        </div>
        <AgentRunButton agentId="gabby-gitrend" />
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily"><RepoList repos={daily} /></TabsContent>
        <TabsContent value="weekly"><RepoList repos={weekly} /></TabsContent>
        <TabsContent value="monthly"><RepoList repos={monthly} /></TabsContent>
      </Tabs>
    </div>
  );
}

function RepoList({ repos }: { repos: Awaited<ReturnType<typeof getTrending>> }) {
  if (repos.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No data yet. Run the agent to fetch trending repos.</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      {repos.map((repo) => (
        <Card key={repo.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={repo.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline flex items-center gap-1"
                  >
                    {repo.repoFullName}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                  {repo.language && <Badge variant="outline" className="text-xs">{repo.language}</Badge>}
                </div>
                {repo.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>
                )}
              </div>
              <div className="shrink-0 text-right space-y-1">
                <div className="flex items-center gap-1 text-sm justify-end">
                  <Star className="h-3 w-3" />
                  {repo.starsTotal?.toLocaleString() ?? "—"}
                </div>
                {repo.starsToday && (
                  <div className="text-xs text-muted-foreground">+{repo.starsToday.toLocaleString()} today</div>
                )}
                {repo.forks && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <GitFork className="h-3 w-3" />
                    {repo.forks.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
