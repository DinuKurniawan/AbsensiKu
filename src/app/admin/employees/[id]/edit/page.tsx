import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/employee-form";
import { ArrowLeft } from "lucide-react";

export default async function AdminEmployeeEditPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Karyawan</h1>
          <p className="text-muted-foreground">
            Perbarui informasi akun karyawan.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Form Karyawan</CardTitle>
          <CardDescription>
            Kosongkan password jika tidak ingin mengubahnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            mode="edit"
            initial={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              position: user.position,
              department: user.department,
              employeeCode: user.employeeCode,
              address: user.address,
              role: user.role,
              isActive: user.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
