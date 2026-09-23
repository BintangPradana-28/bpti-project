"use client";

import { Search, Bell, ShieldCheck, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  alertsCount?: number;
}

export function Header({ title, subtitle, alertsCount = 0 }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative w-64 hidden sm:block">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Search items, assets, serial..."
            className="pl-9 h-9 text-xs bg-slate-900/60 border-slate-800 focus-visible:ring-sky-500"
          />
        </div>

        {/* Notifications / Alerts */}
        <button
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          title="System Alerts"
        >
          <Bell className="h-4 w-4" />
          {alertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* User profile, Role chip & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <Badge variant="outline" className="text-xs border-sky-500/40 bg-sky-500/10 text-sky-300 gap-1 hidden md:inline-flex">
            <ShieldCheck className="h-3 w-3 text-sky-400" />
            Super Admin
          </Badge>
          <button
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
            title="Keluar dari akun"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
