import axios from "axios";

export interface OpenRouterModel {
  modelId: string;
  name: string;
  provider: string;
  contextLength: number | null;
  tokensPerSec: number | null;
}

// OpenRouter exposes public model listing via their API (no auth required for public data)
export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const { data } = await axios.get("https://openrouter.ai/api/v1/models", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; sbdev-bot/1.0)",
    },
    timeout: 15000,
  });

  if (!data?.data || !Array.isArray(data.data)) return [];

  return data.data.map((model: any) => {
    const [provider] = (model.id ?? "").split("/");
    return {
      modelId: model.id ?? "",
      name: model.name ?? model.id ?? "",
      provider: provider ?? "unknown",
      contextLength: model.context_length ?? null,
      tokensPerSec: null, // Not in public API; would require scraping rankings page
    };
  }).filter((m: OpenRouterModel) => m.modelId);
}

// Benchmark scores are only available on the OpenRouter rankings page (client-rendered).
// Until we add Playwright, we store what we can from the public API and leave scores null.
// The rankings page URL: https://openrouter.ai/rankings
// TODO: Add Playwright scraping for full benchmark data
