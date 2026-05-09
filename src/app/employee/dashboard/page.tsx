import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { AttendanceStatusBadge } from "@/components/status-badge";
import {
  formatDate,
  formatDateShort,
  formatTime,
} from "@/lib/utils";
import {
  LogIn,
  LogOut,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  CalendarClock,
} from "lucide-react";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export default async function EmployeeDashboardPage() {
  const me = await requireEmployee();
  const today = startOfDayUTC(new Date());
  const monthStart = startOfDayUTC(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [todayAttendance, recent, monthStats, pendingLeaves] =
    await Promise.all([
      prisma.attendance.findUnique({
        where: { userId_date: { userId: me.id, date: today } },
      }),
      prisma.attendance.findMany({
        where: { userId: me.id },
        orderBy: { date: "desc" },
        take: 7,
      }),
      prisma.attendance.findMany({
        where: { userId: me.id, date: { gte: monthStart, lte: today } },
      }),
      prisma.leaveRequest.count({
        where: { userId: me.id, status: "PENDING" },
      }),
    ]);

  const countStatus = (s: string) =>
    monthStats.filter((a) => a.status === s).length;
  const hadirCount = countStatus("HADIR") + countStatus("TERLAMBAT");
  const terlambatCount = countStatus("TERLAMBAT");
  const izinCount =
    countStatus("IZIN") + countStatus("SAKIT") + countStatus("CUTI");
  const alpaCount = countStatus("ALPA");

  const today_iso = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const canCheckIn = !todayAttendance || !todayAttendance.checkInTime;
  const canCheckOut =
    todayAttendance?.checkInTime && !todayAttendance.checkOutTime;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-blue-100 text-sm">{today_iso}</div>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Halo, {me.name} 👋
              </h1>
              <p className="text-blue-100 mt-1">
                Jangan lupa lakukan absensi hari ini.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                asChild
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                <Link href="/employee/attendance">
                  <LogIn className="h-4 w-4" /> Lakukan Absensi
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LogIn className="h-4 w-4" /> Absen Masuk
              </div>
              <div className="text-2xl font-bold">
                {formatTime(todayAttendance?.checkInTime)}
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LogOut className="h-4 w-4" /> Absen Pulang
              </div>
              <div className="text-2xl font-bold">
                {formatTime(todayAttendance?.checkOutTime)}
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Status
              </div>
              <div className="pt-1">
                {todayAttendance ? (
                  <AttendanceStatusBadge status={todayAttendance.status} />
                ) : (
                  <Badge variant="gray">Belum Absen</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button asChild disabled={!canCheckIn}>
              <Link href="/employee/attendance">
                <LogIn className="h-4 w-4" /> Absen Masuk
              </Link>
            </Button>
            <Button asChild variant="outline" disabled={!canCheckOut}>
              <Link href="/employee/attendance">
                <LogOut className="h-4 w-4" /> Absen Pulang
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Hadir Bulan Ini"
          value={hadirCount}
          icon={CheckCircle2}
          colorClass="text-emerald-700 bg-emerald-100"
        />
        <StatCard
          label="Terlambat"
          value={terlambatCount}
          icon={Clock}
          colorClass="text-amber-700 bg-amber-100"
        />
        <StatCard
          label="Izin / Sakit / Cuti"
          value={izinCount}
          icon={CalendarCheck}
          colorClass="text-indigo-700 bg-indigo-100"
        />
        <StatCard
          label="Alpa"
          value={alpaCount}
          icon={XCircle}
          colorClass="text-red-700 bg-red-100"
        />
      </div>

      {pendingLeaves > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <CalendarClock className="h-5 w-5 text-amber-600" />
          <div className="text-sm">
            <span className="font-medium text-amber-900">
              Anda memiliki {pendingLeaves} pengajuan menunggu persetujuan.
            </span>{" "}
            <Link
              href="/employee/leave-request"
              className="text-amber-700 underline"
            >
              Lihat detail
            </Link>
          </div>
        </div>
      )}

      {/* Recent attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Absensi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat"
              description="Absensi Anda akan tampil di sini."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatDateShort(a.date)}</TableCell>
                    <TableCell>{formatTime(a.checkInTime)}</TableCell>
                    <TableCell>{formatTime(a.checkOutTime)}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={a.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
