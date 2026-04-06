import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePremiumUser } from "@/lib/auth";

const reminderSchema = z.object({
  jobTrackerId: z.string().min(1),
  remindAt: z.string().min(1),
  note: z.string().min(2),
});

export async function GET() {
  const premium = await requirePremiumUser();
  if (!premium.ok) {
    return NextResponse.json({ error: premium.error }, { status: premium.status });
  }

  const reminders = await prisma.jobReminder.findMany({
    where: { userId: premium.userId },
    orderBy: { remindAt: "asc" },
  });

  return NextResponse.json({ reminders });
}

export async function POST(req: Request) {
  const premium = await requirePremiumUser();
  if (!premium.ok) {
    return NextResponse.json({ error: premium.error }, { status: premium.status });
  }

  try {
    const body = await req.json();
    const parsed = reminderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reminder data.", issues: parsed.error.issues }, { status: 400 });
    }

    const { jobTrackerId, remindAt, note } = parsed.data;
    const job = await prisma.jobTracker.findFirst({
      where: { id: jobTrackerId, userId: premium.userId },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const reminder = await prisma.jobReminder.create({
      data: {
        userId: premium.userId,
        jobTrackerId,
        remindAt: new Date(remindAt),
        note,
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create reminder." }, { status: 500 });
  }
}
