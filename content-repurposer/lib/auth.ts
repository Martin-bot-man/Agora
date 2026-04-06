import { auth, clerkClient } from "@clerk/nextjs/server";

export async function requirePremiumUser() {
  const { userId, has } = await auth();
  if (!userId) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const plan = user.publicMetadata?.plan;
  const hasPremiumPlan = has?.({ plan: "premium" }) ?? false;
  if (!hasPremiumPlan && plan !== "premium") {
    return { ok: false, status: 403, error: "Premium account required" } as const;
  }

  return { ok: true, userId } as const;
}
