import React from 'react';

interface Agent {
  _id?: string;
  id?: string;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  strategy?: string;
  fundsAllocated: number;
  currentBalance: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  lastTradeAt?: number;
}

interface AgentCardProps {
  agent: Agent;
  onFund?: () => void;
  isDemo?: boolean;
}

export function AgentCard({ agent, onFund, isDemo }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastTrade = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
          {agent.strategy && (
            <p className="text-sm text-gray-500 capitalize">{agent.strategy} Strategy</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
          {agent.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Allocated</span>
          <span className="text-sm font-medium">${agent.fundsAllocated.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Current Balance</span>
          <span className="text-sm font-medium">${agent.currentBalance.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">P&L</span>
          <span className={`text-sm font-medium ${
            agent.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {agent.totalPnL >= 0 ? '+' : ''}${agent.totalPnL.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Win Rate</span>
          <span className="text-sm font-medium">{(agent.winRate * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Total Trades</span>
          <span className="text-sm font-medium">{agent.totalTrades}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Last Trade</span>
          <span className="text-sm font-medium">{formatLastTrade(agent.lastTradeAt)}</span>
        </div>
      </div>

      {onFund && !isDemo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onFund}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Fund Agent
          </button>
        </div>
      )}
    </div>
  );
}
