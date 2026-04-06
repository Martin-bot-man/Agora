import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const companySchema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies });
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = companySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", issues: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;
    const baseSlug = slugify(data.name);
    let slug = baseSlug || `company-${Date.now()}`;
    let suffix = 1;
    while (await prisma.company.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug,
        website: data.website || null,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create company." }, { status: 500 });
  }
}
