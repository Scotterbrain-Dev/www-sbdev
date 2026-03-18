export interface AppConfig {
  slug: string;
  name: string;
  category: string;
  platforms: Array<"windows" | "mac" | "linux" | "all">;
  context?: string; // extra context for the AI generator
}

export const APPS: AppConfig[] = [
  // AI Coding Tools
  { slug: "cursor", name: "Cursor", category: "ai-editor", platforms: ["windows", "mac", "linux"], context: "Cursor AI code editor, VS Code based with AI features" },
  { slug: "windsurf", name: "Windsurf", category: "ai-editor", platforms: ["windows", "mac", "linux"], context: "Windsurf AI code editor by Codeium" },
  { slug: "claude-code", name: "Claude Code", category: "ai-cli", platforms: ["all"], context: "Claude Code CLI tool by Anthropic for agentic coding in the terminal" },
  { slug: "github-copilot", name: "GitHub Copilot", category: "ai-editor", platforms: ["windows", "mac", "linux"], context: "GitHub Copilot in VS Code and other IDEs" },

  // Editors & IDEs
  { slug: "vscode", name: "VS Code", category: "editor", platforms: ["windows", "mac", "linux"] },
  { slug: "neovim", name: "Neovim", category: "editor", platforms: ["all"] },
  { slug: "vim", name: "Vim", category: "editor", platforms: ["all"] },
  { slug: "jetbrains-idea", name: "IntelliJ IDEA", category: "editor", platforms: ["windows", "mac", "linux"] },

  // Terminal & Shell
  { slug: "tmux", name: "tmux", category: "terminal", platforms: ["all"], context: "tmux terminal multiplexer keyboard shortcuts and commands" },
  { slug: "bash", name: "Bash", category: "shell", platforms: ["all"], context: "Bash shell keyboard shortcuts, readline bindings, and common commands" },
  { slug: "zsh", name: "Zsh", category: "shell", platforms: ["all"], context: "Zsh shell keyboard shortcuts, oh-my-zsh tips and tricks" },

  // Browsers
  { slug: "chrome", name: "Chrome", category: "browser", platforms: ["windows", "mac", "linux"] },
  { slug: "firefox", name: "Firefox", category: "browser", platforms: ["windows", "mac", "linux"] },

  // Git
  { slug: "git", name: "Git", category: "vcs", platforms: ["all"], context: "Git command line tips, tricks, and useful commands" },
  { slug: "github-cli", name: "GitHub CLI (gh)", category: "vcs", platforms: ["all"], context: "GitHub CLI (gh) commands and tips" },
];
