"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LeaveFilter({
  defaultStatus,
  defaultType,
}: {
  defaultStatus: string;
  defaultType: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/admin/leave-requests?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      <Select value={defaultStatus} onValueChange={(v) => set("status", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="PENDING">Menunggu</SelectItem>
          <SelectItem value="APPROVED">Disetujui</SelectItem>
          <SelectItem value="REJECTED">Ditolak</SelectItem>
        </SelectContent>
      </Select>
      <Select value={defaultType} onValueChange={(v) => set("type", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Semua Jenis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Jenis</SelectItem>
          <SelectItem value="IZIN">Izin</SelectItem>
          <SelectItem value="SAKIT">Sakit</SelectItem>
          <SelectItem value="CUTI">Cuti</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
