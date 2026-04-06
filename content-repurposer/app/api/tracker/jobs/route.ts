import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePremiumUser } from "@/lib/auth";

const jobSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  stage: z.enum(["saved", "applied", "interview", "final", "offer", "rejected"]),
  location: z.string().default("Remote"),
  salary: z.string().default("TBD"),
  notes: z.string().default(""),
  jd: z.string().default(""),
});

export async function GET() {
  const premium = await requirePremiumUser();
  if (!premium.ok) {
    return NextResponse.json({ error: premium.error }, { status: premium.status });
  }

  const jobs = await prisma.jobTracker.findMany({
    where: { userId: premium.userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
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

    const job = await prisma.jobTracker.create({
      data: { ...parsed.data, userId: premium.userId },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create job." }, { status: 500 });
  }
}
