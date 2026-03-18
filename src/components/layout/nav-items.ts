export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: Array<{ label: string; href: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  {
    label: "Shortcuts & Commands",
    href: "/shortcuts",
    icon: "Keyboard",
  },
  {
    label: "GitHub Trending",
    href: "/github/trending",
    icon: "TrendingUp",
  },
  {
    label: "Awesome Repos",
    href: "/github/awesome",
    icon: "Star",
  },
  {
    label: "AI Trends",
    href: "/ai-trends",
    icon: "Brain",
  },
  {
    label: "AI Articles",
    href: "/articles",
    icon: "Newspaper",
  },
  {
    label: "OpenRouter",
    href: "/openrouter/leaderboard",
    icon: "BarChart3",
    children: [
      { label: "Leaderboard", href: "/openrouter/leaderboard" },
      { label: "Benchmarks", href: "/openrouter/benchmarks" },
      { label: "Fastest LLMs", href: "/openrouter/fastest" },
      { label: "Languages", href: "/openrouter/languages" },
      { label: "Top Apps", href: "/openrouter/top-apps" },
    ],
  },
  {
    label: "Changelogs",
    href: "/changelogs",
    icon: "FileText",
  },
  {
    label: "Claude Skills",
    href: "/claude-skills",
    icon: "Zap",
  },
];
