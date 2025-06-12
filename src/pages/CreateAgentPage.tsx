import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../WalletAuthProvider';
import { Id } from "../../convex/_generated/dataModel";
import { WalletConnection } from "../WalletConnection";
import RegisterOnStoryProtocolPanel from "../components/RegisterOnStoryProtocolPanel";
import CreateNftCollectionPanel from "../components/CreateNftCollectionPanel";

export function CreateAgentPage() {
  const navigate = useNavigate();
  const { user, isGuest, signOut, sessionId } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [fleekId, setFleekId] = useState('');
  const [fleekKey, setFleekKey] = useState('');
  const [agentId, setAgentId] = useState<Id<"agents"> | null>(null);
  const [agentData, setAgentData] = useState<any>(null);

    // Step 2: NFT collection
    const [collectionInfo, setCollectionInfo] = useState<{ spgNftContract: string, txHash: string, collectionName: string } | null>(null);

    // Step 3: Story Protocol registration
    const [storyProtocolResult, setStoryProtocolResult] = useState<{ ipId: string; txHash: string } | null>(null);
  
  // Convex mutations
  const importAgent = useAction(api.fleekAgents.importAgent);
  const saveStoryInfo = useMutation(api.fleekAgents.saveStoryInfo);

  // Step 1: Import agent from Fleek
  const handleImport = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!sessionId) throw new Error("Not authenticated");

      // You may want to fetch and store more than just agentId here
      const result  = await importAgent({
        sessionId,
        fleekId,
        fleekKey
      });
      setAgentId(result.agentId);
      setAgentData(result.agentData); // Save all needed data for next steps
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
  };

   // Step 2: After creating NFT collection
   const handleCollectionCreated = (result: { spgNftContract: string; txHash: string; collectionName: string }) => {
    setCollectionInfo(result);
    setStep(3);
  };

  // After registration, optionally save to backend and navigate, or show next steps
  const handleRegistered = async (result: { ipId: string; txHash: string }) => {
    setStoryProtocolResult(result);

    if (sessionId && agentId) {
      try {
        await saveStoryInfo({
          sessionId,
          agentId,
          ipId: result.ipId,
          vault: "" // Add vault if needed
        });
      } catch (e) {
        // Optionally, handle error, but don't block UX
      }
    }
  };

  return (
    <div className="min-h-screen nb-grid-bg ">
      {/* Navigation Bar */}
      <nav className="nb-panel-white p-4 m-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">🤖 Kiyan</h1>
            <div className="flex space-x-6">
              <Link to="/" className="font-bold text-gray-600 hover:text-black hover:underline">Dashboard</Link>
              {!isGuest && (
                <Link to="/create-agent" className="font-bold text-black hover:underline">
                  Import Agent
                </Link>
              )}
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

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="nb-panel-white p-6">
          <h1 className="text-2xl font-bold mb-2">🤖 Import Fleek Agent</h1>
          <p className="text-gray-600">
            Import your Fleek agent and register it on Story Protocol to enable token-gated access and revenue sharing.
          </p>
        </div>

        {/* STEP 1: Import agent */}
        {step === 1 && (
          <div className="nb-panel p-6">
            <h2 className="text-xl font-bold mb-4">Step 1: Import from Fleek</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Fleek Agent ID</label>
                <input
                  type="text"
                  value={fleekId}
                  onChange={(e) => setFleekId(e.target.value)}
                  className="nb-input w-full px-4 py-2"
                  placeholder="Enter Fleek Agent ID"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Fleek API Key</label>
                <input
                  type="password"
                  value={fleekKey}
                  onChange={(e) => setFleekKey(e.target.value)}
                  className="nb-input w-full px-4 py-2"
                  placeholder="Enter your Fleek API key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally and never sent to our servers
                </p>
              </div>
              <button
                onClick={e => { void handleImport(e); }}
                disabled={!fleekId || !fleekKey}
                className="nb-button-accent w-full py-3"
              >
                Import Agent
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Create NFT collection for agent */}
        {step === 2 && agentData && (
          <CreateNftCollectionPanel
            agentData={agentData}
            onCreated={handleCollectionCreated}
          />
        )}

        {/* Step 3: Register on Story Protocol using collection */}
        {step === 3 && collectionInfo && (
          <RegisterOnStoryProtocolPanel
            agentData={agentData}
            spgNftContract={collectionInfo.spgNftContract}
            onRegistered={e => { void handleRegistered(e); }}
          />
        )}

        {/* STEP 2: Register on Story Protocol
        {step === 2 && !storyProtocolResult && (
          <RegisterOnStoryProtocolPanel
            agentData={agentData}
            onRegistered={e => { void handleRegistered(e); }}
          />
        )} */}

        {/* STEP 3: Show registration result */}
        {storyProtocolResult && (
          <div className="nb-panel-success p-6 mt-6 text-center">
            <h2 className="text-xl font-bold mb-3">Agent Registered!</h2>
            <div className="mb-2">
              <b>IP ID:</b> <span className="font-mono">{storyProtocolResult.ipId}</span>
            </div>
            <div className="mb-4">
              <b>Tx Hash:</b> <span className="font-mono">{storyProtocolResult.txHash}</span>
            </div>
            <button
              className="nb-button-accent mt-3 px-6 py-3"
              onClick={() => navigate(`/agent/${agentId}`)}
            >
              View Agent
            </button>
          </div>
        )}

        {/* Error panel */}
        {error && (
          <div className="nb-panel-warning p-4">
            <p className="text-sm font-bold">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
