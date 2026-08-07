import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// full user row incl. billing/creator fields. null when logged out.
export async function getCurrentUserFull() {
  const session = await getSession();
  if (!session?.user) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { verificationRequest: true }
  });
}
