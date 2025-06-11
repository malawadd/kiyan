import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../WalletAuthProvider';
import { AgentCard } from './AgentCard';
import { TransactionList } from './TransactionList';
import { PortfolioChart } from './PortfolioChart';
import { CreateAgentModal } from './CreateAgentModal';
import { FundAgentModal } from './FundAgentModal';
import { WalletBalance } from './WalletBalance';

export function TradingDashboard() {
  const { sessionId, isGuest } = useAuth();
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showFundAgent, setShowFundAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Fetch data based on user type
  const portfolioStats = useQuery(api.portfolio.getPortfolioStats, { sessionId: sessionId || undefined });
  const recentTransactions = useQuery(api.transactions.getRecentTransactions, { 
    sessionId: sessionId || undefined, 
    limit: 10 
  });
  const performanceData = useQuery(api.portfolio.getPerformanceData, { 
    sessionId: sessionId || undefined, 
    days: 30 
  });

  // Demo data for guests
  const demoAgents = useQuery(api.agents.getDemoAgents, isGuest ? {} : "skip");

  const agents = isGuest ? demoAgents : portfolioStats?.agents;

  const handleFundAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowFundAgent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Trading Dashboard</h1>
            {!isGuest && (
              <button
                onClick={() => setShowCreateAgent(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Agent
              </button>
            )}
          </div>
          
          {isGuest && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Demo Mode:</strong> You're viewing sample data. Connect your wallet to create and manage real trading agents.
              </p>
            </div>
          )}
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Portfolio Value</h3>
            <p className="text-2xl font-bold text-gray-900">
              ${portfolioStats?.totalValue?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Allocated</h3>
            <p className="text-2xl font-bold text-gray-900">
              ${portfolioStats?.totalAllocated?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total P&L</h3>
            <p className={`text-2xl font-bold ${
              (portfolioStats?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(portfolioStats?.totalPnL || 0) >= 0 ? '+' : ''}
              ${portfolioStats?.totalPnL?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Agents</h3>
            <p className="text-2xl font-bold text-gray-900">
              {portfolioStats?.activeAgentCount || 0} / {portfolioStats?.agentCount || 0}
            </p>
          </div>
        </div>

        {/* Wallet Balance (only for authenticated users) */}
        {!isGuest && <WalletBalance />}

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
          <PortfolioChart data={performanceData || []} />
        </div>

        {/* Agents Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trading Agents</h2>
          {agents && agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => {
                const agentId = 'id' in agent ? agent.id : agent._id;
                return (
                  <AgentCard
                    key={agentId}
                    agent={agent}
                    onFund={!isGuest ? () => handleFundAgent(agentId) : undefined}
                    isDemo={isGuest}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No trading agents yet</p>
              {!isGuest && (
                <button
                  onClick={() => setShowCreateAgent(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Agent
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <TransactionList transactions={recentTransactions || []} />
        </div>

        {/* Modals */}
        {showCreateAgent && (
          <CreateAgentModal
            onClose={() => setShowCreateAgent(false)}
            sessionId={sessionId}
          />
        )}

        {showFundAgent && selectedAgentId && (
          <FundAgentModal
            agentId={selectedAgentId}
            onClose={() => {
              setShowFundAgent(false);
              setSelectedAgentId(null);
            }}
            sessionId={sessionId}
          />
        )}
      </div>
    </div>
  );
}
