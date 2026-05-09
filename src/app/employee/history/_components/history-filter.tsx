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
import { X } from "lucide-react";

export function HistoryFilter({
  startDate,
  endDate,
  status,
}: {
  startDate: string;
  endDate: string;
  status: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/employee/history?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Dari</Label>
          <Input
            type="date"
            defaultValue={startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hingga</Label>
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
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="HADIR">Hadir</SelectItem>
              <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
              <SelectItem value="IZIN">Izin</SelectItem>
              <SelectItem value="SAKIT">Sakit</SelectItem>
              <SelectItem value="CUTI">Cuti</SelectItem>
              <SelectItem value="ALPA">Alpa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/employee/history")}
      >
        <X className="h-4 w-4" /> Reset
      </Button>
    </div>
  );
}
