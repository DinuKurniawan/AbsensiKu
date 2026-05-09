import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
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
import { HistoryFilter } from "./_components/history-filter";
import { AttendanceStatusBadge } from "@/components/status-badge";
import { AttendanceDetailDialog } from "@/components/attendance-detail-dialog";
import { formatDateShort, formatTime } from "@/lib/utils";
import { AttendanceStatus } from "@prisma/client";
import { History } from "lucide-react";

export default async function EmployeeHistoryPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; status?: string };
}) {
  const me = await requireEmployee();
  const startDate = searchParams.startDate ?? "";
  const endDate = searchParams.endDate ?? "";
  const status = searchParams.status ?? "all";

  const where: any = { userId: me.id };
  if (startDate)
    where.date = { ...(where.date || {}), gte: new Date(startDate) };
  if (endDate) where.date = { ...(where.date || {}), lte: new Date(endDate) };
  if (status !== "all") where.status = status as AttendanceStatus;

  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: { date: "desc" },
    take: 365,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Absensi</h1>
        <p className="text-muted-foreground">
          Seluruh riwayat absensi Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Riwayat ({attendances.length})
          </CardTitle>
          <HistoryFilter
            startDate={startDate}
            endDate={endDate}
            status={status}
          />
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <EmptyState
              icon={History}
              title="Belum ada riwayat"
              description="Belum ada riwayat absensi yang cocok dengan filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Masuk</TableHead>
                    <TableHead>Pulang</TableHead>
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
                      <TableCell>{formatTime(a.checkInTime)}</TableCell>
                      <TableCell>{formatTime(a.checkOutTime)}</TableCell>
                      <TableCell>
                        <AttendanceStatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <AttendanceDetailDialog
                          showUser={false}
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
