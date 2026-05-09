"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { officeSettingSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getOfficeSetting() {
  return prisma.officeSetting.findFirst();
}

export async function upsertOfficeSetting(
  input: z.infer<typeof officeSettingSchema>
) {
  const admin = await requireAdmin();
  const parsed = officeSettingSchema.parse(input);

  const existing = await prisma.officeSetting.findFirst();
  const setting = existing
    ? await prisma.officeSetting.update({
        where: { id: existing.id },
        data: parsed,
      })
    : await prisma.officeSetting.create({ data: parsed });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_OFFICE_SETTING",
      description: "Memperbarui pengaturan kantor",
    },
  });

  revalidatePath("/admin/settings");
  return { success: true, setting };
}
