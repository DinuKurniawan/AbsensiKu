import { requireEmployee } from "@/lib/session";
import { EmployeeShell } from "@/components/employee-shell";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireEmployee();

  const safeUser = {
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  };

  return <EmployeeShell user={safeUser}>{children}</EmployeeShell>;
}
