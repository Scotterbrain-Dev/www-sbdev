export interface ChangelogSource {
  product: string;
  displayName: string;
  type: "html" | "github-releases" | "rss";
  url: string;
  // For HTML scraping: CSS selectors for entries
  selectors?: {
    item: string;
    title: string;
    content?: string;
    version?: string;
    date?: string;
  };
  // For GitHub releases
  githubOwner?: string;
  githubRepo?: string;
}

export const CHANGELOG_SOURCES: ChangelogSource[] = [
  {
    product: "claude-code",
    displayName: "Claude Code",
    type: "html",
    url: "https://docs.anthropic.com/en/release-notes/claude-code",
    selectors: {
      item: "section, .release-entry, article",
      title: "h2, h3",
      content: "p, ul",
      version: "h2, h3",
      date: "time, .date",
    },
  },
  {
    product: "cursor",
    displayName: "Cursor",
    type: "html",
    url: "https://www.cursor.com/changelog",
    selectors: {
      item: "section, article, .changelog-entry",
      title: "h2, h3",
      content: "p",
      version: "h2",
      date: "time, .date",
    },
  },
  {
    product: "windsurf",
    displayName: "Windsurf",
    type: "html",
    url: "https://codeium.com/changelog",
    selectors: {
      item: "section, article, .changelog-item",
      title: "h2, h3",
      content: "p",
      version: "h2",
      date: "time",
    },
  },
  {
    product: "piecesos",
    displayName: "PiecesOS",
    type: "github-releases",
    url: "https://api.github.com/repos/pieces-app/pieces-os-client-sdk-for-python/releases",
    githubOwner: "pieces-app",
    githubRepo: "pieces-os-client-sdk-for-python",
  },
  {
    product: "aider",
    displayName: "Aider",
    type: "github-releases",
    url: "https://api.github.com/repos/paul-gauthier/aider/releases",
    githubOwner: "paul-gauthier",
    githubRepo: "aider",
  },
  {
    product: "continue",
    displayName: "Continue",
    type: "github-releases",
    url: "https://api.github.com/repos/continuedev/continue/releases",
    githubOwner: "continuedev",
    githubRepo: "continue",
  },
  {
    product: "zed",
    displayName: "Zed",
    type: "github-releases",
    url: "https://api.github.com/repos/zed-industries/zed/releases",
    githubOwner: "zed-industries",
    githubRepo: "zed",
  },
];
