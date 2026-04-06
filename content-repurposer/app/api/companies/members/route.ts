import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/company";

const memberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["owner", "admin", "recruiter"]).default("recruiter"),
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const company = await getActiveCompany(userId);
    if (!company) {
      return NextResponse.json({ error: "Create a company first." }, { status: 400 });
    }

    const member = await prisma.companyMember.upsert({
      where: { companyId_userId: { companyId: company.id, userId: parsed.data.userId } },
      update: { role: parsed.data.role },
      create: {
        companyId: company.id,
        userId: parsed.data.userId,
        role: parsed.data.role,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add member." }, { status: 500 });
  }
}
