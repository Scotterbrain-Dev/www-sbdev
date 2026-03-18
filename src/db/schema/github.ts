import { pgTable, serial, text, integer, date, timestamp, unique } from "drizzle-orm/pg-core";

export const githubTrending = pgTable("github_trending", {
  id: serial("id").primaryKey(),
  repoFullName: text("repo_full_name").notNull(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  description: text("description"),
  language: text("language"),
  starsTotal: integer("stars_total"),
  starsToday: integer("stars_today"),
  forks: integer("forks"),
  url: text("url"),
  period: text("period").notNull().$type<"daily" | "weekly" | "monthly">(),
  snapshotDate: date("snapshot_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: unique().on(t.repoFullName, t.period, t.snapshotDate),
}));

export const awesomeRepoEntries = pgTable("awesome_repo_entries", {
  id: serial("id").primaryKey(),
  awesomeRepo: text("awesome_repo").notNull(),
  entryName: text("entry_name").notNull(),
  entryUrl: text("entry_url").notNull(),
  entryDescription: text("entry_description"),
  commitSha: text("commit_sha").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull(),
  section: text("section"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: unique().on(t.awesomeRepo, t.entryUrl),
}));
