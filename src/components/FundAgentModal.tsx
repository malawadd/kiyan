import React, { useState } from 'react';
import { useAccount, useBalance, useWalletClient } from 'wagmi';
import { formatEther, parseEther, zeroAddress, custom } from 'viem';
import { WIP_TOKEN_ADDRESS, StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';

interface FundAgentModalProps {
  agentId: string;
  onClose: () => void;
  sessionId: Id<"sessions"> | null;
  
}

const TOKEN_OPTIONS = [
  { label: '$WIP', address: '0x1514000000000000000000000000000000000000' },
  { label: '$MERC20', address: '0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E' },
];

export function FundAgentModal({ agentId, onClose, sessionId }: FundAgentModalProps) {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(TOKEN_OPTIONS[0].address);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address, token });
  const { data: wallet } = useWalletClient();
  const agent = useQuery(api.agents.getAgent, agentId && sessionId ? { agentId, sessionId } : "skip");
  const agentIpId = agent?.storyInfo?.ipId;

  

  // Helper to set up StoryClient
  async function setupStoryClient(): Promise<StoryClient> {
    if (!wallet) throw new Error('Wallet not connected');
    const config: StoryConfig = {
      wallet: wallet,
      transport: custom(wallet.transport),
      chainId: 'aeneid', // or 'story' for mainnet
    };
    return StoryClient.newClient(config);
  }

  console.log('Funding agent:', agentId, 'Session ID:', sessionId, 'Agent IP ID:', agentIpId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!wallet) {
      setError('Wallet not connected');
      return;
    }
    if (!agentIpId) {
      setError('Agent is not registered on Story Protocol');
      return;
    }
    const fundAmount = parseFloat(amount);
    if (isNaN(fundAmount) || fundAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setIsLoading(true);
    console.log('Funding agent with amount:', fundAmount, 'WIP', agentIpId, WIP_TOKEN_ADDRESS );
    try {
      const client = await setupStoryClient();
      await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: agentIpId,
        payerIpId: zeroAddress,
        token,
        amount: parseEther(amount),
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-4 border-black">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Fund Agent</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-black">Currency</label>
              <select
                value={token}
                onChange={e => setToken(e.target.value)}
                className="nb-input w-full px-4 py-2 border-2 border-black rounded-md mb-2"
              >
                {TOKEN_OPTIONS.map(opt => (
                  <option key={opt.address} value={opt.address}>{opt.label}</option>
                ))}
              </select>
              <label className="block text-sm font-bold mb-2 text-black">Amount to Fund</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="nb-input w-full px-4 py-2 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder={`Enter amount in ${TOKEN_OPTIONS.find(t=>t.address===token)?.label || ''}`}
                min="0.01"
                step="0.01"
                max={maxAmount || undefined}
                required
              />
              {balance && (
                <p className="text-xs text-gray-500 mt-1">
                  Wallet Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {TOKEN_OPTIONS.find(t=>t.address===token)?.label}
                </p>
              )}
            </div>
            {error && (
              <div className="nb-panel-warning p-3">
                <p className="text-red-800 text-sm font-bold">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 nb-button px-4 py-2 text-black bg-gray-100 border-2 border-black rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !amount}
                className="flex-1 nb-button-accent px-4 py-2 text-white bg-green-600 border-2 border-black rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
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
