import ClientDashboardPage from '@/components/dashboards/client-dashboard';
import ProviderDashboardPage from '@/components/dashboards/provider-dashboard';

export default function Dashboard() {
  // In a real application, you would have logic to determine the user's role.
  // For this prototype, we'll default to the provider dashboard.
  const userRole = 'provider'; // or 'client'

  if (userRole === 'client') {
    return <ClientDashboardPage />;
  }

  if (userRole === 'provider') {
    return <ProviderDashboardPage />;
  }

  // Fallback or loading state
  return <div>Loading dashboard...</div>;
}
