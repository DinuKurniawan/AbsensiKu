import { requireAdmin } from "@/lib/session";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  // Only serializable fields (no functions/icons) crossing server→client boundary.
  const safeUser = {
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  };

  return <AdminShell user={safeUser}>{children}</AdminShell>;
}
