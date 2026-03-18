import { db } from "@/db";
import { shortcuts, shortcutsApps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AppShortcutsPage({ params }: { params: Promise<{ appSlug: string }> }) {
  const { appSlug } = await params;

  const [app] = await db.select().from(shortcutsApps).where(eq(shortcutsApps.slug, appSlug));
  if (!app) notFound();

  const appShortcuts = await db
    .select()
    .from(shortcuts)
    .where(eq(shortcuts.appId, app.id))
    .orderBy(shortcuts.category, shortcuts.keyCombo);

  const byCategory = appShortcuts.reduce((acc, sc) => {
    const cat = sc.category ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sc);
    return acc;
  }, {} as Record<string, typeof appShortcuts>);

  const platforms = [...new Set(appShortcuts.map((s) => s.platform).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{app.name}</h1>
          {app.category && <Badge variant="outline">{app.category}</Badge>}
        </div>
        <p className="text-muted-foreground">
          {appShortcuts.length} shortcuts & commands
          {app.lastGeneratedAt && ` · Updated ${new Date(app.lastGeneratedAt).toLocaleDateString()}`}
        </p>
      </div>

      {appShortcuts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No shortcuts generated yet. Run the keyboard-shortcuts agent.</p>
      ) : platforms.length > 1 ? (
        <Tabs defaultValue={platforms[0] ?? "all"}>
          <TabsList>
            {platforms.map((p) => <TabsTrigger key={p} value={p!}>{p}</TabsTrigger>)}
          </TabsList>
          {platforms.map((platform) => (
            <TabsContent key={platform} value={platform!}>
              <ShortcutsByCategory
                byCategory={Object.fromEntries(
                  Object.entries(byCategory).map(([cat, scs]) => [
                    cat,
                    scs.filter((s) => s.platform === platform || s.platform === "all"),
                  ]).filter(([, scs]) => scs.length > 0)
                )}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ShortcutsByCategory byCategory={byCategory} />
      )}
    </div>
  );
}

function ShortcutsByCategory({ byCategory }: { byCategory: Record<string, any[]> }) {
  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([category, scs]) => (
        <Card key={category}>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">{category}</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Shortcut / Command</TableHead>
                  <TableHead className="w-48">Action</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scs.map((sc) => (
                  <TableRow key={sc.id}>
                    <TableCell>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{sc.keyCombo}</code>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{sc.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sc.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
