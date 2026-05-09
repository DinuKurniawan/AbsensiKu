import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { WeeklyChart, MonthlyChart, ChartPoint } from "@/components/attendance-charts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatTime, formatDateShort } from "@/lib/utils";
import { AttendanceStatus } from "@prisma/client";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar,
} from "lucide-react";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const today = startOfDayUTC(new Date());

  const [
    totalEmployees,
    activeEmployees,
    todayAttendances,
    recentAttendances,
    weekAttendances,
    monthAttendances,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.user.count({ where: { role: "EMPLOYEE", isActive: true } }),
    prisma.attendance.findMany({
      where: { date: today },
      include: { user: true },
    }),
    prisma.attendance.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: true },
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
          lte: today,
        },
      },
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDayUTC(new Date(today.getFullYear(), today.getMonth(), 1)),
          lte: today,
        },
      },
    }),
  ]);

  const hadirToday = todayAttendances.filter((a) => a.status === "HADIR").length;
  const terlambatToday = todayAttendances.filter((a) => a.status === "TERLAMBAT").length;
  const izinSakitCutiToday = todayAttendances.filter(
    (a) => a.status === "IZIN" || a.status === "SAKIT" || a.status === "CUTI"
  ).length;
  const recordedUserIds = new Set(todayAttendances.map((a) => a.userId));
  const alpaToday = activeEmployees - recordedUserIds.size;

  // Build weekly chart (last 7 days)
  const weekly: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString("id-ID", { weekday: "short" });
    const attendances = weekAttendances.filter(
      (a) => startOfDayUTC(a.date).getTime() === d.getTime()
    );
    const count = (s: AttendanceStatus) =>
      attendances.filter((a) => a.status === s).length;
    weekly.push({
      label,
      HADIR: count("HADIR"),
      TERLAMBAT: count("TERLAMBAT"),
      ALPA: count("ALPA"),
      IZIN: count("IZIN"),
      SAKIT: count("SAKIT"),
      CUTI: count("CUTI"),
    });
  }

  // Build monthly chart
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const monthly: ChartPoint[] = [];
  for (let day = 1; day <= today.getUTCDate(); day++) {
    const d = startOfDayUTC(new Date(today.getFullYear(), today.getMonth(), day));
    const attendances = monthAttendances.filter(
      (a) => startOfDayUTC(a.date).getTime() === d.getTime()
    );
    const count = (s: AttendanceStatus) =>
      attendances.filter((a) => a.status === s).length;
    monthly.push({
      label: String(day),
      HADIR: count("HADIR"),
      TERLAMBAT: count("TERLAMBAT"),
      ALPA: count("ALPA"),
      IZIN: count("IZIN"),
      SAKIT: count("SAKIT"),
      CUTI: count("CUTI"),
    });
  }

  const pendingLeaves = await prisma.leaveRequest.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan statistik absensi dan aktivitas terbaru.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Karyawan"
          value={totalEmployees}
          icon={Users}
          hint={`${activeEmployees} aktif`}
          colorClass="text-blue-700 bg-blue-100"
        />
        <StatCard
          label="Hadir Hari Ini"
          value={hadirToday}
          icon={CheckCircle2}
          colorClass="text-emerald-700 bg-emerald-100"
        />
        <StatCard
          label="Terlambat Hari Ini"
          value={terlambatToday}
          icon={Clock}
          colorClass="text-amber-700 bg-amber-100"
        />
        <StatCard
          label="Izin / Sakit / Cuti"
          value={izinSakitCutiToday}
          icon={FileText}
          colorClass="text-purple-700 bg-purple-100"
        />
        <StatCard
          label="Alpa Hari Ini"
          value={Math.max(0, alpaToday)}
          icon={XCircle}
          colorClass="text-red-700 bg-red-100"
        />
        <StatCard
          label="Pengajuan Pending"
          value={pendingLeaves}
          icon={Calendar}
          colorClass="text-indigo-700 bg-indigo-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyChart data={weekly} />
        <MonthlyChart data={monthly} />
      </div>

      {/* Recent attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Absensi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttendances.length === 0 ? (
            <EmptyState
              title="Belum ada absensi"
              description="Data absensi akan muncul di sini."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.user.email}
                      </div>
                    </TableCell>
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
