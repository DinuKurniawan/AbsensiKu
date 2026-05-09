"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  changePasswordSchema,
  profileUpdateSchema,
} from "@/lib/validations";
import {
  changePassword,
  updateProfile,
} from "@/app/actions/auth-actions";
import { getInitials } from "@/lib/utils";

type ProfileValues = z.infer<typeof profileUpdateSchema>;
type PasswordValues = z.infer<typeof changePasswordSchema>;

export function ProfileForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    photo: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial.photo);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      phone: initial.phone ?? "",
      address: initial.address ?? "",
      photo: "",
    },
  });

  const onPhotoChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setValue("photo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProfileValues) => {
    setLoading(true);
    try {
      await updateProfile(values);
      toast.success("Profil diperbarui");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          {photoPreview && <AvatarImage src={photoPreview} />}
          <AvatarFallback className="text-2xl">
            {getInitials(initial.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPhotoChange(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Ganti Foto Profil
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG/PNG, maksimal 5MB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nama</Label>
          <Input value={initial.name} disabled />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={initial.email} disabled />
        </div>
        <div className="space-y-2">
          <Label>Nomor HP</Label>
          <Input {...register("phone")} placeholder="08xx..." />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Alamat</Label>
          <Textarea {...register("address")} rows={3} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: PasswordValues) => {
    setLoading(true);
    try {
      await changePassword(values);
      toast.success("Password berhasil diubah");
      reset();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Password Saat Ini *</Label>
        <Input type="password" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Password Baru *</Label>
        <Input type="password" {...register("newPassword")} />
        {errors.newPassword && (
          <p className="text-xs text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Konfirmasi Password Baru *</Label>
        <Input type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Ubah Password
        </Button>
      </div>
    </form>
  );
}
