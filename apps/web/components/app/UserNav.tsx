"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

interface UserNavProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-3 ml-auto">
      {/* Theme toggle */}
      <div className="flex items-center rounded-md border border-border bg-background p-1 gap-0.5">
        {(["light", "system", "dark"] as const).map((t) => {
          const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
          return (
            <button
              key={t}
              id={`theme-${t}-btn`}
              onClick={() => setTheme(t)}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
              className={`rounded p-1 transition-colors ${
                theme === t
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      {/* User avatar / info */}
      <div
        id="user-nav-avatar"
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors cursor-default"
        title={`${user.name} (${user.email})`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold ring-2 ring-primary/20">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
