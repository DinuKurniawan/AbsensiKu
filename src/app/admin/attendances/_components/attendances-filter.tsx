"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, FileText, X } from "lucide-react";

export function AttendancesFilter({
  users,
  startDate,
  endDate,
  status,
  userId,
}: {
  users: { id: string; name: string }[];
  startDate: string;
  endDate: string;
  status: string;
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/admin/attendances?${params.toString()}`);
  };

  const reset = () => router.push("/admin/attendances");

  const exportUrl = (type: "excel" | "pdf") => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (status && status !== "all") params.set("status", status);
    if (userId && userId !== "all") params.set("userId", userId);
    return `/api/admin/attendance/export/${type}?${params.toString()}`;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Dari Tanggal</Label>
          <Input
            type="date"
            defaultValue={startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hingga Tanggal</Label>
          <Input
            type="date"
            defaultValue={endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="HADIR">Hadir</SelectItem>
              <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
              <SelectItem value="IZIN">Izin</SelectItem>
              <SelectItem value="SAKIT">Sakit</SelectItem>
              <SelectItem value="CUTI">Cuti</SelectItem>
              <SelectItem value="ALPA">Alpa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Karyawan</Label>
          <Select value={userId} onValueChange={(v) => set("userId", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Karyawan</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={reset}>
          <X className="h-4 w-4" /> Reset Filter
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={exportUrl("excel")} download>
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={exportUrl("pdf")} download>
              <FileText className="h-4 w-4" /> Export PDF
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
