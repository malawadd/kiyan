import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

interface FundAgentModalProps {
  agentId: string;
  onClose: () => void;
  sessionId: Id<"sessions"> | null;
}

export function FundAgentModal({ agentId, onClose, sessionId }: FundAgentModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const agent = useQuery(api.agents.getAgent, 
    sessionId ? { sessionId, agentId: agentId as Id<"agents"> } : "skip"
  );
  const fundAgent = useMutation(api.funds.fundAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !amount) return;

    const fundAmount = parseFloat(amount);
    if (fundAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you would:
      // 1. Initiate blockchain transaction
      // 2. Wait for confirmation
      // 3. Pass txHash to fundAgent
      
      // For demo, we'll simulate with a mock txHash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      await fundAgent({
        sessionId,
        agentId: agentId as Id<"agents">,
        amount: fundAmount,
        txHash: mockTxHash,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to fund agent');
    } finally {
      setIsLoading(false);
    }
  };

  const maxAmount = balance ? parseFloat(formatEther(balance.value)) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Fund Agent</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {agent && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{agent.strategy} Strategy</p>
              <div className="mt-2 text-sm">
                <p>Current Balance: <span className="font-medium">${agent.currentBalance.toLocaleString()}</span></p>
                <p>Total Allocated: <span className="font-medium">${agent.fundsAllocated.toLocaleString()}</span></p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Fund ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
                min="0.01"
                step="0.01"
                required
              />
              {balance && (
                <p className="text-xs text-gray-500 mt-1">
                  Wallet Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> In demo mode, this simulates a blockchain transaction. 
                In production, this would trigger a real on-chain transfer.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Fund Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
