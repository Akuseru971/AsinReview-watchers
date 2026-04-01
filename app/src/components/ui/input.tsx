// src/components/ui/input.tsx
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100",
              "placeholder:text-slate-500 text-sm px-3 py-2",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
              "transition-colors duration-150",
              icon && "pl-9",
              error && "border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100",
            "text-sm px-3 py-2",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
            "transition-colors duration-150",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
