"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Keyboard, TrendingUp, Star, Brain,
  Newspaper, BarChart3, FileText, Zap, ChevronDown,
} from "lucide-react";
import { useState } from "react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Keyboard, TrendingUp, Star, Brain,
  Newspaper, BarChart3, FileText, Zap,
};

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card h-screen sticky top-0 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">SB Dev</h1>
        <p className="text-xs text-muted-foreground">AI-Powered Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expanded === item.href;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.href)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                        pathname === child.href
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">Agents update automatically</p>
      </div>
    </aside>
  );
}
