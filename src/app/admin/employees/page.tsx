import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { EmployeesFilter } from "./_components/employees-filter";
import { EmployeeActions } from "./_components/employee-actions";
import { getInitials } from "@/lib/utils";
import { Plus, Users } from "lucide-react";
import { Role } from "@prisma/client";

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: { q?: string; department?: string; status?: string };
}) {
  await requireAdmin();
  const q = searchParams.q?.trim() ?? "";
  const department = searchParams.department ?? "all";
  const status = searchParams.status ?? "all";

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { employeeCode: { contains: q, mode: "insensitive" } },
    ];
  }
  if (department !== "all") where.department = department;
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [employees, departments] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { department: { not: null } },
      distinct: ["department"],
      select: { department: true },
    }),
  ]);

  const deptList = departments
    .map((d) => d.department!)
    .filter(Boolean)
    .sort();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Karyawan</h1>
          <p className="text-muted-foreground">
            Kelola karyawan dan admin pada sistem.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/employees/create">
            <Plus className="h-4 w-4" /> Tambah Karyawan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Karyawan ({employees.length})
          </CardTitle>
          <EmployeesFilter
            departments={deptList}
            defaultQ={q}
            defaultDepartment={department}
            defaultStatus={status}
          />
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tidak ada karyawan"
              description="Coba ubah filter atau tambahkan karyawan baru."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(e.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{e.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {e.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {e.employeeCode ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell>{e.department ?? "-"}</TableCell>
                      <TableCell>{e.position ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={e.role === Role.ADMIN ? "default" : "secondary"}>
                          {e.role === Role.ADMIN ? "Admin" : "Karyawan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {e.isActive ? (
                          <Badge variant="success">Aktif</Badge>
                        ) : (
                          <Badge variant="gray">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <EmployeeActions
                          id={e.id}
                          name={e.name}
                          isActive={e.isActive}
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
