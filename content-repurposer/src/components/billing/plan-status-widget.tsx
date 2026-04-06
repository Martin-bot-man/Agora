"use client";

import Link from "next/link";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/nextjs";

export function PlanStatusWidget() {
  const { isLoaded, has } = useAuth();
  const { user } = useUser();

  const isPremium = isLoaded ? has?.({ plan: "premium" }) ?? false : false;
  const metadataPlan = user?.publicMetadata?.plan;
  const planLabel = isPremium || metadataPlan === "premium" ? "Premium" : "Free";

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
      <div className="text-sm font-semibold text-slate-900">Plan: {planLabel}</div>
      <div className="mt-2 flex items-center gap-2">
        <SignedIn>
          <Link
            href="/pricing"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Manage
          </Link>
        </SignedIn>
        <SignedOut>
          <Link
            href="/auth/login"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Sign in
          </Link>
        </SignedOut>
      </div>
    </div>
  );
}
