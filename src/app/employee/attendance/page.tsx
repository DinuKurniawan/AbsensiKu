import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { AttendanceClient } from "./_components/attendance-client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

function todayUTC() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export default async function EmployeeAttendancePage() {
  const me = await requireEmployee();
  const [office, today] = await Promise.all([
    prisma.officeSetting.findFirst(),
    prisma.attendance.findUnique({
      where: { userId_date: { userId: me.id, date: todayUTC() } },
    }),
  ]);

  if (!office) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
        <Card>
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <div className="font-semibold">Kantor belum dikonfigurasi</div>
              <div className="text-sm text-muted-foreground">
                Hubungi administrator untuk mengatur lokasi kantor terlebih
                dahulu.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
        <p className="text-muted-foreground">
          Lakukan absen masuk atau pulang dengan foto selfie.
        </p>
      </div>
      <AttendanceClient
        office={{
          officeName: office.officeName,
          checkInStart: office.checkInStart,
          checkInEnd: office.checkInEnd,
          checkOutStart: office.checkOutStart,
          checkOutEnd: office.checkOutEnd,
        }}
        today={
          today
            ? {
                id: today.id,
                status: today.status,
                checkInTime: today.checkInTime,
                checkOutTime: today.checkOutTime,
              }
            : null
        }
      />
    </div>
  );
}
