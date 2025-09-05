
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const mockKycRequests = [
    { id: 'usr_2', providerName: 'Jane Doe', email: 'jane.doe@example.com', country: 'FR', status: 'pending', submittedAt: '2023-10-26T10:00:00Z', documents: ['identity', 'selfie'] },
    { id: 'usr_5', providerName: 'Ahmed Benali', email: 'ahmed.benali@example.com', country: 'BE', status: 'pending', submittedAt: '2023-10-25T14:30:00Z', documents: ['identity'] },
    { id: 'usr_6', providerName: 'Sophie Dubois', email: 'sophie.dubois@example.com', country: 'FR', status: 'rejected', submittedAt: '2023-10-24T09:00:00Z', documents: ['identity', 'selfie'] },
];

export default function AdminKycDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ providerId: string }>();
    const providerId = params.providerId;
    const t = useTranslations('AdminKycDetailPage');

    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedProvider = mockKycRequests.find(p => p.id === providerId);
        if (fetchedProvider) {
            setProvider(fetchedProvider);
        }
        setLoading(false);
    }, [providerId]);


    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!provider) {
        return (
             <div className="text-center">
                <h1 className="text-xl">Demande KYC non trouvée.</h1>
                <Link href="/dashboard/admin/kyc">Retour à la liste</Link>
            </div>
        )
    }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/kyc">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">Retour</span>
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle', { providerName: provider.providerName })}
                </p>
            </div>
        </div>

        {/* Details and forms will go here in the next steps */}
         <p>Page de détail pour {provider.providerName}. La suite arrive bientôt !</p>
    </div>
  );
}
