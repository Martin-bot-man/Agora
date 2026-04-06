import { prisma } from "@/lib/prisma";

export const getActiveCompany = async (userId: string) => {
  const membership = await prisma.companyMember.findFirst({
    where: { userId },
    include: { company: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.company ?? null;
};
