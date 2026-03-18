import { db } from "@/db";
import { claudeSkills } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getByType(type: "skill" | "agent" | "connector") {
  return db.select().from(claudeSkills).where(eq(claudeSkills.type, type)).orderBy(desc(claudeSkills.seenAt));
}

export default async function ClaudeSkillsPage() {
  const [skills, agents, connectors] = await Promise.all([
    getByType("skill"),
    getByType("agent"),
    getByType("connector"),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claude Skills & Connectors</h1>
          <p className="text-muted-foreground">All Claude skills, agents, and connectors (updated 3x/week)</p>
        </div>
        <AgentRunButton agentId="claude-skills" />
      </div>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="connectors">Connectors ({connectors.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="skills"><SkillList items={skills} /></TabsContent>
        <TabsContent value="agents"><SkillList items={agents} /></TabsContent>
        <TabsContent value="connectors"><SkillList items={connectors} /></TabsContent>
      </Tabs>
    </div>
  );
}

function SkillList({ items }: { items: any[] }) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No items yet. Run the agent to fetch Claude skills and connectors.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.isNew && <Badge className="text-xs">New</Badge>}
                  {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
                </div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-1 text-sm">
                    {item.name}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                ) : (
                  <p className="font-medium text-sm">{item.name}</p>
                )}
                {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(item.seenAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
