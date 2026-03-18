import { db } from "@/db";
import { changelogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const PRODUCTS = [
  { slug: "claude-code", label: "Claude Code" },
  { slug: "cursor", label: "Cursor" },
  { slug: "windsurf", label: "Windsurf" },
  { slug: "piecesos", label: "PiecesOS" },
  { slug: "aider", label: "Aider" },
  { slug: "continue", label: "Continue" },
  { slug: "zed", label: "Zed" },
];

async function getChangelogs(product: string) {
  return db.select().from(changelogs).where(eq(changelogs.product, product)).orderBy(desc(changelogs.publishedAt), desc(changelogs.createdAt)).limit(30);
}

export default async function ChangelogsPage() {
  const allData = await Promise.all(PRODUCTS.map((p) => getChangelogs(p.slug)));
  const allChangelogs = allData.flat().sort((a, b) => {
    const aDate = a.publishedAt ?? a.createdAt;
    const bDate = b.publishedAt ?? b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Changelogs & News</h1>
          <p className="text-muted-foreground">Release notes and updates for dev tools</p>
        </div>
        <AgentRunButton agentId="lucy-change" />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {PRODUCTS.map((p) => <TabsTrigger key={p.slug} value={p.slug}>{p.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="all">
          <ChangelogList entries={allChangelogs} showProduct />
        </TabsContent>
        {PRODUCTS.map((p, i) => (
          <TabsContent key={p.slug} value={p.slug}>
            <ChangelogList entries={allData[i]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ChangelogList({ entries, showProduct }: { entries: any[]; showProduct?: boolean }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No changelogs yet. Run the agent to fetch release notes.</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {showProduct && <Badge variant="outline" className="text-xs">{entry.product}</Badge>}
                  {entry.version && <Badge variant="secondary" className="text-xs">{entry.version}</Badge>}
                  {entry.isMajor && <Badge className="text-xs">Major</Badge>}
                </div>
                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-1 text-sm">
                  {entry.title}
                  <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                </a>
                {entry.contentMd && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{entry.contentMd}</p>}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString() : new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
