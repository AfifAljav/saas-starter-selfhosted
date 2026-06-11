import { redirect } from "next/navigation";
import { validateRequest } from "@saas/auth";
import { Sidebar } from "@/components/app/Sidebar";
import { UserNav } from "@/components/app/UserNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard — redirect unauthenticated users to login
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
          <div className="flex flex-1 items-center gap-4">
            {/* Page title injected by individual pages via layout slot */}
          </div>
          <UserNav user={user} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
