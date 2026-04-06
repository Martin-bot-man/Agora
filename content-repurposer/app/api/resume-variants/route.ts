import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  resumeTitle: z.string().min(2).optional(),
  resumeText: z.string().min(1),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  jobDescription: z.string().optional(),
  content: z.string().min(1),
  atsScore: z.number().int().min(0).max(100).optional(),
});

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.resumeProfile.findMany({
    where: { userId },
    include: { variants: { orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ profiles });
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;
    const resumeTitle = data.resumeTitle?.trim() || "Primary Resume";

    let profile = await prisma.resumeProfile.findFirst({
      where: { userId, title: resumeTitle },
    });

    if (!profile) {
      profile = await prisma.resumeProfile.create({
        data: {
          userId,
          title: resumeTitle,
          baseText: data.resumeText,
        },
      });
    } else {
      await prisma.resumeProfile.update({
        where: { id: profile.id },
        data: { baseText: data.resumeText },
      });
    }

    const variant = await prisma.resumeVariant.create({
      data: {
        resumeId: profile.id,
        jobTitle: data.jobTitle || null,
        company: data.company || null,
        jobDescription: data.jobDescription || null,
        content: data.content,
        atsScore: data.atsScore ?? null,
      },
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save variant." }, { status: 500 });
  }
}
