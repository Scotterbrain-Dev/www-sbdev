import { pgTable, serial, text, integer, real, date, boolean, timestamp, unique } from "drizzle-orm/pg-core";

export const openrouterModels = pgTable("openrouter_models", {
  id: serial("id").primaryKey(),
  modelId: text("model_id").notNull(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  rank: integer("rank"),
  scoreIntelligence: real("score_intelligence"),
  scoreCoding: real("score_coding"),
  scoreAgentic: real("score_agentic"),
  tokensPerSec: real("tokens_per_sec"),
  weeklyTokensB: real("weekly_tokens_b"), // weekly usage in billions from rankings page
  contextLength: integer("context_length"),
  snapshotWeek: date("snapshot_week").notNull(),
  isTopApp: boolean("is_top_app").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: unique().on(t.modelId, t.snapshotWeek),
}));

export const openrouterLangScores = pgTable("openrouter_lang_scores", {
  id: serial("id").primaryKey(),
  modelId: text("model_id").notNull(),
  language: text("language").notNull(),
  score: real("score"),
  rank: integer("rank"),
  snapshotWeek: date("snapshot_week").notNull(),
}, (t) => ({
  uniq: unique().on(t.modelId, t.language, t.snapshotWeek),
}));

export const openrouterTopApps = pgTable("openrouter_top_apps", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  weeklyTokensB: real("weekly_tokens_b"),
  snapshotDate: date("snapshot_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: unique().on(t.name, t.snapshotDate),
}));
