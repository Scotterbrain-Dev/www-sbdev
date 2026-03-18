# The Shorthand Guide to Everything Claude Code

A complete reference for skills, hooks, subagents, MCPs, plugins, and workflow optimizations.

---

## Skills and Commands

Skills operate like rules, constrained to certain scopes and workflows. They are shorthand prompts for executing particular workflows.

**Examples:**
- `/refactor-clean` — clean out dead code and loose `.md` files after a long session
- `/tdd`, `/e2e`, `/test-coverage` — testing workflows
- `codemap-updater` — updates codemaps at checkpoints so Claude can navigate your codebase without burning context on exploration

Skills and commands can be chained together in a single prompt.

**Storage locations:**
```
~/.claude/skills/     # Broader workflow definitions
~/.claude/commands/   # Quick executable prompts
```

```bash
~/.claude/skills/
  pmx-guidelines.md      # Project-specific patterns
  coding-standards.md    # Language best practices
  tdd-workflow/          # Multi-file skill with README.md
  security-review/       # Checklist-based skill
```

---

## Hooks

Hooks are trigger-based automations that fire on specific lifecycle events. Unlike skills, they are constrained to tool calls and lifecycle events.

### Hook Types

| Hook | Fires When |
| --- | --- |
| `PreToolUse` | Before a tool executes (validation, reminders) |
| `PostToolUse` | After a tool finishes (formatting, feedback loops) |
| `UserPromptSubmit` | When you send a message |
| `Stop` | When Claude finishes responding |
| `PreCompact` | Before context compaction |
| `Notification` | Permission requests |

### Example: tmux reminder before long-running commands

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

**Tip:** Use the `hookify` plugin to create hooks conversationally instead of writing JSON manually. Run `/hookify` and describe what you want.

---

## Subagents

Subagents are processes your orchestrator (main Claude) can delegate tasks to with limited scopes. They run in background or foreground, freeing up context for the main agent.

Subagents work well with skills — a subagent capable of executing a subset of your skills can be delegated tasks and use those skills autonomously. They can also be sandboxed with specific tool permissions.

```bash
~/.claude/agents/
  planner.md               # Feature implementation planning
  architect.md             # System design decisions
  tdd-guide.md             # Test-driven development
  code-reviewer.md         # Quality/security review
  security-reviewer.md     # Vulnerability analysis
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

Configure allowed tools, MCPs, and permissions per subagent for proper scoping.

---

## Rules and Memory

Your `.rules` folder holds `.md` files with best practices Claude should always follow.

**Two approaches:**
- **Single CLAUDE.md** — everything in one file (user or project level)
- **Rules folder** — modular `.md` files grouped by concern

```bash
~/.claude/rules/
  security.md      # No hardcoded secrets, validate inputs
  coding-style.md  # Immutability, file organization
  testing.md       # TDD workflow, 80% coverage
  git-workflow.md  # Commit format, PR process
  agents.md        # When to delegate to subagents
  performance.md   # Model selection, context management
```

**Example rules:**
- No emojis in codebase
- Refrain from purple hues in frontend
- Always test code before deployment
- Prioritize modular code over mega-files
- Never commit `console.log`s

---

## MCPs (Model Context Protocol)

MCPs connect Claude to external services directly. Not a replacement for APIs — it is a prompt-driven wrapper around them, allowing more flexibility in navigating information.

**Example:** Supabase MCP lets Claude pull specific data, run SQL directly upstream without copy-paste. Same for databases, deployment platforms, etc.

**Chrome plugin:** A built-in plugin MCP that lets Claude autonomously control your browser.

### Context Window Management

> **Critical:** Be picky with MCPs. Keep all MCPs in user config but disable everything unused.

Your 200k context window before compacting might only be 70k with too many tools enabled. Performance degrades significantly.

**Rule of thumb:** Have 20–30 MCPs configured, but keep under 10 enabled and under 80 tools active per project.

Navigate to `/plugins` and scroll down, or run `/mcp` to manage them.

---

## Plugins

Plugins package tools for easy installation instead of tedious manual setup. A plugin can be a skill + MCP combined, or hooks/tools bundled together.

```bash
# Add a marketplace
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# Open Claude, run /plugins, find new marketplace, install from there
```

**LSP Plugins** are particularly useful if you run Claude Code outside editors frequently. Language Server Protocol gives Claude real-time type checking, go-to-definition, and intelligent completions without needing an IDE open.

```bash
typescript-lsp@claude-plugins-official  # TypeScript intelligence
pyright-lsp@claude-plugins-official     # Python type checking
hookify@claude-plugins-official         # Create hooks conversationally
mgrep@Mixedbread-Grep                   # Better search than ripgrep
```

Same warning as MCPs — watch your context window.

---

## Tips and Tricks

### Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+U` | Delete entire line |
| `!` | Quick bash command prefix |
| `@` | Search for files |
| `/` | Initiate slash commands |
| `Shift+Enter` | Multi-line input |
| `Tab` | Toggle thinking display |
| `Esc Esc` | Interrupt Claude / restore code |

### Parallel Workflows

**`/fork`** — Fork conversations to do non-overlapping tasks in parallel instead of spamming queued messages.

**Git Worktrees** — For overlapping parallel Claude instances without conflicts. Each worktree is an independent checkout.

```bash
git worktree add ../feature-branch feature-branch
# Now run separate Claude instances in each worktree
```

**tmux for long-running commands** — Stream and watch logs/bash processes Claude runs.

```bash
tmux new -s dev
# Claude runs commands here, you can detach and reattach
tmux attach -t dev
```

### mgrep over grep

`mgrep` is a significant improvement over ripgrep/grep. Install via plugin marketplace, then use the `/mgrep` skill. Works with both local search and web search.

```bash
mgrep "function handleSubmit"               # Local search
mgrep --web "Next.js 15 app router changes" # Web search
```

### Other Useful Commands

| Command | Action |
| --- | --- |
| `/rewind` | Go back to a previous state |
| `/statusline` | Customize with branch, context %, todos |
| `/checkpoints` | File-level undo points |
| `/compact` | Manually trigger context compaction |
| `/fork` | Fork the current conversation |

### GitHub Actions CI/CD

Set up automated code review on your PRs with GitHub Actions. Claude can review PRs automatically when configured.

### Sandboxing

Use sandbox mode for risky operations — Claude runs in a restricted environment without affecting your actual system.

```bash
# Restricted sandbox (safe)
claude --sandbox

# Unrestricted (use with caution — can be destructive)
claude --dangerously-skip-permissions
```

---

## Editor Setup

### Zed (Recommended)

A Rust-based editor that is lightweight, fast, and highly customizable.

**Why Zed works well with Claude Code:**
- **Agent Panel** — track file changes in real-time as Claude edits, jump between files Claude references
- **Performance** — opens instantly, handles large codebases without lag
- **`CMD+Shift+R` Command Palette** — quick access to all custom slash commands, debuggers, and tools
- **Minimal Resource Usage** — won't compete with Claude during heavy operations
- **Vim Mode** — full vim keybindings

**Zed tips:**
- `Ctrl+G` — quickly open the file Claude is currently working on
- Enable **autosave** so Claude's file reads are always current
- Split screen: terminal with Claude Code on one side, editor on the other
- Use editor's git features to review Claude's changes before committing
- Verify file watchers / auto-reload is enabled

### VSCode / Cursor

Also viable. Use in terminal format with `\ide` for automatic sync and LSP functionality, or use the extension for a more integrated UI.

---

## Complete Setup Reference

### Plugins (enable 4–5 at a time)

```
ralph-wiggum@claude-code-plugins        # Loop automation
frontend-design@claude-code-plugins     # UI/UX patterns
commit-commands@claude-code-plugins     # Git workflow
security-guidance@claude-code-plugins   # Security checks
pr-review-toolkit@claude-code-plugins   # PR automation
typescript-lsp@claude-plugins-official  # TS intelligence
hookify@claude-plugins-official         # Hook creation
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official        # Live documentation
pyright-lsp@claude-plugins-official     # Python types
mgrep@Mixedbread-Grep                   # Better search
```

### MCP Servers (configure all, enable 5–6 per project)

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": { "type": "http", "url": "https://bindings.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-builds": { "type": "http", "url": "https://builds.mcp.cloudflare.com/mcp" },
  "cloudflare-observability": { "type": "http", "url": "https://observability.mcp.cloudflare.com/mcp" },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

### Disable unused MCPs per project

```json
"disabledMcpServers": [
  "playwright",
  "cloudflare-workers-builds",
  "cloudflare-workers-bindings",
  "cloudflare-observability",
  "cloudflare-docs",
  "clickhouse",
  "AbletonMCP",
  "context7",
  "magic"
]
```

### Key Hooks

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux reminder"] },
    { "matcher": "Write && .md file", "hooks": ["block unless README/CLAUDE"] },
    { "matcher": "git push", "hooks": ["open editor for review"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["grep console.log warning"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["check modified files for console.log"] }
  ]
}
```

### Rules Structure

```
~/.claude/rules/
  security.md      # Mandatory security checks
  coding-style.md  # Immutability, file size limits
  testing.md       # TDD, 80% coverage
  git-workflow.md  # Conventional commits
  agents.md        # Subagent delegation rules
  patterns.md      # API response formats
  performance.md   # Model selection (Haiku vs Sonnet vs Opus)
  hooks.md         # Hook documentation
```

### Subagents

```
~/.claude/agents/
  planner.md               # Break down features
  architect.md             # System design
  tdd-guide.md             # Write tests first
  code-reviewer.md         # Quality review
  security-reviewer.md     # Vulnerability scan
  build-error-resolver.md
  e2e-runner.md            # Playwright tests
  refactor-cleaner.md      # Dead code removal
  doc-updater.md           # Keep docs synced
```

---

## Key Takeaways

- **Don't overcomplicate** — treat configuration like fine-tuning, not architecture
- **Context window is precious** — disable unused MCPs and plugins
- **Parallel execution** — fork conversations, use git worktrees
- **Automate the repetitive** — hooks for formatting, linting, reminders
- **Scope your subagents** — limited tools = focused execution

---

## References

- [Plugins Reference](https://code.claude.com/docs/en/plugins)
- [Hooks Documentation](https://code.claude.com/docs/en/hooks-guide)
- [Checkpointing](https://code.claude.com/docs/en/checkpoints)
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
- [Memory System](https://code.claude.com/docs/en/memory)
- [Subagents](https://code.claude.com/docs/en/subagents)
- [MCP Overview](https://code.claude.com/docs/en/mcp)
