"use client";

import { ReactNode } from "react";
import {
  LayoutDashboard,
  Fingerprint,
  History,
  FileText,
  UserCircle,
} from "lucide-react";
import { Sidebar, NavItem } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

const employeeNav: NavItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Absensi", href: "/employee/attendance", icon: Fingerprint },
  { label: "Riwayat", href: "/employee/history", icon: History },
  { label: "Izin / Sakit / Cuti", href: "/employee/leave-request", icon: FileText },
  { label: "Profil", href: "/employee/profile", icon: UserCircle },
];

export function EmployeeShell({
  user,
  children,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar items={employeeNav} subtitle="Karyawan" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={user} navItems={employeeNav} profileHref="/employee/profile" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
