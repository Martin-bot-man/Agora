// app/api/repurpose/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGroqCompletion } from "../../../lib/groq"; 
import { getResumePrompt } from "../../../lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { resumeText, jobDescription, step, isEncoded } = body;

    // Decode Base64 if you implemented the frontend 'btoa' fix
    if (isEncoded && resumeText) {
      resumeText = Buffer.from(resumeText, 'base64').toString('utf-8');
    }

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Resume text is missing" }, { status: 400 });
    }

    // Build prompt - ensure your lib/prompts.ts uses these keys
    const prompt = getResumePrompt(step, { resumeText, jobDescription });

    const aiResult = await getGroqCompletion(prompt);

    return NextResponse.json({ result: aiResult });

  } catch (error: any) {
    console.error("Server Error:", error);
    // Returning JSON prevents the "Unexpected token <" error
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}