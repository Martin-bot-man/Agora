import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/company";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().min(2).optional(),
  status: z.enum(["sourced", "screen", "interview", "offer", "hired", "rejected"]).optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type Params = {
  params: { id: string };
};

export async function PUT(req: Request, { params }: Params) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const company = await getActiveCompany(userId);
    if (!company) {
      return NextResponse.json({ error: "Create a company first." }, { status: 400 });
    }

    const existing = await prisma.candidate.findFirst({
      where: { id: params.id, companyId: company.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ candidate });
  } catch {
    return NextResponse.json({ error: "Unable to update candidate." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const company = await getActiveCompany(userId);
    if (!company) {
      return NextResponse.json({ error: "Create a company first." }, { status: 400 });
    }

    const existing = await prisma.candidate.findFirst({
      where: { id: params.id, companyId: company.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    await prisma.candidate.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete candidate." }, { status: 500 });
  }
}
