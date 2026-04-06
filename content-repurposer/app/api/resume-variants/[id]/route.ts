import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string };
};

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const variant = await prisma.resumeVariant.findFirst({
      where: { id: params.id, resume: { userId } },
      include: { resume: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found." }, { status: 404 });
    }

    await prisma.resumeVariant.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete variant." }, { status: 500 });
  }
}
