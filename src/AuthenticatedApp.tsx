import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TradingDashboard } from './TradingDashboard';
import { CreateAgentPage } from './pages/CreateAgentPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { MyAgentsPage } from './pages/MyAgentsPage';
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

  return (
    <Routes>
      <Route path="/" element={<TradingDashboard />} />
      <Route path="/create-agent" element={<CreateAgentPage />} />
      <Route path="/agent/:id" element={<AgentDetailPage />} />
      <Route path="/my-agents" element={<MyAgentsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
