import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">AR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AsinReview Watchers</h1>
          <p className="mt-1 text-sm text-slate-400">Simple mode without login</p>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 text-center space-y-4">
          <p className="text-sm text-slate-300">
            Authentication is disabled. Open the dashboard directly.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 text-sm transition-colors"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
