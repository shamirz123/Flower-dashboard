import { AppShell } from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <AppShell name={user.name} email={user.email}>
      {children}
    </AppShell>
  );
}
