import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePremiumUser } from "@/lib/auth";

const jobSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  stage: z.enum(["saved", "applied", "interview", "final", "offer", "rejected"]),
  location: z.string(),
  salary: z.string(),
  notes: z.string(),
  jd: z.string(),
});

type Params = {
  params: { id: string };
};

export async function PUT(req: Request, { params }: Params) {
  const premium = await requirePremiumUser();
  if (!premium.ok) {
    return NextResponse.json({ error: premium.error }, { status: premium.status });
  }

  try {
    const body = await req.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid job data.", issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await prisma.jobTracker.findFirst({
      where: { id: params.id, userId: premium.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const job = await prisma.jobTracker.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ job });
  } catch {
    return NextResponse.json({ error: "Unable to update job." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const premium = await requirePremiumUser();
  if (!premium.ok) {
    return NextResponse.json({ error: premium.error }, { status: premium.status });
  }

  try {
    const existing = await prisma.jobTracker.findFirst({
      where: { id: params.id, userId: premium.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    await prisma.jobTracker.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete job." }, { status: 500 });
  }
}
