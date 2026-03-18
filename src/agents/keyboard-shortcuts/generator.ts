import type Anthropic from "@anthropic-ai/sdk";
import type { AppConfig } from "./apps";

export interface GeneratedShortcut {
  keyCombo: string;
  action: string;
  description: string;
  category: string;
  platform: string;
  confidence: number;
}

const SHORTCUT_TOOL = {
  name: "save_shortcuts",
  description: "Save the keyboard shortcuts and commands for an application",
  input_schema: {
    type: "object" as const,
    properties: {
      shortcuts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            keyCombo: { type: "string", description: "The key combination or command (e.g. 'Ctrl+Shift+P', ':wq', 'git stash pop')" },
            action: { type: "string", description: "Short label for what it does (e.g. 'Open command palette')" },
            description: { type: "string", description: "Longer explanation of what it does and when to use it" },
            category: { type: "string", description: "Category (e.g. 'Navigation', 'Editing', 'Git', 'AI Features')" },
            platform: { type: "string", enum: ["all", "windows", "mac", "linux"], description: "Which platform this applies to" },
            confidence: { type: "number", description: "Confidence score 0.0-1.0 that this is accurate" },
          },
          required: ["keyCombo", "action", "description", "category", "platform", "confidence"],
        },
      },
    },
    required: ["shortcuts"],
  },
};

export async function generateShortcuts(
  app: AppConfig,
  platform: string,
  anthropic: Anthropic
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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    tools: [SHORTCUT_TOOL],
    tool_choice: { type: "any" },
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "save_shortcuts") {
      const input = block.input as { shortcuts: GeneratedShortcut[] };
      return input.shortcuts ?? [];
    }
  }

  return [];
}
