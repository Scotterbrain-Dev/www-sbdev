import cron from "node-cron";
import { AGENTS, runAgent } from "./index";

console.log("[scheduler] Starting agent scheduler...");
console.log(`[scheduler] Registering ${AGENTS.length} agents:`);

for (const agent of AGENTS) {
  console.log(`  - ${agent.id} (${agent.schedule}): ${agent.description}`);

  cron.schedule(agent.schedule, async () => {
    try {
      await runAgent(agent);
    } catch (err) {
      console.error(`[scheduler] Agent ${agent.id} crashed:`, err);
    }
  });
}

console.log("[scheduler] All agents registered. Waiting for scheduled runs...");
console.log("[scheduler] Tip: Run agents manually with: npm run agent <agent-id>");

// Keep process alive
process.on("SIGINT", () => {
  console.log("[scheduler] Shutting down...");
  process.exit(0);
});
