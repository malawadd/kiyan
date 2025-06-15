import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../WalletAuthProvider';
import { WalletConnection } from '../WalletConnection';
import { AgentEditor } from '../components/AgentEditor';

export function MyAgentsPage() {
  const { user, isGuest, signOut, sessionId } = useAuth();
  const [apiKey, setApiKey] = useState('');

  const agents = useQuery(api.agents.getUserAgents, sessionId ? { 
    sessionId 
  } : "skip");

  if (!sessionId || isGuest) {
    return (
      <div className="min-h-screen nb-grid-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="nb-panel p-6 text-center">
            <p className="text-gray-500 mb-4">Please sign in to access your agents</p>
            <WalletConnection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nb-grid-bg">
      {/* Navigation */}
      <nav className="nb-panel-white p-4 m-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">🤖 Kiyan</h1>
            <div className="flex space-x-6">
              <Link to="/" className="font-bold text-gray-600 hover:text-black hover:underline">
                Dashboard
              </Link>
              <Link to="/create-agent" className="font-bold text-gray-600 hover:text-black hover:underline">
                Import Agent
              </Link>
              <Link to="/my-agents" className="font-bold text-black hover:underline">
                My Agents
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold">Welcome, {user?.name || 'Trader'}!</span>
            <WalletConnection />
            <button onClick={signOut} className="nb-button px-4 py-2 text-sm font-bold">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* API Key Input */}
        <div className="nb-panel-white p-6">
          <h2 className="text-xl font-bold mb-4">Fleek API Key</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Enter your Fleek API key to enable editing of your agents. You can find your API key in your Fleek dashboard.
            </p>
            <div className="flex gap-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Fleek API key"
                className="nb-input flex-1 px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">My Agents</h2>
          
          {!agents && (
            <div className="nb-panel p-6 text-center">
              <p className="text-gray-500">Loading agents...</p>
            </div>
          )}

          {agents?.length === 0 && (
            <div className="nb-panel p-6 text-center">
              <p className="text-gray-500 mb-4">No agents found</p>
              <Link to="/create-agent" className="nb-button-accent px-6 py-3">
                Import Your First Agent
              </Link>
            </div>
          )}

          {agents?.map((agent) => (
            <div key={agent._id} className="nb-panel-white">
              {apiKey ? (
                <AgentEditor
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                  agent={agent}
                  apiKey={apiKey}
                  sessionId={sessionId}
                />
              ) : (
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4">{agent.name}</h3>
                  <p className="text-gray-500">Enter your Fleek API key above to edit this agent</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}