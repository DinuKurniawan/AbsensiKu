import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OfficeSettingForm } from "@/components/office-setting-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const setting = await prisma.officeSetting.findFirst();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Kantor</h1>
        <p className="text-muted-foreground">
          Atur lokasi, radius, dan jam kerja absensi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Kantor</CardTitle>
          <CardDescription>
            Pengaturan ini digunakan untuk memvalidasi lokasi dan jam absensi
            karyawan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OfficeSettingForm
            initial={
              setting
                ? {
                    officeName: setting.officeName,
                    officeLatitude: setting.officeLatitude,
                    officeLongitude: setting.officeLongitude,
                    radiusMeter: setting.radiusMeter,
                    checkInStart: setting.checkInStart,
                    checkInEnd: setting.checkInEnd,
                    checkOutStart: setting.checkOutStart,
                    checkOutEnd: setting.checkOutEnd,
                    timezone: setting.timezone,
                  }
                : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
