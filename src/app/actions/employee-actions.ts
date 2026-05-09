"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
} from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createEmployee(
  input: z.infer<typeof employeeCreateSchema>
) {
  const admin = await requireAdmin();
  const parsed = employeeCreateSchema.parse(input);

  const exists = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });
  if (exists) throw new Error("Email sudah digunakan");

  if (parsed.employeeCode) {
    const codeExists = await prisma.user.findUnique({
      where: { employeeCode: parsed.employeeCode },
    });
    if (codeExists) throw new Error("Kode karyawan sudah digunakan");
  }

  const hashed = await bcrypt.hash(parsed.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      password: hashed,
      phone: parsed.phone ?? null,
      position: parsed.position ?? null,
      department: parsed.department ?? null,
      employeeCode: parsed.employeeCode ?? null,
      address: parsed.address ?? null,
      role: parsed.role,
      isActive: parsed.isActive,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "CREATE_EMPLOYEE",
      description: `Menambah karyawan ${user.email}`,
    },
  });

  revalidatePath("/admin/employees");
  return { success: true };
}

export async function updateEmployee(
  id: string,
  input: z.infer<typeof employeeUpdateSchema>
) {
  const admin = await requireAdmin();
  const parsed = employeeUpdateSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("Karyawan tidak ditemukan");

  if (parsed.email.toLowerCase() !== existing.email) {
    const dup = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });
    if (dup) throw new Error("Email sudah digunakan");
  }

  const data: any = {
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    phone: parsed.phone ?? null,
    position: parsed.position ?? null,
    department: parsed.department ?? null,
    employeeCode: parsed.employeeCode ?? null,
    address: parsed.address ?? null,
    role: parsed.role,
    isActive: parsed.isActive,
  };

  if (parsed.password && parsed.password.length >= 6) {
    data.password = await bcrypt.hash(parsed.password, 10);
  }

  await prisma.user.update({ where: { id }, data });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_EMPLOYEE",
      description: `Memperbarui karyawan ${parsed.email}`,
    },
  });

  revalidatePath("/admin/employees");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const admin = await requireAdmin();
  if (id === admin.id) throw new Error("Anda tidak dapat menghapus akun sendiri");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("Karyawan tidak ditemukan");

  await prisma.user.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "DELETE_EMPLOYEE",
      description: `Menghapus karyawan ${target.email}`,
    },
  });

  revalidatePath("/admin/employees");
  return { success: true };
}

export async function toggleEmployeeStatus(id: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Karyawan tidak ditemukan");

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "TOGGLE_STATUS",
      description: `${user.isActive ? "Menonaktifkan" : "Mengaktifkan"} ${user.email}`,
    },
  });

  revalidatePath("/admin/employees");
  return { success: true };
}
