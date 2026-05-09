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
import { formatDateShort, truncateString } from "@/lib/utils";
import { LeaveStatusBadge, LeaveTypeBadge } from "@/components/status-badge";
import { LeaveActions } from "./_components/leave-actions";
import { LeaveFilter } from "./_components/leave-filter";
import { CalendarClock } from "lucide-react";
import { LeaveStatus, LeaveType } from "@prisma/client";

export default async function AdminLeaveRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  await requireAdmin();
  const status = searchParams.status ?? "all";
  const type = searchParams.type ?? "all";

  const where: any = {};
  if (status !== "all") where.status = status as LeaveStatus;
  if (type !== "all") where.type = type as LeaveType;

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: { user: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengajuan Izin</h1>
        <p className="text-muted-foreground">
          Kelola pengajuan izin, sakit, dan cuti karyawan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Pengajuan ({leaves.length})
          </CardTitle>
          <LeaveFilter defaultStatus={status} defaultType={type} />
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Tidak ada pengajuan"
              description="Belum ada pengajuan yang sesuai filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Diajukan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{l.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeaveTypeBadge type={l.type} />
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateShort(l.startDate)} —{" "}
                        {formatDateShort(l.endDate)}
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        {truncateString(l.reason, 60)}
                      </TableCell>
                      <TableCell>
                        <LeaveStatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(l.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <LeaveActions
                          leave={{
                            id: l.id,
                            type: l.type,
                            startDate: l.startDate,
                            endDate: l.endDate,
                            reason: l.reason,
                            attachment: l.attachment,
                            status: l.status,
                            rejectedReason: l.rejectedReason,
                            user: {
                              name: l.user.name,
                              email: l.user.email,
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
