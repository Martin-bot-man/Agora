import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/company";

const kitSchema = z.object({
  role: z.string().min(2),
  questions: z.array(z.string().min(2)).min(1),
});

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await getActiveCompany(userId);
  if (!company) {
    return NextResponse.json({ error: "Create a company first." }, { status: 400 });
  }

  const kits = await prisma.interviewKit.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ kits, company });
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = kitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const company = await getActiveCompany(userId);
    if (!company) {
      return NextResponse.json({ error: "Create a company first." }, { status: 400 });
    }

    const kit = await prisma.interviewKit.create({
      data: {
        companyId: company.id,
        role: parsed.data.role,
        questions: parsed.data.questions,
      },
    });

    return NextResponse.json({ kit }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create kit." }, { status: 500 });
  }
}
