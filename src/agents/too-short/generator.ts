import type OpenAI from "openai";
import { MODELS } from "@/lib/openrouter";
import type { AppConfig } from "./apps";

export interface GeneratedShortcut {
  keyCombo: string;
  action: string;
  description: string;
  category: string;
  platform: string;
  confidence: number;
}

const SHORTCUT_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: "save_shortcuts",
    description: "Save the keyboard shortcuts and commands for an application",
    parameters: {
      type: "object",
      properties: {
        shortcuts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              keyCombo: { type: "string", description: "The key combination or command (e.g. 'Ctrl+Shift+P', ':wq', 'git stash pop')" },
              action: { type: "string", description: "Short label for what it does" },
              description: { type: "string", description: "Longer explanation and when to use it" },
              category: { type: "string", description: "Category (e.g. 'Navigation', 'Editing', 'AI Features')" },
              platform: { type: "string", enum: ["all", "windows", "mac", "linux"] },
              confidence: { type: "number", description: "Confidence 0.0-1.0 that this is accurate" },
            },
            required: ["keyCombo", "action", "description", "category", "platform", "confidence"],
          },
        },
      },
      required: ["shortcuts"],
    },
  },
};

export async function generateShortcuts(
  app: AppConfig,
  platform: string,
  ai: OpenAI
): Promise<GeneratedShortcut[]> {
  const prompt = `Generate a comprehensive list of keyboard shortcuts, commands, tips and tricks for ${app.name}.
${app.context ? `Context: ${app.context}` : ""}
Platform: ${platform}

Include:
- Essential keyboard shortcuts (50+ if applicable)
- Important commands/CLI commands
- Power-user tips and tricks
- Workflow optimizations
- Hidden/less-known features

Focus on accuracy. Only include shortcuts/commands you are highly confident are correct.`;

  const response = await ai.chat.completions.create({
    model: MODELS.default, // gemini-2.5-flash — best quality/cost for structured generation
    messages: [{ role: "user", content: prompt }],
    tools: [SHORTCUT_TOOL],
    tool_choice: { type: "function", function: { name: "save_shortcuts" } },
    temperature: 0,
  });

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") return [];

  try {
    const args = JSON.parse(toolCall.function.arguments) as { shortcuts: GeneratedShortcut[] };
    return args.shortcuts ?? [];
  } catch {
    return [];
  }
}
