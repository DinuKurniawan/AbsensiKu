import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
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
import { LeaveRequestForm } from "@/components/leave-request-form";
import { LeaveStatusBadge, LeaveTypeBadge } from "@/components/status-badge";
import { formatDateShort, truncateString } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function EmployeeLeaveRequestPage() {
  const me = await requireEmployee();
  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Izin / Sakit / Cuti</h1>
        <p className="text-muted-foreground">
          Ajukan izin, sakit, atau cuti dan pantau status pengajuan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Pengajuan</CardTitle>
              <CardDescription>
                Lengkapi form di bawah untuk mengajukan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveRequestForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pengajuan ({leaves.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Belum ada pengajuan"
                  description="Ajukan izin/sakit/cuti melalui form di samping."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <LeaveTypeBadge type={l.type} />
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDateShort(l.startDate)} —{" "}
                            {formatDateShort(l.endDate)}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div>{truncateString(l.reason, 60)}</div>
                            {l.rejectedReason && (
                              <div className="text-xs text-destructive mt-1">
                                Alasan tolak: {truncateString(l.rejectedReason, 50)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <LeaveStatusBadge status={l.status} />
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
      </div>
    </div>
  );
}
