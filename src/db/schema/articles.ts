import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";

export const aiArticles = pgTable("ai_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").unique().notNull(),
  source: text("source"),
  author: text("author"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  summary: text("summary"),
  funnyScore: real("funny_score"),
  shockScore: real("shock_score"),
  tags: text("tags").array(),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiTrends = pgTable("ai_trends", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").unique().notNull(),
  source: text("source"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  summary: text("summary"),
  relevanceScore: real("relevance_score"),
  tags: text("tags").array(),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
});
