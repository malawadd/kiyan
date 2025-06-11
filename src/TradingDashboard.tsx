import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";

export function TradingDashboard() {
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'agent', message: 'Hello! I\'m your AI trading agent. How can I help you today?' },
    { id: 2, type: 'user', message: 'What\'s my portfolio performance?' },
    { id: 3, type: 'agent', message: 'Your portfolio is up 12.5% this month! Your DeFi agent has been performing particularly well with a 18% gain.' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const loggedInUser = useQuery(api.auth.loggedInUser);

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
          message: 'I understand your request. Let me analyze the current market conditions and get back to you with recommendations.'
        }]);
      }, 1000);
    }
  };

  const agents = [
    { id: 1, name: 'DeFi Hunter', status: 'Active', pnl: '+18.2%', color: 'success' },
    { id: 2, name: 'Arbitrage Bot', status: 'Active', pnl: '+7.8%', color: 'success' },
    { id: 3, name: 'Yield Farmer', status: 'Paused', pnl: '-2.1%', color: 'warning' },
  ];

  const transactions = [
    { id: 1, type: 'Buy', asset: 'ETH', amount: '2.5', price: '$3,245', time: '2 min ago' },
    { id: 2, type: 'Sell', asset: 'USDC', amount: '1,000', price: '$1.00', time: '15 min ago' },
    { id: 3, type: 'Swap', asset: 'UNI → ETH', amount: '50', price: '$8.12', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen nb-grid-bg">
      {/* Navigation */}
      <nav className="nb-panel-white p-4 m-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">🤖 TradingBot Pro</h1>
            <div className="flex space-x-6">
              <button className="font-bold text-black hover:underline">Dashboard</button>
              <button className="font-bold text-gray-600 hover:text-black hover:underline">Agents</button>
              <button className="font-bold text-gray-600 hover:text-black hover:underline">Funds</button>
              <button className="font-bold text-gray-600 hover:text-black hover:underline">Analytics</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold">Welcome, {loggedInUser?.email?.split('@')[0] || 'Trader'}!</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="p-4 space-y-6">
        {/* Welcome Panel */}
        <div className="nb-panel p-6">
          <h2 className="text-3xl font-bold mb-4">🚀 Welcome to Your Trading Command Center</h2>
          <p className="text-lg mb-6 font-medium">
            Manage your AI-powered trading agents, monitor your portfolio, and execute trades on the blockchain.
          </p>
          <button 
            onClick={() => setShowCreateAgent(true)}
            className="nb-button-accent px-6 py-3 text-lg"
          >
            🤖 Create Your First Trading Agent
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <p className="text-2xl font-bold">$47,832.50</p>
              <p className="text-sm font-medium text-green-700">+12.5% this month</p>
            </div>
            <div className="nb-panel-white p-4">
              <h4 className="font-bold text-sm mb-2">🏦 WALLET BALANCE</h4>
              <p className="text-xl font-bold">$8,234.12</p>
              <p className="text-sm font-medium">Available for trading</p>
            </div>
            <div className="nb-panel-accent p-4">
              <h4 className="font-bold text-sm mb-2">🤖 AGENT FUNDS</h4>
              <p className="text-xl font-bold">$39,598.38</p>
              <p className="text-sm font-medium">Allocated to 3 agents</p>
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
              >
                + Create Agent
              </button>
            </div>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className={`nb-panel-${agent.color} p-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{agent.name}</h4>
                      <p className="text-sm font-medium">Status: {agent.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{agent.pnl}</p>
                      <p className="text-sm font-medium">P&L</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="nb-panel-white p-6">
            <h3 className="text-xl font-bold mb-4">📊 Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="nb-panel p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{tx.type} {tx.asset}</p>
                      <p className="text-sm font-medium">{tx.amount} @ {tx.price}</p>
                    </div>
                    <p className="text-sm font-medium">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="nb-panel-white p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">🤖 Create New Trading Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Agent Name</label>
                <input type="text" className="w-full nb-input px-3 py-2" placeholder="e.g., DeFi Hunter" />
              </div>
              <div>
                <label className="block font-bold mb-2">Strategy Type</label>
                <select className="w-full nb-input px-3 py-2">
                  <option>Arbitrage</option>
                  <option>DeFi Yield Farming</option>
                  <option>Swing Trading</option>
                  <option>Market Making</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">Initial Funding ($)</label>
                <input type="number" className="w-full nb-input px-3 py-2" placeholder="1000" />
              </div>
              <div>
                <label className="block font-bold mb-2">Risk Level</label>
                <select className="w-full nb-input px-3 py-2">
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateAgent(false)}
                className="flex-1 nb-button py-2"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCreateAgent(false)}
                className="flex-1 nb-button-accent py-2"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
