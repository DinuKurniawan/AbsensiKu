import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

  const doc = new jsPDF("landscape");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Absensi Karyawan", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const filterText = [
    startDate ? `Dari: ${startDate}` : "",
    endDate ? `Hingga: ${endDate}` : "",
    status && status !== "all" ? `Status: ${status}` : "",
  ]
    .filter(Boolean)
    .join("  |  ");
  if (filterText) doc.text(filterText, 14, 22);
  doc.text(
    `Diunduh: ${new Date().toLocaleString("id-ID")}`,
    14,
    filterText ? 27 : 22
  );

  autoTable(doc, {
    startY: filterText ? 32 : 27,
    head: [
      [
        "No",
        "Tanggal",
        "Nama",
        "Kode",
        "Dept",
        "Masuk",
        "Pulang",
        "Status",
        "Jarak (m)",
      ],
    ],
    body: attendances.map((a, i) => [
      i + 1,
      a.date.toISOString().slice(0, 10),
      a.user.name,
      a.user.employeeCode ?? "-",
      a.user.department ?? "-",
      a.checkInTime
        ? a.checkInTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      a.checkOutTime
        ? a.checkOutTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      a.status,
      a.checkInDistance != null ? String(a.checkInDistance) : "-",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="absensi_${Date.now()}.pdf"`,
    },
  });
}
