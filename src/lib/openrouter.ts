import OpenAI from "openai";
import { env } from "./env";

// OpenRouter uses the OpenAI-compatible API format
export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://sbdev.local",
    "X-Title": "SB Dev Dashboard",
  },
});

// Gemini models — least expensive options that still produce quality output
export const MODELS = {
  // Best value: fast, capable, supports function calling — used for most agents
  default: "google/gemini-2.5-flash",

  // Cheapest: even lower cost for high-volume simple tasks (article classification)
  fast: "google/gemini-2.0-flash-001",
} as const;
