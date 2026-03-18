import { db } from "@/db";
import { openrouterLangScores } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentRunButton } from "@/components/agents/agent-run-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

const LANGUAGES = ["python", "javascript", "java", "typescript", "lua", "go", "c++"];

export default async function LanguagesPage() {
  const [latest] = await db.select({ week: openrouterLangScores.snapshotWeek }).from(openrouterLangScores).orderBy(desc(openrouterLangScores.snapshotWeek)).limit(1);

  const scores = latest
    ? await db.select().from(openrouterLangScores).where(eq(openrouterLangScores.snapshotWeek, latest.week))
    : [];

  const byLang = LANGUAGES.reduce((acc, lang) => {
    acc[lang] = scores.filter((s) => s.language === lang).sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    return acc;
  }, {} as Record<string, typeof scores>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programming Language Scores</h1>
          <p className="text-muted-foreground">LLM coding scores per language from OpenRouter</p>
        </div>
        <AgentRunButton agentId="frank-router" />
      </div>

      {scores.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-muted-foreground">Language-specific scores require scraping openrouter.ai/rankings.</p>
          <p className="text-xs text-muted-foreground">Future: Add Playwright support for full language breakdown data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => (
            <Card key={lang}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{lang}</CardTitle>
              </CardHeader>
              <CardContent>
                {byLang[lang].length === 0 ? (
                  <p className="text-xs text-muted-foreground">No data</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byLang[lang].slice(0, 10).map((s, i) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-muted-foreground">{s.rank ?? i + 1}</TableCell>
                          <TableCell className="text-sm">{s.modelId}</TableCell>
                          <TableCell className="text-right font-medium">{s.score?.toFixed(1) ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
