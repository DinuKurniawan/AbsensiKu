"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireEmployee } from "@/lib/session";
import { checkInSchema, checkOutSchema } from "@/lib/validations";
import { saveBase64Image } from "@/lib/upload";
import { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

function todayDateOnly() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function parseTimeHHMM(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
}

async function getOfficeSetting() {
  const setting = await prisma.officeSetting.findFirst();
  if (!setting) throw new Error("Pengaturan kantor belum dikonfigurasi");
  return setting;
}

export async function checkIn(input: z.infer<typeof checkInSchema>) {
  const me = await requireEmployee();
  const parsed = checkInSchema.parse(input);
  const setting = await getOfficeSetting();

  const today = todayDateOnly();
  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: me.id, date: today } },
  });
  if (existing && existing.checkInTime) {
    throw new Error("Anda sudah melakukan absen masuk hari ini");
  }

  // Determine status: HADIR or TERLAMBAT
  const now = new Date();
  const { hours: endH, minutes: endM } = parseTimeHHMM(setting.checkInEnd);
  const endLimit = new Date(now);
  endLimit.setHours(endH, endM, 0, 0);
  const status: AttendanceStatus = now > endLimit ? "TERLAMBAT" : "HADIR";

  // Save photo
  const photoPath = await saveBase64Image(parsed.photo, `checkin_${me.id}`);

  // Gather device info
  const h = headers();
  const userAgent = h.get("user-agent") ?? undefined;
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    undefined;

  const attendance = await prisma.attendance.upsert({
    where: { userId_date: { userId: me.id, date: today } },
    create: {
      userId: me.id,
      date: today,
      checkInTime: now,
      checkInPhoto: photoPath,
      status,
      deviceInfo: userAgent,
      ipAddress,
    },
    update: {
      checkInTime: now,
      checkInPhoto: photoPath,
      status,
      deviceInfo: userAgent,
      ipAddress,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: me.id,
      action: "CHECK_IN",
      description: `Absen masuk (${status})`,
      ipAddress,
      userAgent,
    },
  });

  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/attendance");
  revalidatePath("/employee/history");
  return { success: true, attendance };
}

export async function checkOut(input: z.infer<typeof checkOutSchema>) {
  const me = await requireEmployee();
  const parsed = checkOutSchema.parse(input);
  const setting = await getOfficeSetting();

  const today = todayDateOnly();
  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: me.id, date: today } },
  });
  if (!existing || !existing.checkInTime) {
    throw new Error("Anda harus absen masuk terlebih dahulu");
  }
  if (existing.checkOutTime) {
    throw new Error("Anda sudah melakukan absen pulang hari ini");
  }

  const photoPath = await saveBase64Image(parsed.photo, `checkout_${me.id}`);

  const h = headers();
  const userAgent = h.get("user-agent") ?? undefined;
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    undefined;

  const attendance = await prisma.attendance.update({
    where: { userId_date: { userId: me.id, date: today } },
    data: {
      checkOutTime: new Date(),
      checkOutPhoto: photoPath,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: me.id,
      action: "CHECK_OUT",
      description: "Absen pulang",
      ipAddress,
      userAgent,
    },
  });

  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/attendance");
  revalidatePath("/employee/history");
  return { success: true, attendance };
}

export async function getMyTodayAttendance() {
  const me = await requireAuth();
  const today = todayDateOnly();
  return prisma.attendance.findUnique({
    where: { userId_date: { userId: me.id, date: today } },
  });
}
