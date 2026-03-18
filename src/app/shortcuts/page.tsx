import { db } from "@/db";
import { shortcutsApps } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import Link from "next/link";
import { Keyboard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShortcutsPage() {
  const apps = await db.select().from(shortcutsApps).orderBy(shortcutsApps.category, shortcutsApps.name);

  const byCategory = apps.reduce((acc, app) => {
    const cat = app.category ?? "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(app);
    return acc;
  }, {} as Record<string, typeof apps>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Keyboard Shortcuts & Commands</h1>
          <p className="text-muted-foreground">AI-generated shortcuts, commands, tips and tricks per app</p>
        </div>
        <AgentRunButton agentId="keyboard-shortcuts" label="Generate Shortcuts" />
      </div>

      {apps.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No shortcuts yet. Run the agent to generate shortcuts for all configured apps.
          <br />
          <span className="text-xs mt-1 block">Note: This uses Claude Sonnet and may take a few minutes.</span>
        </p>
      ) : (
        Object.entries(byCategory).map(([category, categoryApps]) => (
          <div key={category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categoryApps.map((app) => (
                <Link key={app.id} href={`/shortcuts/${app.slug}`}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Keyboard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{app.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {app.lastGeneratedAt
                          ? `Updated ${new Date(app.lastGeneratedAt).toLocaleDateString()}`
                          : "Not yet generated"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
