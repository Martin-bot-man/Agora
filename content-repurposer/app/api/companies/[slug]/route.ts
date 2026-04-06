import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { slug: string };
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: { jobPosts: { orderBy: { createdAt: "desc" } } },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }
    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Unable to load company." }, { status: 500 });
  }
}
