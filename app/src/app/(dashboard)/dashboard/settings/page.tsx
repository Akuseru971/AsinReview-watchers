// src/app/(dashboard)/dashboard/settings/page.tsx
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" subtitle="Account and configuration" />

      <div className="flex-1 px-6 py-6 space-y-5 max-w-2xl">
        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">Account</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Email</span>
              <span className="text-sm text-slate-200">
                {session?.user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Name</span>
              <span className="text-sm text-slate-200">
                {session?.user?.name ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">
              Data Source
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              Currently using the{" "}
              <code className="text-blue-400 rounded bg-slate-700 px-1.5 py-0.5 text-xs">
                mock-connector
              </code>
              . To connect a real Amazon data source, implement{" "}
              <code className="text-blue-400 rounded bg-slate-700 px-1.5 py-0.5 text-xs">
                ReviewConnector
              </code>{" "}
              and update{" "}
              <code className="text-blue-400 rounded bg-slate-700 px-1.5 py-0.5 text-xs">
                src/lib/connectors/index.ts
              </code>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
