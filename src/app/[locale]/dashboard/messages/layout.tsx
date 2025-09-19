
'use client';

import { usePathname } from 'next/navigation';
import { ThreadList } from './_components/thread-list';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isThreadDetail = pathname.split('/').length > 4; // e.g. /fr/dashboard/messages/[id]

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] border rounded-lg overflow-hidden">
      <ThreadList />
      {isThreadDetail && (
         <div className="flex-1 flex md:block">{children}</div>
      )}
    </div>
  );
}
