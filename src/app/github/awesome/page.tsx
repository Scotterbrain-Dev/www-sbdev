import { db } from "@/db";
import { awesomeRepoEntries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const REPOS = [
  { slug: "claude-code-awesome", label: "Claude Code Awesome" },
  { slug: "gemini-cli-awesome", label: "Gemini CLI Awesome" },
  { slug: "mcp-awesome", label: "MCP Awesome" },
];

async function getEntries(slug: string) {
  return db.select().from(awesomeRepoEntries).where(eq(awesomeRepoEntries.awesomeRepo, slug)).orderBy(desc(awesomeRepoEntries.addedAt)).limit(50);
}

export default async function AwesomeReposPage() {
  const data = await Promise.all(REPOS.map((r) => getEntries(r.slug)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Awesome Repos</h1>
          <p className="text-muted-foreground">New additions to Awesome lists</p>
        </div>
        <AgentRunButton agentId="awesome-repos" />
      </div>

      <Tabs defaultValue={REPOS[0].slug}>
        <TabsList>
          {REPOS.map((r) => <TabsTrigger key={r.slug} value={r.slug}>{r.label}</TabsTrigger>)}
        </TabsList>
        {REPOS.map((r, i) => (
          <TabsContent key={r.slug} value={r.slug}>
            <EntryList entries={data[i]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EntryList({ entries }: { entries: any[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No entries yet. Run the agent to track additions.</p>;
  }

  let lastSection = "";
  return (
    <div className="space-y-2 mt-4">
      {entries.map((entry) => {
        const showSection = entry.section !== lastSection;
        if (showSection) lastSection = entry.section ?? "";
        return (
          <div key={entry.id}>
            {showSection && entry.section && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-3 pb-1">{entry.section}</p>
            )}
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a href={entry.entryUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-1 text-sm">
                      {entry.entryName}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                    {entry.entryDescription && <p className="text-xs text-muted-foreground mt-0.5">{entry.entryDescription}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {new Date(entry.addedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
