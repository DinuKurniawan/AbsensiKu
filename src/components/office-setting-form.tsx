"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { officeSettingSchema } from "@/lib/validations";
import { upsertOfficeSetting } from "@/app/actions/office-actions";

type FormValues = z.infer<typeof officeSettingSchema>;

export function OfficeSettingForm({
  initial,
}: {
  initial?: FormValues | null;
}) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(officeSettingSchema),
    defaultValues: initial ?? {
      officeName: "Kantor Pusat",
      officeLatitude: -6.2,
      officeLongitude: 106.816666,
      radiusMeter: 100,
      checkInStart: "07:00",
      checkInEnd: "09:00",
      checkOutStart: "16:00",
      checkOutEnd: "18:00",
      timezone: "Asia/Jakarta",
    },
  });

  const timezone = watch("timezone");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await upsertOfficeSetting(values);
      toast.success("Pengaturan kantor disimpan");
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Nama Kantor *</Label>
          <Input {...register("officeName")} />
          {errors.officeName && (
            <p className="text-xs text-destructive">
              {errors.officeName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Timezone *</Label>
          <Select
            value={timezone}
            onValueChange={(v) => setValue("timezone", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
              <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
              <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Jam Kerja</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Absen Masuk Mulai *</Label>
              <Input type="time" {...register("checkInStart")} />
            </div>
            <div className="space-y-2">
              <Label>Absen Masuk Akhir *</Label>
              <Input type="time" {...register("checkInEnd")} />
            </div>
            <div className="space-y-2">
              <Label>Absen Pulang Mulai *</Label>
              <Input type="time" {...register("checkOutStart")} />
            </div>
            <div className="space-y-2">
              <Label>Absen Pulang Akhir *</Label>
              <Input type="time" {...register("checkOutEnd")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Jam masuk akhir digunakan sebagai batas status{" "}
            <strong>Hadir</strong>. Jika karyawan absen setelah jam tersebut,
            status menjadi <strong>Terlambat</strong>.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}
