import { db } from "@/db";
import { aiTrends } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AiTrendsPage() {
  const trends = await db.select().from(aiTrends).orderBy(desc(aiTrends.scrapedAt)).limit(50);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Trends</h1>
          <p className="text-muted-foreground">Latest trends in AI, LLMs, and agentic coding</p>
        </div>
        <AgentRunButton agentId="ai-trends" />
      </div>

      {trends.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No trends yet. Run the agent to fetch AI trend articles.</p>
      ) : (
        <div className="space-y-3">
          {trends.map((trend) => (
            <Card key={trend.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a href={trend.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-1 text-sm">
                      {trend.title}
                      <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                    </a>
                    {trend.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{trend.summary}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {trend.source && <Badge variant="outline" className="text-xs">{trend.source}</Badge>}
                      {trend.publishedAt && <span className="text-xs text-muted-foreground">{new Date(trend.publishedAt).toLocaleDateString()}</span>}
                      {trend.tags && trend.tags.slice(0, 4).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  {trend.relevanceScore && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {Math.round(trend.relevanceScore * 100)}% match
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
