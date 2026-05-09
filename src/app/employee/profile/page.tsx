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
  ChangePasswordForm,
  ProfileForm,
} from "@/components/profile-form";
import {
  Briefcase,
  Building2,
  IdCard,
  Mail,
  Phone,
} from "lucide-react";

export default async function EmployeeProfilePage() {
  const me = await requireEmployee();
  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi dan password akun Anda.
        </p>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Nomor HP" value={user.phone ?? "-"} />
            <InfoRow
              icon={IdCard}
              label="Kode Karyawan"
              value={user.employeeCode ?? "-"}
            />
            <InfoRow
              icon={Building2}
              label="Departemen"
              value={user.department ?? "-"}
            />
            <InfoRow
              icon={Briefcase}
              label="Jabatan"
              value={user.position ?? "-"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>
            Perbarui nomor HP, alamat, dan foto profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              photo: user.photo,
            }}
          />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>
            Minimal 6 karakter, gunakan kombinasi huruf dan angka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
