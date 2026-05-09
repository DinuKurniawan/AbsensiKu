"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut, Loader2, Clock, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/camera-capture";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { formatTime } from "@/lib/utils";
import { checkIn, checkOut } from "@/app/actions/attendance-actions";
import { AttendanceStatus } from "@prisma/client";

type TodayAttendance = {
  id: string;
  status: AttendanceStatus;
  checkInTime: Date | null;
  checkOutTime: Date | null;
} | null;

type OfficeSetting = {
  officeName: string;
  checkInStart: string;
  checkInEnd: string;
  checkOutStart: string;
  checkOutEnd: string;
};

export function AttendanceClient({
  office,
  today,
}: {
  office: OfficeSetting;
  today: TodayAttendance;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"in" | "out">(
    today?.checkInTime && !today?.checkOutTime ? "out" : "in"
  );

  const canCheckIn = !today || !today.checkInTime;
  const canCheckOut = today?.checkInTime && !today?.checkOutTime;

  const handleSubmit = async (type: "in" | "out") => {
    if (!photo) {
      toast.error("Anda belum mengambil foto");
      return;
    }

    setSubmitting(true);
    try {
      if (type === "in") {
        const res = await checkIn({ photo });
        toast.success(
          `Absen masuk berhasil — status: ${res.attendance.status}`
        );
      } else {
        await checkOut({ photo });
        toast.success("Absen pulang berhasil");
      }
      setPhoto(null);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal melakukan absensi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Absensi</CardTitle>
            <CardDescription>
              Pastikan Anda mengaktifkan kamera, lalu ambil foto selfie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="in" disabled={!canCheckIn}>
                  <LogIn className="h-4 w-4" /> Absen Masuk
                </TabsTrigger>
                <TabsTrigger value="out" disabled={!canCheckOut}>
                  <LogOut className="h-4 w-4" /> Absen Pulang
                </TabsTrigger>
              </TabsList>
              <TabsContent value="in" className="space-y-4 pt-4">
                {!canCheckIn && (
                  <div className="rounded-md bg-muted p-3 text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Anda sudah melakukan absen masuk hari ini.
                  </div>
                )}
                {canCheckIn && (
                  <>
                    <CameraCapture
                      photo={photo}
                      onCapture={setPhoto}
                      onReset={() => setPhoto(null)}
                    />
                    <Button
                      className="w-full h-11"
                      onClick={() => handleSubmit("in")}
                      disabled={submitting || !photo}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4" />
                      )}
                      Submit Absen Masuk
                    </Button>
                  </>
                )}
              </TabsContent>
              <TabsContent value="out" className="space-y-4 pt-4">
                {!canCheckOut && (
                  <div className="rounded-md bg-muted p-3 text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {today?.checkOutTime
                      ? "Anda sudah melakukan absen pulang hari ini."
                      : "Anda harus absen masuk terlebih dahulu."}
                  </div>
                )}
                {canCheckOut && (
                  <>
                    <CameraCapture
                      photo={photo}
                      onCapture={setPhoto}
                      onReset={() => setPhoto(null)}
                    />
                    <Button
                      className="w-full h-11"
                      onClick={() => handleSubmit("out")}
                      disabled={submitting || !photo}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Submit Absen Pulang
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Side info */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Absen Masuk</span>
              <span className="font-semibold">
                {formatTime(today?.checkInTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Absen Pulang</span>
              <span className="font-semibold">
                {formatTime(today?.checkOutTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              {today ? (
                <AttendanceStatusBadge status={today.status} />
              ) : (
                <span className="text-xs text-muted-foreground">Belum absen</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Jam Kerja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Masuk</span>
              <span className="font-medium">
                {office.checkInStart} — {office.checkInEnd}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pulang</span>
              <span className="font-medium">
                {office.checkOutStart} — {office.checkOutEnd}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="text-xs text-muted-foreground">Kantor</div>
              <div className="font-medium">{office.officeName}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-sm space-y-2">
            <div className="font-semibold text-blue-900">Tips Absensi</div>
            <ul className="list-disc pl-5 space-y-1 text-blue-800 text-xs">
              <li>Aktifkan kamera dan izinkan akses.</li>
              <li>Pastikan pencahayaan cukup untuk foto selfie.</li>
              <li>Gunakan koneksi internet yang stabil.</li>
              <li>Foto selfie akan otomatis dikirim saat absensi.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
