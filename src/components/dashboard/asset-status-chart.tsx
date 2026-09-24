"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Layers } from "lucide-react";

export interface AssetDistributionItem {
  name: string;
  status: string;
  count: number;
  fill: string;
}

interface AssetStatusChartProps {
  data: AssetDistributionItem[];
  total: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AssetDistributionItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/95 p-2.5 shadow-xl backdrop-blur-md text-xs space-y-1 min-w-[140px]">
        <div className="flex items-center gap-1.5 font-medium text-slate-200">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.fill }}
          />
          <span>{item.name}</span>
        </div>
        <p className="font-mono font-bold text-white text-sm">
          {item.count.toLocaleString("id-ID")}{" "}
          <span className="text-xs font-normal text-slate-400">aset</span>
        </p>
      </div>
    );
  }
  return null;
}

export function AssetStatusChart({ data, total }: AssetStatusChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter out slices with 0 count so the pie chart doesn't render empty segments
  const nonZeroData = data.filter((item) => item.count > 0);

  if (total === 0 || nonZeroData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] text-center text-slate-500">
        <Layers className="h-10 w-10 stroke-[1.2] text-slate-600 mb-2" />
        <p className="text-sm font-medium text-slate-400">Belum Ada Data Aset</p>
        <p className="text-xs text-slate-600">
          Daftarkan aset pertama untuk melihat diagram distribusi siklus hidup.
        </p>
      </div>
    );
  }

  const activeItem = activeIndex !== null ? nonZeroData[activeIndex] : null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Donut Chart Container */}
      <div className="relative h-[240px] w-[240px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={nonZeroData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={3}
              dataKey="count"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              cursor="pointer"
              stroke="transparent"
            >
              {nonZeroData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="transition-all duration-200"
                  style={{
                    filter:
                      activeIndex === index
                        ? "brightness(1.2) drop-shadow(0 0 6px rgba(255,255,255,0.2))"
                        : "brightness(1.0)",
                    transform: activeIndex === index ? "scale(1.03)" : "scale(1)",
                    transformOrigin: "center center",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total / Hover Stat Overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {activeItem ? activeItem.status : "Total Aset"}
          </span>
          <span className="font-mono text-2xl font-black tracking-tight text-white">
            {(activeItem ? activeItem.count : total).toLocaleString("id-ID")}
          </span>
          <span className="text-[10px] text-slate-500">
            {activeItem
              ? `${Math.round((activeItem.count / total) * 100)}% dari total`
              : "unit terdaftar"}
          </span>
        </div>
      </div>

      {/* Breakdown Legend List */}
      <div className="flex-1 w-full space-y-2">
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.status}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="truncate text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-semibold text-slate-200">
                  {item.count.toLocaleString("id-ID")}
                </span>
                <span className="font-mono text-[11px] text-slate-500 w-10 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
