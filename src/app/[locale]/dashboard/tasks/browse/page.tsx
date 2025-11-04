'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirect page for /dashboard/tasks/browse -> /tasks/browse
 * This maintains backward compatibility if users bookmarked the old URL
 */
export default function DashboardTasksBrowseRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve query parameters (like ?category=slug)
    const queryString = searchParams.toString();
    const targetUrl = `/tasks/browse${queryString ? `?${queryString}` : ''}`;
    
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Redirection en cours...
        </p>
      </div>
    </div>
  );
}
