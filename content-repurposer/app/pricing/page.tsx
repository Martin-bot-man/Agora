import { PricingTable, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="text-sm uppercase tracking-[0.35em] text-slate-400">Pricing</div>
          <h1 className="text-4xl font-semibold tracking-tight">Choose your plan</h1>
          <p className="text-sm text-slate-500">
            Upgrade to unlock premium features like synced job tracking and ATS optimization.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PricingTable />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">
          <p>
            Annual billing and free trials are available if enabled in your Clerk Billing plans.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SignedIn>
              <Link
                href="/pricing"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Manage subscription
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/auth/login"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Sign in to upgrade
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </main>
  );
}
