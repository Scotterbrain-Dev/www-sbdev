import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const shortcutsApps = pgTable("shortcuts_apps", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  category: text("category"),
  iconUrl: text("icon_url"),
  lastGeneratedAt: timestamp("last_generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shortcuts = pgTable("shortcuts", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => shortcutsApps.id),
  keyCombo: text("key_combo").notNull(),
  action: text("action").notNull(),
  description: text("description"),
  category: text("category"),
  platform: text("platform").default("all"),
  source: text("source").default("ai-generated"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shortcutsAppsRelations = relations(shortcutsApps, ({ many }) => ({
  shortcuts: many(shortcuts),
}));

export const shortcutsRelations = relations(shortcuts, ({ one }) => ({
  app: one(shortcutsApps, { fields: [shortcuts.appId], references: [shortcutsApps.id] }),
}));
