// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  BarChart2,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "ASINs", icon: Package },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-slate-700/50 bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700/50">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AR</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">
            AsinReview
          </p>
          <p className="text-xs text-slate-500">Watchers</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
