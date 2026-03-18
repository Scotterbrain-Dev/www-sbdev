#!/usr/bin/env tsx
/**
 * CLI runner for agents.
 * Usage: npm run agent <agent-id>
 * Example: npm run agent github-trending
 */

import { AGENT_MAP, runAgent } from "@/agents";

const agentId = process.argv[2];

if (!agentId) {
  console.error("Usage: npm run agent <agent-id>");
  console.error("Available agents:");
  for (const [id] of AGENT_MAP) {
    console.error(`  - ${id}`);
  }
  process.exit(1);
}

const agent = AGENT_MAP.get(agentId);
if (!agent) {
  console.error(`Unknown agent: ${agentId}`);
  console.error("Available:", Array.from(AGENT_MAP.keys()).join(", "));
  process.exit(1);
}

runAgent(agent)
  .then(() => {
    console.log(`Agent ${agentId} completed successfully`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Agent ${agentId} failed:`, err);
    process.exit(1);
  });
