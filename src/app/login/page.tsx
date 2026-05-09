"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Fingerprint, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema } from "@/lib/validations";

type FormData = z.infer<typeof loginSchema>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.ok) {
        toast.success("Login berhasil");
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role;
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push(
            role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"
          );
        }
        router.refresh();
      }
    } catch (e) {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="nama@perusahaan.com"
            className="pl-10"
            {...register("email")}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            {...register("password")}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>

      <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
        <p className="font-medium">Akun Demo:</p>
        <p>
          <span className="font-medium">Admin:</span> admin@absensiku.com
        </p>
        <p>
          <span className="font-medium">Karyawan:</span> karyawan@absensiku.com
        </p>
        <p>
          <span className="font-medium">Password:</span> password123
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left brand panel — desktop only */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Fingerprint className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AbsensiKu</span>
          </div>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Sistem Absensi Karyawan Modern
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Kelola kehadiran karyawan dengan mudah, akurat, dan aman. Dilengkapi
            validasi kamera dan laporan lengkap.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-6 max-w-xs">
            <div>
              <div className="text-3xl font-bold">📸</div>
              <div className="text-sm text-blue-100">Foto Selfie</div>
            </div>
            <div>
              <div className="text-3xl font-bold">📊</div>
              <div className="text-sm text-blue-100">Laporan</div>
            </div>
          </div>
        </div>
        <div className="relative text-sm text-blue-100">
          &copy; {new Date().getFullYear()} AbsensiKu. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col items-center justify-center min-h-screen lg:min-h-0 p-6 sm:p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 lg:bg-none lg:bg-background">
        {/* Decorative blobs — visible on all sizes */}
        <div className="absolute inset-0 opacity-10 lg:hidden pointer-events-none">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Mobile brand header */}
        <div className="relative lg:hidden mb-8 text-center text-white space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Fingerprint className="h-8 w-8" />
          </div>
          <div className="text-2xl font-bold tracking-tight">AbsensiKu</div>
          <p className="text-blue-100 text-sm max-w-xs mx-auto">
            Sistem Absensi Karyawan Modern
          </p>
          <div className="flex justify-center gap-6 pt-1">
            <div className="text-center">
              <div className="text-2xl">📸</div>
              <div className="text-xs text-blue-100">Foto Selfie</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">📊</div>
              <div className="text-xs text-blue-100">Laporan</div>
            </div>
          </div>
        </div>

        <Card className="relative w-full max-w-md border-0 shadow-xl lg:shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Selamat Datang</CardTitle>
            <CardDescription>
              Masuk ke akun Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              }
            >
              <LoginFormInner />
            </Suspense>
          </CardContent>
        </Card>

        <p className="relative lg:hidden mt-6 text-xs text-blue-100">
          &copy; {new Date().getFullYear()} AbsensiKu. All rights reserved.
        </p>
      </div>
    </div>
  );
}
