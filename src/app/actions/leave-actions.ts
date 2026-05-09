"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth, requireEmployee } from "@/lib/session";
import {
  leaveApprovalSchema,
  leaveRequestSchema,
} from "@/lib/validations";
import { saveBase64Image } from "@/lib/upload";
import { AttendanceStatus, LeaveStatus, LeaveType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createLeaveRequest(
  input: z.infer<typeof leaveRequestSchema>
) {
  const me = await requireEmployee();
  const parsed = leaveRequestSchema.parse(input);

  const start = new Date(parsed.startDate);
  const end = new Date(parsed.endDate);
  if (end < start) throw new Error("Tanggal selesai harus setelah tanggal mulai");

  let attachmentPath: string | null = null;
  if (parsed.attachment && parsed.attachment.startsWith("data:image")) {
    attachmentPath = await saveBase64Image(
      parsed.attachment,
      `leave_${me.id}`
    );
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      userId: me.id,
      type: parsed.type as LeaveType,
      startDate: start,
      endDate: end,
      reason: parsed.reason,
      attachment: attachmentPath,
      status: "PENDING",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: me.id,
      action: "CREATE_LEAVE",
      description: `Mengajukan ${parsed.type}`,
    },
  });

  revalidatePath("/employee/leave-request");
  revalidatePath("/admin/leave-requests");
  return { success: true, leave };
}

export async function processLeaveRequest(
  id: string,
  input: z.infer<typeof leaveApprovalSchema>
) {
  const admin = await requireAdmin();
  const parsed = leaveApprovalSchema.parse(input);

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new Error("Pengajuan tidak ditemukan");
  if (leave.status !== "PENDING") throw new Error("Pengajuan sudah diproses");

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: parsed.status as LeaveStatus,
      approvedBy: admin.id,
      approvedAt: new Date(),
      rejectedReason:
        parsed.status === "REJECTED" ? parsed.rejectedReason ?? null : null,
    },
  });

  // If approved, create attendance entries for those dates with the leave type status
  if (parsed.status === "APPROVED") {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const statusMap: Record<LeaveType, AttendanceStatus> = {
      IZIN: "IZIN",
      SAKIT: "SAKIT",
      CUTI: "CUTI",
    };
    const status = statusMap[leave.type];

    const cursor = new Date(start);
    while (cursor <= end) {
      const dateOnly = new Date(
        Date.UTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
      );
      await prisma.attendance.upsert({
        where: {
          userId_date: { userId: leave.userId, date: dateOnly },
        },
        create: {
          userId: leave.userId,
          date: dateOnly,
          status,
          note: `Otomatis dari pengajuan ${leave.type}`,
        },
        update: {
          status,
          note: `Otomatis dari pengajuan ${leave.type}`,
        },
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "PROCESS_LEAVE",
      description: `${parsed.status} pengajuan ${leave.type}`,
    },
  });

  revalidatePath("/admin/leave-requests");
  revalidatePath("/employee/leave-request");
  return { success: true, leave: updated };
}

export async function getMyLeaveRequests() {
  const me = await requireAuth();
  return prisma.leaveRequest.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
  });
}
