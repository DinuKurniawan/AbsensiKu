import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const employeeCreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  employeeCode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
  isActive: z.boolean().default(true),
});

export const employeeUpdateSchema = employeeCreateSchema.extend({
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});

export const checkInSchema = z.object({
  photo: z.string().min(10, "Foto wajib diisi"),
});

export const checkOutSchema = z.object({
  photo: z.string().min(10, "Foto wajib diisi"),
});

export const officeSettingSchema = z.object({
  officeName: z.string().min(2, "Nama kantor wajib diisi"),
  officeLatitude: z.number(),
  officeLongitude: z.number(),
  radiusMeter: z
    .number()
    .int()
    .min(0, "Radius tidak boleh negatif (gunakan 0 untuk menonaktifkan)"),
  checkInStart: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:mm"),
  checkInEnd: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:mm"),
  checkOutStart: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:mm"),
  checkOutEnd: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:mm"),
  timezone: z.string().default("Asia/Jakarta"),
});

export const leaveRequestSchema = z.object({
  type: z.enum(["IZIN", "SAKIT", "CUTI"]),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  reason: z.string().min(5, "Alasan minimal 5 karakter"),
  attachment: z.string().optional().nullable(),
});

export const profileUpdateSchema = z.object({
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const leaveApprovalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectedReason: z.string().optional().nullable(),
});
