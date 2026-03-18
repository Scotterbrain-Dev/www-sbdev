import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const trackedRepos = pgTable("tracked_repos", {
  id: serial("id").primaryKey(),
  // e.g. "hesreallyhim/awesome-claude-code"
  upstreamFullName: text("upstream_full_name").unique().notNull(),
  // e.g. "Scotterbrain-Dev/awesome-claude-code"
  forkFullName: text("fork_full_name").notNull(),
  // last upstream commit SHA we processed — compare starts here next run
  lastProcessedSha: text("last_processed_sha"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
