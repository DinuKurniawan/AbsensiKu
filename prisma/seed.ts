import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Default Admin
  const adminPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@absensiku.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@absensiku.com",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "081234567890",
      position: "Super Admin",
      department: "IT",
      employeeCode: "ADM-001",
      address: "Jakarta, Indonesia",
      isActive: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // 2. Default Employee
  const employeePassword = await bcrypt.hash("password123", 10);
  const employee = await prisma.user.upsert({
    where: { email: "karyawan@absensiku.com" },
    update: {},
    create: {
      name: "Karyawan Contoh",
      email: "karyawan@absensiku.com",
      password: employeePassword,
      role: Role.EMPLOYEE,
      phone: "081298765432",
      position: "Staff",
      department: "Operasional",
      employeeCode: "EMP-001",
      address: "Jakarta, Indonesia",
      isActive: true,
    },
  });
  console.log("✅ Employee created:", employee.email);

  // 3. Additional dummy employees
  const dummyEmployees = [
    { name: "Budi Santoso", email: "budi@absensiku.com", code: "EMP-002", dept: "Marketing", pos: "Marketing Executive" },
    { name: "Siti Aminah", email: "siti@absensiku.com", code: "EMP-003", dept: "Finance", pos: "Accountant" },
    { name: "Agus Hermawan", email: "agus@absensiku.com", code: "EMP-004", dept: "HR", pos: "HR Officer" },
    { name: "Dewi Lestari", email: "dewi@absensiku.com", code: "EMP-005", dept: "IT", pos: "Developer" },
  ];

  for (const e of dummyEmployees) {
    const pwd = await bcrypt.hash("password123", 10);
    await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: {
        name: e.name,
        email: e.email,
        password: pwd,
        role: Role.EMPLOYEE,
        phone: "0812" + Math.floor(10000000 + Math.random() * 90000000).toString(),
        position: e.pos,
        department: e.dept,
        employeeCode: e.code,
        address: "Jakarta, Indonesia",
        isActive: true,
      },
    });
    console.log("✅ Dummy employee created:", e.email);
  }

  // 4. Default Office Setting
  const existingSetting = await prisma.officeSetting.findFirst();
  if (!existingSetting) {
    const setting = await prisma.officeSetting.create({
      data: {
        officeName: "Kantor Pusat",
        officeLatitude: -6.2,
        officeLongitude: 106.816666,
        radiusMeter: 100,
        checkInStart: "07:00",
        checkInEnd: "09:00",
        checkOutStart: "16:00",
        checkOutEnd: "18:00",
        timezone: "Asia/Jakarta",
      },
    });
    console.log("✅ Office setting created:", setting.officeName);
  } else {
    console.log("ℹ️  Office setting already exists");
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
