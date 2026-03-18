import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const claudeSkills = pgTable("claude_skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  type: text("type").notNull().$type<"skill" | "agent" | "connector">(),
  description: text("description"),
  url: text("url"),
  category: text("category"),
  isNew: boolean("is_new").default(false),
  seenAt: timestamp("seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
