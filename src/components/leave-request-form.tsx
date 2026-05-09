"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leaveRequestSchema } from "@/lib/validations";
import { createLeaveRequest } from "@/app/actions/leave-actions";

type FormValues = z.infer<typeof leaveRequestSchema>;

export function LeaveRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      type: "IZIN",
      reason: "",
      startDate: "",
      endDate: "",
      attachment: "",
    },
  });

  const type = watch("type");

  const onFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachmentPreview(dataUrl);
      setValue("attachment", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await createLeaveRequest(values);
      toast.success("Pengajuan berhasil dikirim");
      reset();
      setAttachmentPreview(null);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal mengirim pengajuan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Jenis Pengajuan *</Label>
          <Select value={type} onValueChange={(v) => setValue("type", v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IZIN">Izin</SelectItem>
              <SelectItem value="SAKIT">Sakit</SelectItem>
              <SelectItem value="CUTI">Cuti</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2" />
        <div className="space-y-2">
          <Label>Tanggal Mulai *</Label>
          <Input type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-xs text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Tanggal Selesai *</Label>
          <Input type="date" {...register("endDate")} />
          {errors.endDate && (
            <p className="text-xs text-destructive">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alasan *</Label>
        <Textarea
          {...register("reason")}
          rows={4}
          placeholder="Tuliskan alasan pengajuan..."
        />
        {errors.reason && (
          <p className="text-xs text-destructive">{errors.reason.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Lampiran (opsional, gambar)</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileChange(f);
          }}
        />
        {attachmentPreview ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachmentPreview}
              alt="Lampiran"
              className="h-32 w-32 rounded-lg object-cover border"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAttachmentPreview(null);
                setValue("attachment", "");
              }}
            >
              <X className="h-4 w-4" /> Hapus
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Pilih File
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          Untuk sakit, lampirkan surat dokter jika ada. Maks 5MB.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirim Pengajuan
        </Button>
      </div>
    </form>
  );
}
