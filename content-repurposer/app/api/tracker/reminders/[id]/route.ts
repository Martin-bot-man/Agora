import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePremiumUser } from "@/lib/auth";

const updateSchema = z.object({
  remindAt: z.string().min(1).optional(),
  note: z.string().min(2).optional(),
  completed: z.boolean().optional(),
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
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reminder data.", issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await prisma.jobReminder.findFirst({
      where: { id: params.id, userId: premium.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
    }

    const data = parsed.data;
    const reminder = await prisma.jobReminder.update({
      where: { id: params.id },
      data: {
        note: data.note ?? existing.note,
        remindAt: data.remindAt ? new Date(data.remindAt) : existing.remindAt,
        completedAt: data.completed === undefined ? existing.completedAt : data.completed ? new Date() : null,
      },
    });

    return NextResponse.json({ reminder });
  } catch {
    return NextResponse.json({ error: "Unable to update reminder." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const premium = await requirePremiumUser();
  if (!premium.ok) {
    return NextResponse.json({ error: premium.error }, { status: premium.status });
  }

  try {
    const existing = await prisma.jobReminder.findFirst({
      where: { id: params.id, userId: premium.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
    }

    await prisma.jobReminder.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete reminder." }, { status: 500 });
  }
}
