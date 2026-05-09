import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");

  const where: any = {};
  if (startDate) where.date = { ...(where.date || {}), gte: new Date(startDate) };
  if (endDate) where.date = { ...(where.date || {}), lte: new Date(endDate) };
  if (status && status !== "all") where.status = status;
  if (userId && userId !== "all") where.userId = userId;

  const attendances = await prisma.attendance.findMany({
    where,
    include: { user: true },
    orderBy: { date: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AbsensiKu";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Laporan Absensi");

  sheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Nama", key: "name", width: 24 },
    { header: "Email", key: "email", width: 26 },
    { header: "Kode", key: "code", width: 12 },
    { header: "Departemen", key: "dept", width: 16 },
    { header: "Jam Masuk", key: "in", width: 12 },
    { header: "Jam Pulang", key: "out", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Jarak Masuk (m)", key: "dist", width: 16 },
    { header: "Koordinat Masuk", key: "coord", width: 30 },
    { header: "Catatan", key: "note", width: 30 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  attendances.forEach((a, i) => {
    sheet.addRow({
      no: i + 1,
      date: a.date.toISOString().slice(0, 10),
      name: a.user.name,
      email: a.user.email,
      code: a.user.employeeCode ?? "-",
      dept: a.user.department ?? "-",
      in: a.checkInTime
        ? a.checkInTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      out: a.checkOutTime
        ? a.checkOutTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      status: a.status,
      dist: a.checkInDistance ?? "-",
      coord:
        a.checkInLatitude && a.checkInLongitude
          ? `${a.checkInLatitude}, ${a.checkInLongitude}`
          : "-",
      note: a.note ?? "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="absensi_${Date.now()}.xlsx"`,
    },
  });
}
