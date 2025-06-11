import { TradingDashboard } from './TradingDashboard';
import { useAuth } from './WalletAuthProvider';

export function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return <TradingDashboard />;
}
