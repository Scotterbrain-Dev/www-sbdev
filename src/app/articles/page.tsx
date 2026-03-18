import { db } from "@/db";
import { aiArticles } from "@/db/schema";
import { desc, gte, or, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getArticles() {
  return db
    .select()
    .from(aiArticles)
    .orderBy(desc(aiArticles.scrapedAt))
    .limit(50);
}

function scoreColor(score: number | null): string {
  if (!score) return "outline";
  if (score >= 0.7) return "destructive";
  if (score >= 0.4) return "default";
  return "secondary";
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Articles</h1>
          <p className="text-muted-foreground">Funny, shocking, and interesting AI articles</p>
        </div>
        <AgentRunButton agentId="arty-jotai" />
      </div>

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No articles yet. Run the agent to fetch and classify AI articles.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-1 text-sm">
                      {article.title}
                      <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                    </a>
                    {article.summary && <p className="text-xs text-muted-foreground mt-1">{article.summary}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {article.source && <Badge variant="outline" className="text-xs">{article.source}</Badge>}
                      {article.publishedAt && <span className="text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span>}
                      {article.tags && article.tags.length > 0 && article.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    {article.funnyScore && article.funnyScore > 0.3 && (
                      <Badge variant={scoreColor(article.funnyScore) as any} className="text-xs block">
                        Funny {Math.round(article.funnyScore * 10)}/10
                      </Badge>
                    )}
                    {article.shockScore && article.shockScore > 0.3 && (
                      <Badge variant={scoreColor(article.shockScore) as any} className="text-xs block">
                        Shock {Math.round(article.shockScore * 10)}/10
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
