"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ShieldCheck,
  LogOut,
  X,
  Loader2,
  Package,
  Laptop,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { globalSearchAction, GlobalSearchResult } from "@/actions/search-actions";
import { useDebounce } from "@/hooks/use-debounce";

interface HeaderProps {
  title: string;
  subtitle?: string;
  alertsCount?: number;
  user?: {
    name?: string | null;
    email?: string | null;
    roleName?: string | null;
  } | null;
}

export function Header({
  title,
  subtitle,
  alertsCount = 0,
  user,
}: HeaderProps) {
  const router = useRouter();

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification panel state
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsContainerRef = useRef<HTMLDivElement>(null);

  // Role display fallback from Better Auth client session if not passed via props
  const [currentRole, setCurrentRole] = useState(user?.roleName || "User");
  const [userName, setUserName] = useState(user?.name || "");

  useEffect(() => {
    if (user?.roleName) {
      setCurrentRole(user.roleName);
    }
    if (user?.name) {
      setUserName(user.name);
    }
    if (!user?.roleName) {
      // Query client session as fallback
      authClient.getSession().then((sess) => {
        if (sess?.data?.user) {
          const u = sess.data.user as { role?: string; name?: string };
          if (u.role) setCurrentRole(u.role);
          if (u.name) setUserName(u.name);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Execute global search when debouncedQuery changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let active = true;
    setIsSearching(true);

    globalSearchAction(trimmed)
      .then((res) => {
        if (active && res.success) {
          setResults(res.results);
        }
      })
      .finally(() => {
        if (active) setIsSearching(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
      if (
        alertsContainerRef.current &&
        !alertsContainerRef.current.contains(e.target as Node)
      ) {
        setAlertsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (url: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(url);
  };

  const getResultIcon = (type: GlobalSearchResult["type"]) => {
    switch (type) {
      case "item":
        return <Package className="h-3.5 w-3.5 text-emerald-400" />;
      case "asset":
        return <Laptop className="h-3.5 w-3.5 text-sky-400" />;
      case "location":
        return <MapPin className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  const formatRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "INVENTORY_ADMIN":
        return "Inventory Admin";
      case "IT_STAFF":
        return "IT Staff";
      case "MANAGER":
        return "Manager";
      case "AUDITOR":
        return "Auditor";
      case "VIEWER":
        return "Viewer";
      default:
        return role.replace(/_/g, " ");
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search Bar with Live Results Dropdown */}
        <div ref={searchContainerRef} className="relative w-72 hidden sm:block">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Cari katalog, tag aset, serial..."
              className="pl-9 pr-8 h-9 text-xs bg-slate-900/60 border-slate-800 focus-visible:ring-sky-500 text-white placeholder-slate-500"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-11 rounded-lg border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl p-2 z-50 text-xs space-y-1 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  <span>Mencari di seluruh sistem...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="py-4 text-center text-slate-500">
                  Tidak ditemukan hasil untuk &quot;{query}&quot;
                </div>
              ) : (
                <>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Hasil Pencarian ({results.length})
                  </div>
                  {results.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => handleSelectResult(res.url)}
                      className="w-full text-left p-2 rounded-md hover:bg-slate-800/60 transition-colors flex items-start gap-2.5 group"
                    >
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {getResultIcon(res.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-slate-200 group-hover:text-white truncate">
                            {res.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                            {res.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {res.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notifications / Alerts Popover */}
        <div ref={alertsContainerRef} className="relative">
          <button
            onClick={() => setAlertsOpen((prev) => !prev)}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Peringatan & Notifikasi Sistem"
          >
            <Bell className="h-4 w-4" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {alertsCount > 9 ? "9+" : alertsCount}
              </span>
            )}
          </button>

          {/* Alerts Popover Panel */}
          {alertsOpen && (
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl p-3 z-50 text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Notifikasi Sistem
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {alertsCount} aktif
                </span>
              </div>

              {alertsCount === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  <p className="text-xs">Tidak ada peringatan aktif saat ini.</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Seluruh stok dan operasional aset dalam kondisi normal.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300 space-y-1">
                    <div className="font-semibold flex items-center justify-between">
                      <span>Peringatan Operasional</span>
                      <Badge variant="warning" className="text-[9px] px-1 py-0">WARNING</Badge>
                    </div>
                    <p className="text-[11px] text-amber-200/80">
                      Terdapat {alertsCount} pengecualian stok barang atau aset yang memerlukan tindakan.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setAlertsOpen(false)}
                    className="block text-center text-[11px] text-sky-400 hover:underline pt-1"
                  >
                    Lihat detail di Ringkasan Operasional &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile, Dynamic Role Badge & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <Badge
            variant="outline"
            className="text-xs border-sky-500/40 bg-sky-500/10 text-sky-300 gap-1.5 hidden md:inline-flex py-1 px-2.5"
            title={userName ? `Logged in as: ${userName}` : undefined}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>{formatRoleLabel(currentRole)}</span>
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

