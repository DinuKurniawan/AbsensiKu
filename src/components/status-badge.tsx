import { Badge } from "@/components/ui/badge";
import { AttendanceStatus, LeaveStatus, LeaveType } from "@prisma/client";

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, { variant: any; label: string }> = {
    HADIR: { variant: "success", label: "Hadir" },
    TERLAMBAT: { variant: "warning", label: "Terlambat" },
    IZIN: { variant: "info", label: "Izin" },
    SAKIT: { variant: "purple", label: "Sakit" },
    CUTI: { variant: "info", label: "Cuti" },
    ALPA: { variant: "red", label: "Alpa" },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { variant: any; label: string }> = {
    PENDING: { variant: "warning", label: "Menunggu" },
    APPROVED: { variant: "success", label: "Disetujui" },
    REJECTED: { variant: "red", label: "Ditolak" },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const map: Record<LeaveType, { variant: any; label: string }> = {
    IZIN: { variant: "info", label: "Izin" },
    SAKIT: { variant: "purple", label: "Sakit" },
    CUTI: { variant: "info", label: "Cuti" },
  };
  const cfg = map[type];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
