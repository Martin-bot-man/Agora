import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const jobSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  location: z.string().optional(),
  jobType: z.string().optional(),
  applyUrl: z.string().url().optional().or(z.literal("")),
  applyEmail: z.string().email().optional().or(z.literal("")),
  description: z.string().min(20),
});

export async function GET() {
  const jobs = await prisma.jobPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid job post data.", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { userId } = auth();
    const job = await prisma.jobPost.create({
      data: {
        userId: userId ?? null,
        title: data.title,
        company: data.company,
        location: data.location || null,
        jobType: data.jobType || null,
        applyUrl: data.applyUrl || null,
        applyEmail: data.applyEmail || null,
        description: data.description,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create job post." }, { status: 500 });
  }
}
