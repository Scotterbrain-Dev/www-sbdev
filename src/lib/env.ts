import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().default(""),
  GITHUB_TOKEN: z.string().default(""),
  AGENT_SECRET: z.string().default("dev-secret-change-in-prod"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }
  return result.data!;
}

export const env = parseEnv();
