// src/app/(auth)/login/page.tsx
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">AR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AsinReview Watchers</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your dashboard</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
          <form
            action={async (formData) => {
              "use server";
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/dashboard",
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue="demo@example.com"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                defaultValue="password123"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 text-sm transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Demo: demo@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
