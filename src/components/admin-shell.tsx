"use client";

import { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarClock,
  Settings,
  UserCircle,
} from "lucide-react";
import { Sidebar, NavItem } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Karyawan", href: "/admin/employees", icon: Users },
  { label: "Absensi", href: "/admin/attendances", icon: ClipboardList },
  { label: "Pengajuan Izin", href: "/admin/leave-requests", icon: CalendarClock },
  { label: "Pengaturan Kantor", href: "/admin/settings", icon: Settings },
  { label: "Profil", href: "/admin/profile", icon: UserCircle },
];

export function AdminShell({
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
      <Sidebar items={adminNav} subtitle="Admin Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={user} navItems={adminNav} profileHref="/admin/profile" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
