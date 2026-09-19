import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

interface AppShellProps {
  title: string;
  subtitle?: string;
  alertsCount?: number;
  children: React.ReactNode;
}

export function AppShell({
  title,
  subtitle,
  alertsCount = 0,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#090d16] text-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} alertsCount={alertsCount} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
