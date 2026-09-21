"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Laptop,
  ArrowRightLeft,
  Wrench,
  MapPin,
  FileBarChart,
  ShieldAlert,
  Users,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    title: "Monitoring & KPI",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory & Stock",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Asset Tracking",
    href: "/assets",
    icon: Laptop,
  },
  {
    title: "Assignments & Transfers",
    href: "/assignments",
    icon: ArrowRightLeft,
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Locations Tree",
    href: "/locations",
    icon: MapPin,
  },
  {
    title: "Reports & Export",
    href: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Audit Trail",
    href: "/audit",
    icon: ShieldAlert,
  },
  {
    title: "Users & Access",
    href: "/users",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 flex flex-col justify-between p-4 h-screen sticky top-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
            <Building2 className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white">BPTI System</div>
            <div className="text-xs text-slate-400">Inventory & Assets</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-sky-400" : "text-slate-400")} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Organizational Footer */}
      <div className="border-t border-slate-800/80 pt-3 px-2">
        <div className="text-[11px] text-slate-400">
          <div className="font-medium text-slate-400">BPTI Asset System</div>
          <div className="text-slate-400">Balai Pelatihan TI • v1.0</div>
        </div>
      </div>
    </aside>
  );
}
