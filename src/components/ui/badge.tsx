import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-sky-500/20 text-sky-300 border-sky-500/30":
            variant === "default",
          "border-transparent bg-slate-800 text-slate-300":
            variant === "secondary",
          "border-transparent bg-emerald-500/20 text-emerald-300 border-emerald-500/30":
            variant === "success",
          "border-transparent bg-amber-500/20 text-amber-300 border-amber-500/30":
            variant === "warning",
          "border-transparent bg-rose-500/20 text-rose-300 border-rose-500/30":
            variant === "destructive",
          "border-slate-700 text-slate-300": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
