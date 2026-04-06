import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreResumeAgainstJD } from "@/lib/ats";

const payloadSchema = z.object({
  resumeText: z.string().min(1),
  jobDescription: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const { resumeText, jobDescription } = parsed.data;
    const result = scoreResumeAgainstJD(resumeText, jobDescription);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Unable to score resume." }, { status: 500 });
  }
}
