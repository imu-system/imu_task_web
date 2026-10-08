
'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardNav } from '@/components/dashboard-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AuthGuard from '@/components/auth-guard';
import ImpersonationBanner from '@/components/impersonation-banner';
import OfflineBanner from '@/components/offline-banner';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { useSearchParams } from '@/navigation';
import { useState, useEffect } from 'react';
import { TaskDetailSheet } from '@/components/task-detail-sheet';
import { BookingDetailSheet } from '@/components/booking-detail-sheet';
import { SettingsModalProvider } from '@/context/settings-modal-context';
import { SettingsModal } from '@/components/settings-modal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    function supportsBackdropFilter(){
      const el = document.createElement('div');
      el.style.backdropFilter = 'blur(1px)';
      return el.style.backdropFilter !== '';
    }

    if(!supportsBackdropFilter()){
      document.documentElement.classList.add('no-backdrop');
    }
  }, []);


  useEffect(() => {
    const taskIdFromUrl = searchParams.get('taskId');
    const bookingIdFromUrl = searchParams.get('bookingId');
    
    if (taskIdFromUrl) {
      setSelectedTaskId(taskIdFromUrl);
      setSelectedBookingId(null);
    } else {
      setSelectedTaskId(null);
    }

    if (bookingIdFromUrl) {
      setSelectedBookingId(bookingIdFromUrl);
      setSelectedTaskId(null);
    } else {
      setSelectedBookingId(null);
    }
  }, [searchParams]);

  const handleCloseSheet = () => {
    setSelectedTaskId(null);
    setSelectedBookingId(null);
    // Use window.history to remove the query param without causing a full re-render from the router.
    const newUrl = `${window.location.pathname}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  };

  return (
    <AuthGuard>
      <SettingsModalProvider>
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
            <TaskDetailSheet 
              taskId={selectedTaskId}
              open={!!selectedTaskId}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  handleCloseSheet();
                }
              }}
            />
            <BookingDetailSheet
              bookingId={selectedBookingId}
              open={!!selectedBookingId}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  handleCloseSheet();
                }
              }}
            />
            <SettingsModal />
        </SidebarProvider>
      </SettingsModalProvider>
    </AuthGuard>
  );
}
