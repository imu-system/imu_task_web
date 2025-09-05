
import { DashboardNav } from '@/components/dashboard-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AuthGuard from '@/components/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
        <SidebarProvider>
            <DashboardNav />
            <SidebarInset>
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    </AuthGuard>
  );
}
