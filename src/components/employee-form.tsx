"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import {
  employeeCreateSchema,
  employeeUpdateSchema,
} from "@/lib/validations";
import {
  createEmployee,
  updateEmployee,
} from "@/app/actions/employee-actions";

type EmployeeFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    position?: string | null;
    department?: string | null;
    employeeCode?: string | null;
    address?: string | null;
    role: "ADMIN" | "EMPLOYEE";
    isActive: boolean;
  };
};

type FormValues = z.infer<typeof employeeCreateSchema>;

export function EmployeeForm({ mode, initial }: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      mode === "create" ? employeeCreateSchema : employeeUpdateSchema
    ) as any,
    defaultValues: {
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      password: "",
      phone: initial?.phone ?? "",
      position: initial?.position ?? "",
      department: initial?.department ?? "",
      employeeCode: initial?.employeeCode ?? "",
      address: initial?.address ?? "",
      role: initial?.role ?? "EMPLOYEE",
      isActive: initial?.isActive ?? true,
    },
  });

  const role = watch("role");
  const isActive = watch("isActive");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (mode === "create") {
        await createEmployee(values);
        toast.success("Karyawan berhasil ditambahkan");
      } else if (initial) {
        await updateEmployee(initial.id, values);
        toast.success("Karyawan berhasil diperbarui");
      }
      router.push("/admin/employees");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nama Lengkap *</Label>
          <Input {...register("name")} placeholder="Nama karyawan" />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input type="email" {...register("email")} placeholder="email@perusahaan.com" />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Password {mode === "edit" && <span className="text-muted-foreground font-normal">(kosongkan jika tidak diubah)</span>}
            {mode === "create" && " *"}
          </Label>
          <Input type="password" {...register("password")} placeholder="Minimal 6 karakter" />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Nomor HP</Label>
          <Input {...register("phone")} placeholder="08xx..." />
        </div>
        <div className="space-y-2">
          <Label>Jabatan</Label>
          <Input {...register("position")} placeholder="Staff / Manager / ..." />
        </div>
        <div className="space-y-2">
          <Label>Departemen</Label>
          <Input {...register("department")} placeholder="IT / HR / Finance / ..." />
        </div>
        <div className="space-y-2">
          <Label>Kode Karyawan</Label>
          <Input {...register("employeeCode")} placeholder="EMP-001" />
        </div>
        <div className="space-y-2">
          <Label>Role *</Label>
          <Select
            value={role}
            onValueChange={(v) => setValue("role", v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLOYEE">Karyawan</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Alamat</Label>
          <Textarea {...register("address")} placeholder="Alamat lengkap" rows={3} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Status Akun *</Label>
          <Select
            value={isActive ? "true" : "false"}
            onValueChange={(v) => setValue("isActive", v === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/employees")}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Tambah Karyawan" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
