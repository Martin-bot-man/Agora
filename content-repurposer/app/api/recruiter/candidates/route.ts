import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/company";

const candidateSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  status: z.enum(["sourced", "screen", "interview", "offer", "hired", "rejected"]),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await getActiveCompany(userId);
  if (!company) {
    return NextResponse.json({ error: "Create a company first." }, { status: 400 });
  }

  const candidates = await prisma.candidate.findMany({
    where: { companyId: company.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ candidates, company });
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = candidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const company = await getActiveCompany(userId);
    if (!company) {
      return NextResponse.json({ error: "Create a company first." }, { status: 400 });
    }

    const data = parsed.data;
    const candidate = await prisma.candidate.create({
      data: {
        companyId: company.id,
        name: data.name,
        role: data.role,
        status: data.status,
        email: data.email || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ candidate }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create candidate." }, { status: 500 });
  }
}
