import cron from "node-cron";
import { AGENTS, runAgent } from "./index";

console.log("[Run-CMD] Starting agent scheduler...");
console.log(`[Run-CMD] Registering ${AGENTS.length} agents:`);

for (const agent of AGENTS) {
  console.log(`  - ${agent.id} (${agent.schedule}): ${agent.description}`);

  cron.schedule(agent.schedule, async () => {
    try {
      await runAgent(agent);
    } catch (err) {
      console.error(`[Run-CMD] Agent ${agent.id} crashed:`, err);
    }
  });
}

console.log("[Run-CMD] All agents registered. Waiting for scheduled runs...");
console.log("[Run-CMD] Tip: Run agents manually with: npm run agent <agent-id>");

// Keep process alive
process.on("SIGINT", () => {
  console.log("[Run-CMD] Shutting down...");
  process.exit(0);
});
