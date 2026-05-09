"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { changePasswordSchema, profileUpdateSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveBase64Image } from "@/lib/upload";

export async function updateProfile(
  input: z.infer<typeof profileUpdateSchema>
) {
  const me = await requireAuth();
  const parsed = profileUpdateSchema.parse(input);

  let photoPath: string | undefined;
  if (parsed.photo && parsed.photo.startsWith("data:image")) {
    photoPath = await saveBase64Image(parsed.photo, `profile_${me.id}`);
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: {
      phone: parsed.phone ?? undefined,
      address: parsed.address ?? undefined,
      ...(photoPath ? { photo: photoPath } : {}),
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: me.id,
      action: "UPDATE_PROFILE",
      description: "Memperbarui profil",
    },
  });

  revalidatePath("/employee/profile");
  revalidatePath("/admin/profile");
  return { success: true, user: { ...updated, password: undefined } };
}

export async function changePassword(
  input: z.infer<typeof changePasswordSchema>
) {
  const me = await requireAuth();
  const parsed = changePasswordSchema.parse(input);

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) throw new Error("User tidak ditemukan");

  const ok = await bcrypt.compare(parsed.currentPassword, user.password);
  if (!ok) throw new Error("Password saat ini salah");

  const hashed = await bcrypt.hash(parsed.newPassword, 10);
  await prisma.user.update({
    where: { id: me.id },
    data: { password: hashed },
  });

  await prisma.activityLog.create({
    data: {
      userId: me.id,
      action: "CHANGE_PASSWORD",
      description: "Mengubah password",
    },
  });

  return { success: true };
}
