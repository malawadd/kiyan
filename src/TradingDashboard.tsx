import { useState } from "react";
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { WalletStatusPanel } from "./WalletStatusPanel";
import { WalletConnection } from "./WalletConnection";
import { useAuth } from "./WalletAuthProvider";
import { CreateAgentModal } from "./components/CreateAgentModal";
import { FundAgentModal } from "./components/FundAgentModal";

export function TradingDashboard() {
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showFundAgent, setShowFundAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'agent', message: 'Hello! I\'m your AI trading agent. How can I help you today?' },
    { id: 2, type: 'user', message: 'What\'s my portfolio performance?' },
    { id: 3, type: 'agent', message: 'Your portfolio is up 12.5% this month! Your DeFi agent has been performing particularly well with a 18% gain.' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const { user, isGuest, signOut, sessionId } = useAuth();

  // Fetch data from backend
  const portfolioStats = useQuery(api.portfolio.getPortfolioStats, { sessionId: sessionId || undefined });
  const recentTransactions = useQuery(api.transactions.getRecentTransactions, { 
    sessionId: sessionId || undefined, 
    limit: 5 
  });

  // Demo data for guests
  const demoAgents = useQuery(api.agents.getDemoAgents, isGuest ? {} : "skip");
  const agents = isGuest ? demoAgents : portfolioStats?.agents;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { 
        id: Date.now(), 
        type: 'user', 
        message: newMessage 
      }]);
      setNewMessage('');
      
      // Simulate agent response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'agent',
          message: isGuest 
            ? 'This is a demo response. Connect your wallet for real trading features!'
            : 'I understand your request. Let me analyze the current market conditions and get back to you with recommendations.'
        }]);
      }, 1000);
    }
  };

  const handleFundAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowFundAgent(true);
  };

  const formatTransactionAsset = (tx: any) => {
    if (tx.type === 'swap' && tx.baseAsset && tx.quoteAsset) {
      return `${tx.baseAsset} → ${tx.quoteAsset}`;
    }
    return tx.asset;
  };

  const formatTime = (timestamp: number) => {
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
    <div className="min-h-screen nb-grid-bg">
      {/* Navigation */}
      <nav className="nb-panel-white p-4 m-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">🤖 Kiyan</h1>
            <div className="flex space-x-6">
              <button className="font-bold text-black hover:underline">Dashboard</button>
              <button className="font-bold text-gray-600 hover:text-black hover:underline">Agents</button>
              <button className="font-bold text-gray-600 hover:text-black hover:underline">Funds</button>
              <button className="font-bold text-gray-600 hover:text-black hover:underline">Analytics</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold">
              Welcome, {user?.name || 'Trader'}!
              {isGuest && <span className="text-sm text-gray-600"> (Guest)</span>}
            </span>
            {!isGuest && <WalletConnection />}
            <button 
              onClick={signOut}
              className="nb-button px-4 py-2 text-sm font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 space-y-6">
        {/* Welcome Panel */}
        <div className="nb-panel p-6">
          <h2 className="text-3xl font-bold mb-4">🚀 Welcome to Your Trading Command Center</h2>
          <p className="text-lg mb-6 font-medium">
            {isGuest 
              ? "You're in demo mode. Connect your wallet for real trading features!"
              : "Manage your AI-powered trading agents, monitor your portfolio, and execute trades on the blockchain."
            }
          </p>
          <button 
            onClick={() => setShowCreateAgent(true)}
            className="nb-button-accent px-6 py-3 text-lg"
            disabled={isGuest}
          >
            🤖 {isGuest ? 'Demo Mode - View Only' : 'Create Your First Trading Agent'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Status Panel */}
          {!isGuest && (
            <div className="lg:col-span-3">
              <WalletStatusPanel />
            </div>
          )}
          
          {/* Guest Mode Notice */}
          {isGuest && (
            <div className="lg:col-span-3">
              <div className="nb-panel-warning p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">👤 Guest Mode Active</h3>
                    <p className="font-medium">You're viewing demo data. Connect your wallet for real trading features.</p>
                  </div>
                  <button 
                    onClick={signOut}
                    className="nb-button-accent px-6 py-3 text-lg"
                  >
                    🔗 Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Agent Chat */}
          <div className="lg:col-span-2">
            <div className="nb-panel-white p-6 h-96">
              <h3 className="text-xl font-bold mb-4">💬 Agent Chat</h3>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={msg.type === 'user' ? 'nb-chat-bubble-user p-3' : 'nb-chat-bubble-agent p-3'}
                    >
                      <p className="font-medium">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask your agent anything..."
                    className="flex-1 nb-input px-4 py-2"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="nb-button px-4 py-2"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Funds Overview */}
          <div className="space-y-4">
            <div className="nb-panel-success p-4">
              <h4 className="font-bold text-sm mb-2">💰 TOTAL PORTFOLIO</h4>
              <p className="text-2xl font-bold">
                ${portfolioStats?.totalValue?.toLocaleString() || '0'}{isGuest && ' (Demo)'}
              </p>
              <p className="text-sm font-medium text-green-700">
                {portfolioStats?.totalPnL && portfolioStats.totalPnL >= 0 ? '+' : ''}
                ${portfolioStats?.totalPnL?.toLocaleString() || '0'} P&L
              </p>
            </div>
            <div className="nb-panel-white p-4">
              <h4 className="font-bold text-sm mb-2">🏦 ALLOCATED FUNDS</h4>
              <p className="text-xl font-bold">
                ${portfolioStats?.totalAllocated?.toLocaleString() || '0'}{isGuest && ' (Demo)'}
              </p>
              <p className="text-sm font-medium">Allocated to agents</p>
            </div>
            <div className="nb-panel-accent p-4">
              <h4 className="font-bold text-sm mb-2">🤖 ACTIVE AGENTS</h4>
              <p className="text-xl font-bold">
                {portfolioStats?.activeAgentCount || 0} / {portfolioStats?.agentCount || 0}
              </p>
              <p className="text-sm font-medium">Trading agents</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent List */}
          <div className="nb-panel-white p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🤖 Your Trading Agents</h3>
              <button 
                onClick={() => setShowCreateAgent(true)}
                className="nb-button px-4 py-2 text-sm"
                disabled={isGuest}
              >
                + Create Agent
              </button>
            </div>
            <div className="space-y-3">
              {agents && agents.length > 0 ? (
                agents.map((agent) => {
                  const agentId = 'id' in agent ? agent.id : agent._id;
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'active': return 'success';
                      case 'paused': return 'warning';
                      case 'stopped': return 'error';
                      default: return 'white';
                    }
                  };

                  return (
                    <div key={agentId} className={`nb-panel-${getStatusColor(agent.status)} p-4`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold">{agent.name}</h4>
                          <p className="text-sm font-medium">
                            Status: {agent.status}{isGuest && ' (Demo)'}
                          </p>
                          <p className="text-xs font-medium">
                            Trades: {agent.totalTrades} | Win Rate: {(agent.winRate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${agent.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {agent.totalPnL >= 0 ? '+' : ''}${agent.totalPnL?.toLocaleString()}
                          </p>
                          <p className="text-sm font-medium">P&L</p>
                          {!isGuest && (
                            <button
                              onClick={() => handleFundAgent(agentId)}
                              className="mt-2 text-xs nb-button px-2 py-1"
                            >
                              Fund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="nb-panel p-4 text-center">
                  <p className="font-medium text-gray-600">
                    {isGuest ? 'Loading demo agents...' : 'No trading agents yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="nb-panel-white p-6">
            <h3 className="text-xl font-bold mb-4">📊 Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx._id} className="nb-panel p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">
                          {tx.type.toUpperCase()} {formatTransactionAsset(tx)}
                        </p>
                        <p className="text-sm font-medium">
                          {tx.amount.toFixed(4)} @ ${tx.price.toLocaleString()}
                        </p>
                        <p className={`text-xs font-medium ${tx.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          P&L: {tx.pnl >= 0 ? '+' : ''}${tx.pnl.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{formatTime(tx.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="nb-panel p-4 text-center">
                  <p className="font-medium text-gray-600">
                    {isGuest ? 'Loading demo transactions...' : 'No transactions yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateAgent && !isGuest && (
        <CreateAgentModal
          onClose={() => setShowCreateAgent(false)}
          sessionId={sessionId}
        />
      )}

      {/* Fund Agent Modal */}
      {showFundAgent && selectedAgentId && !isGuest && (
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
  );
}
