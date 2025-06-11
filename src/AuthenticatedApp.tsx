import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { TradingDashboard } from './TradingDashboard';
import { useAuth } from './WalletAuthProvider';
import { api } from '../convex/_generated/api';

export function AuthenticatedApp() {
  const { isAuthenticated, isGuest } = useAuth();
  const initializeDemoData = useMutation(api.demoData.initializeDemoData);

  // Initialize demo data when app loads (for guest users)
  useEffect(() => {
    if (isGuest) {
      initializeDemoData({}).catch(console.error);
    }
  }, [isGuest, initializeDemoData]);

  if (!isAuthenticated) {
    return null;
  }

  return <TradingDashboard />;
}
