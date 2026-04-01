// src/components/layout/topbar.tsx
import { SyncButton } from "@/components/dashboard/sync-button";
import { ExportButton } from "@/components/dashboard/export-button";

interface TopbarProps {
  title: string;
  subtitle?: string;
  showSync?: boolean;
  showExport?: boolean;
}

export function Topbar({
  title,
  subtitle,
  showSync = false,
  showExport = false,
}: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showSync && <SyncButton />}
        {showExport && <ExportButton />}
      </div>
    </header>
  );
}
