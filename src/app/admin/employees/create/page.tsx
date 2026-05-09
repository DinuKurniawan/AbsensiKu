import Link from "next/link";
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

export default async function AdminEmployeeCreatePage() {
  await requireAdmin();
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Karyawan</h1>
          <p className="text-muted-foreground">
            Lengkapi form berikut untuk membuat akun karyawan baru.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Form Karyawan</CardTitle>
          <CardDescription>
            Field bertanda * wajib diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
