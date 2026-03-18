import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const changelogs = pgTable("changelogs", {
  id: serial("id").primaryKey(),
  product: text("product").notNull(),
  version: text("version"),
  title: text("title").notNull(),
  contentMd: text("content_md"),
  url: text("url").unique().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
  isMajor: boolean("is_major").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
