import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" subtitle="Internal tool configuration" />

      <div className="flex-1 px-6 py-6 space-y-5 max-w-2xl">
        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">Mode</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">
              This dashboard runs as an internal tool without login or account flow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">Data Source</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              The ingestion layer is provider-based. Update
              <span className="mx-1 rounded bg-slate-700 px-1.5 py-0.5 text-xs text-blue-400">
                src/lib/connectors/index.ts
              </span>
              to switch provider implementation without changing the dashboard UI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
