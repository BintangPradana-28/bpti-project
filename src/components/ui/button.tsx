import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          {
            "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sm font-semibold":
              variant === "default",
            "bg-slate-800 text-slate-100 hover:bg-slate-700":
              variant === "secondary",
            "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200":
              variant === "outline",
            "bg-rose-600 text-white hover:bg-rose-500 shadow-sm":
              variant === "destructive",
            "hover:bg-slate-800 text-slate-300 hover:text-white":
              variant === "ghost",
            "text-sky-400 underline-offset-4 hover:underline":
              variant === "link",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
