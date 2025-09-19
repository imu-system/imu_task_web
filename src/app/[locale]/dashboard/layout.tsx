
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardNav } from '@/components/dashboard-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AuthGuard from '@/components/auth-guard';
import ImpersonationBanner from '@/components/impersonation-banner';
import OfflineBanner from '@/components/offline-banner';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
        <SidebarProvider>
            <ImpersonationBanner />
            <OfflineBanner />
            <div className="md:flex">
              <DashboardNav />
              <SidebarInset>
                <DashboardHeader />
                <main className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                  {children}
                </main>
              </SidebarInset>
            </div>
            <MobileBottomNav />
        </SidebarProvider>
    </AuthGuard>
  );
}
