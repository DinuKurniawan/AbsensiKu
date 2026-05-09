import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { AttendanceDetailDialog } from "@/components/attendance-detail-dialog";
import { AttendancesFilter } from "./_components/attendances-filter";
import { formatDateShort, formatTime } from "@/lib/utils";
import { AttendanceStatus } from "@prisma/client";
import { ClipboardList } from "lucide-react";

export default async function AdminAttendancesPage({
  searchParams,
}: {
  searchParams: {
    startDate?: string;
    endDate?: string;
    status?: string;
    userId?: string;
  };
}) {
  await requireAdmin();

  const startDate = searchParams.startDate ?? "";
  const endDate = searchParams.endDate ?? "";
  const status = searchParams.status ?? "all";
  const userId = searchParams.userId ?? "all";

  const where: any = {};
  if (startDate)
    where.date = { ...(where.date || {}), gte: new Date(startDate) };
  if (endDate)
    where.date = { ...(where.date || {}), lte: new Date(endDate) };
  if (status !== "all") where.status = status as AttendanceStatus;
  if (userId !== "all") where.userId = userId;

  const [attendances, users] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: { user: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 500,
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daftar Absensi</h1>
        <p className="text-muted-foreground">
          Laporan absensi seluruh karyawan dengan filter dan export.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Export</CardTitle>
          <AttendancesFilter
            users={users}
            startDate={startDate}
            endDate={endDate}
            status={status}
            userId={userId}
          />
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Tidak ada data absensi"
              description="Coba ubah filter untuk melihat data lainnya."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Masuk</TableHead>
                    <TableHead>Pulang</TableHead>
                    <TableHead>Jarak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {formatDateShort(a.date)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{a.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {a.user.email}
                        </div>
                      </TableCell>
                      <TableCell>{a.user.department ?? "-"}</TableCell>
                      <TableCell>{formatTime(a.checkInTime)}</TableCell>
                      <TableCell>{formatTime(a.checkOutTime)}</TableCell>
                      <TableCell className="text-xs">
                        {a.checkInDistance != null
                          ? `${a.checkInDistance}m`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <AttendanceStatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <AttendanceDetailDialog
                          attendance={{
                            id: a.id,
                            date: a.date,
                            status: a.status,
                            checkInTime: a.checkInTime,
                            checkOutTime: a.checkOutTime,
                            checkInPhoto: a.checkInPhoto,
                            checkOutPhoto: a.checkOutPhoto,
                            checkInLatitude: a.checkInLatitude,
                            checkInLongitude: a.checkInLongitude,
                            checkOutLatitude: a.checkOutLatitude,
                            checkOutLongitude: a.checkOutLongitude,
                            checkInDistance: a.checkInDistance,
                            checkOutDistance: a.checkOutDistance,
                            note: a.note,
                            deviceInfo: a.deviceInfo,
                            ipAddress: a.ipAddress,
                            user: {
                              name: a.user.name,
                              email: a.user.email,
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
