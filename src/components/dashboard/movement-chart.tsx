"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface MovementTrendItem {
  month: string;
  masuk: number;
  keluar: number;
}

interface MovementChartProps {
  data: MovementTrendItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[160px]">
        <p className="font-semibold text-slate-200 border-b border-slate-800/80 pb-1 mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white">
              {entry.value.toLocaleString("id-ID")} unit
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function MovementChart({ data }: MovementChartProps) {
  const totalIn = data.reduce((sum, d) => sum + d.masuk, 0);
  const totalOut = data.reduce((sum, d) => sum + d.keluar, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </span>
            <span className="text-slate-400">Total Masuk:</span>
            <span className="font-mono font-bold text-emerald-400">
              +{totalIn.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-slate-400">Total Keluar:</span>
            <span className="font-mono font-bold text-rose-400">
              -{totalOut.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Periode 6 Bulan Terakhir
        </span>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="masuk"
              name="Barang Masuk"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradientMasuk)"
            />
            <Area
              type="monotone"
              dataKey="keluar"
              name="Barang Keluar"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradientKeluar)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
