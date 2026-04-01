import { useAuth } from '../components/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (profile?.role === 'provider') {
    return <ProviderDashboard />;
  }

  return <CustomerDashboard />;
}
