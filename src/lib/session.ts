import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.ADMIN) redirect("/employee/dashboard");
  return user;
}

export async function requireEmployee() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.EMPLOYEE) redirect("/admin/dashboard");
  return user;
}
