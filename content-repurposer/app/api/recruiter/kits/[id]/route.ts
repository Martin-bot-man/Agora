import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/company";

const updateSchema = z.object({
  role: z.string().min(2).optional(),
  questions: z.array(z.string().min(2)).min(1).optional(),
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

    const existing = await prisma.interviewKit.findFirst({
      where: { id: params.id, companyId: company.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Kit not found." }, { status: 404 });
    }

    const kit = await prisma.interviewKit.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ kit });
  } catch {
    return NextResponse.json({ error: "Unable to update kit." }, { status: 500 });
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

    const existing = await prisma.interviewKit.findFirst({
      where: { id: params.id, companyId: company.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Kit not found." }, { status: 404 });
    }

    await prisma.interviewKit.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete kit." }, { status: 500 });
  }
}
