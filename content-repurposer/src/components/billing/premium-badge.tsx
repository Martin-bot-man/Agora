"use client";

import { useAuth } from "@clerk/nextjs";

export function PremiumBadge() {
  const { isLoaded, has } = useAuth();

  if (!isLoaded) return null;
  const isPremium = has?.({ plan: "premium" }) ?? false;
  if (!isPremium) return null;

  return (
    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700">
      Premium
    </span>
  );
}
