# OpenRouter LLM Options by Use Case

All model IDs are in OpenRouter format: `provider/model-id`
Pricing is approximate tokens/$ at time of writing. Pick one per use case and update the relevant agent file.

---

## Use Case 1: Keyboard Shortcuts Generator
**Agent:** `src/agents/keyboard-shortcuts/generator.ts`
**Requirements:** Structured output (tool use), high factual accuracy, broad app knowledge, long output

| # | Model | OpenRouter ID | Context | Notes |
|---|-------|--------------|---------|-------|
| 1 | Claude Sonnet 4.6 | `anthropic/claude-sonnet-4-6` | 200K | Currently used. Best tool_use, highest accuracy for app-specific facts |
| 2 | Claude Opus 4.6 | `anthropic/claude-opus-4-6` | 200K | Overkill for this but best possible quality/depth |
| 3 | GPT-4o | `openai/gpt-4o` | 128K | Strong structured output, broad app knowledge |
| 4 | Gemini 2.5 Pro | `google/gemini-2.5-pro` | 1M | Massive context, very capable, strong on factual tasks |
| 5 | DeepSeek V3 | `deepseek/deepseek-chat` | 64K | Excellent quality, significantly cheaper than Claude/GPT |

**Current model:** `claude-sonnet-4-6`

---

## Use Case 2: Article Classification (Funny / Shock Scoring)
**Agent:** `src/agents/ai-articles/classifier.ts`
**Requirements:** Fast, cheap, batched classification, JSON output, runs every 4 hours

| # | Model | OpenRouter ID | Context | Notes |
|---|-------|--------------|---------|-------|
| 1 | Claude Haiku 4.5 | `anthropic/claude-haiku-4-5-20251001` | 200K | Currently used. Cheapest Claude, great for classification batches |
| 2 | GPT-4o Mini | `openai/gpt-4o-mini` | 128K | Very cheap, solid JSON output, comparable to Haiku |
| 3 | Gemini 2.5 Flash | `google/gemini-2.5-flash` | 1M | Fastest Gemini, cheap, good classification |
| 4 | Llama 4 Scout | `meta-llama/llama-4-scout` | 512K | Free tier available on OpenRouter, good for light tasks |
| 5 | Mistral Small | `mistralai/mistral-small-3.1-24b` | 128K | Fast, cheap, good at instruction following |

**Current model:** `claude-haiku-4-5-20251001`

---

## Use Case 3: Changelog & Content Summarization
**Agent:** `src/agents/changelogs/index.ts` (future enhancement — AI summaries of scraped content)
**Requirements:** Concise summaries, markdown-aware, handles technical content well

| # | Model | OpenRouter ID | Context | Notes |
|---|-------|--------------|---------|-------|
| 1 | Claude Haiku 4.5 | `anthropic/claude-haiku-4-5-20251001` | 200K | Great at concise technical summaries, cheap for frequent runs |
| 2 | Gemini 2.5 Flash | `google/gemini-2.5-flash` | 1M | Handles long changelogs in one shot, very fast |
| 3 | GPT-4o Mini | `openai/gpt-4o-mini` | 128K | Solid summarization at low cost |
| 4 | Llama 4 Maverick | `meta-llama/llama-4-maverick` | 512K | Strong reasoning, good at structured content extraction |
| 5 | Qwen 2.5 72B | `qwen/qwen-2.5-72b-instruct` | 128K | Underrated for summarization, very cheap per token |

**Current model:** N/A (not yet AI-enhanced)

---

## Use Case 4: AI Trend Relevance Scoring
**Agent:** `src/agents/ai-trends/index.ts` (future enhancement — replace keyword matching)
**Requirements:** Understands AI/LLM domain deeply, fast, cheap, batch scoring

| # | Model | OpenRouter ID | Context | Notes |
|---|-------|--------------|---------|-------|
| 1 | Claude Haiku 4.5 | `anthropic/claude-haiku-4-5-20251001` | 200K | Deep AI domain knowledge even in small model |
| 2 | GPT-4o Mini | `openai/gpt-4o-mini` | 128K | Good domain understanding, cheap batching |
| 3 | Gemini 2.5 Flash | `google/gemini-2.5-flash` | 1M | Great at classification tasks, very low latency |
| 4 | Mistral 7B Instruct | `mistralai/mistral-7b-instruct` | 32K | Cheapest option, good enough for binary relevance scoring |
| 5 | DeepSeek V3 | `deepseek/deepseek-chat` | 64K | Strong reasoning at low cost, good at nuanced scoring |

**Current model:** N/A (keyword matching, no AI yet)

---

## Use Case 5: OpenRouter Rankings Scrape Interpretation
**Agent:** `src/agents/openrouter/index.ts` (future — parse raw scraped HTML into structured data)
**Requirements:** Parse messy HTML/text into structured JSON, reasoning about rankings data

| # | Model | OpenRouter ID | Context | Notes |
|---|-------|--------------|---------|-------|
| 1 | Claude Sonnet 4.6 | `anthropic/claude-sonnet-4-6` | 200K | Best at structured extraction from unstructured text |
| 2 | GPT-4o | `openai/gpt-4o` | 128K | Excellent at structured data extraction |
| 3 | Gemini 2.5 Pro | `google/gemini-2.5-pro` | 1M | Can handle full page HTML in one shot |
| 4 | DeepSeek V3 | `deepseek/deepseek-chat` | 64K | Strong at parsing tasks, very cheap |
| 5 | Llama 4 Maverick | `meta-llama/llama-4-maverick` | 512K | Good reasoning, can follow complex extraction instructions |

**Current model:** N/A (uses public REST API only; scraping pending Playwright)

---

## Use Case 6: Claude Skills Page Scrape Interpretation
**Agent:** `src/agents/claude-skills/scraper.ts` (future — use AI to interpret page structure)
**Requirements:** Understand page HTML, extract name/type/description cleanly, categorize items

| # | Model | OpenRouter ID | Context | Notes |
|---|-------|--------------|---------|-------|
| 1 | Claude Haiku 4.5 | `anthropic/claude-haiku-4-5-20251001` | 200K | Anthropic-native so knows its own products best |
| 2 | GPT-4o Mini | `openai/gpt-4o-mini` | 128K | Cheap HTML parsing, good instruction following |
| 3 | Gemini 2.5 Flash | `google/gemini-2.5-flash` | 1M | Large context fits full page HTML easily |
| 4 | Mistral Small | `mistralai/mistral-small-3.1-24b` | 128K | Fast, cheap, decent at extraction tasks |
| 5 | Qwen 2.5 72B | `qwen/qwen-2.5-72b-instruct` | 128K | Surprisingly good at HTML parsing, low cost |

**Current model:** N/A (cheerio CSS selector scraping only)

---

## Quick Reference: Model Tiers

### Budget (high volume, every few hours)
- `anthropic/claude-haiku-4-5-20251001`
- `openai/gpt-4o-mini`
- `google/gemini-2.5-flash`
- `mistralai/mistral-small-3.1-24b`
- `meta-llama/llama-4-scout`

### Mid-tier (daily/weekly tasks, quality matters)
- `anthropic/claude-sonnet-4-6`
- `openai/gpt-4o`
- `deepseek/deepseek-chat`
- `meta-llama/llama-4-maverick`
- `qwen/qwen-2.5-72b-instruct`

### Premium (one-off or critical tasks)
- `anthropic/claude-opus-4-6`
- `google/gemini-2.5-pro`
- `openai/o3`
- `openai/o4-mini`
- `deepseek/deepseek-r1`

---

## How to Switch Models

In each agent file, find the `model:` parameter and replace with your chosen OpenRouter model ID.
You will also need to swap from the Anthropic SDK to the OpenRouter-compatible OpenAI SDK:

```ts
// Install: npm install openai
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Then use exactly like the OpenAI SDK:
const response = await openrouter.chat.completions.create({
  model: "deepseek/deepseek-chat",  // any OpenRouter model ID
  messages: [{ role: "user", content: "..." }],
});
```

Add `OPENROUTER_API_KEY=sk-or-...` to `.env.local`.
