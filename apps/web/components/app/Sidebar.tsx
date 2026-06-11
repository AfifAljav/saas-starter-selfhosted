"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

const settingsNavigation = [
  {
    label: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    label: "Team",
    href: "/settings/team",
    icon: Users,
  },
  {
    label: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
  },
];

interface SidebarProps {
  appName?: string;
}

export function Sidebar({ appName = process.env.NEXT_PUBLIC_APP_NAME ?? "SaaS Starter" }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      id="app-sidebar"
      className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo / App name */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            {appName.charAt(0)}
          </div>
          <span className="truncate">{appName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Main nav */}
        <div>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Settings nav */}
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Settings
          </p>
          <ul className="space-y-1">
            {settingsNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <form action="/api/auth/logout" method="POST">
          <button
            id="sidebar-logout-btn"
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
