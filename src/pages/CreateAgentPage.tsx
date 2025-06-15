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
  const [manualCollection, setManualCollection] = useState("");
  const [showEditPopover, setShowEditPopover] = useState(false);
  
  // Step 3: Story Protocol registration
  const [storyProtocolResult, setStoryProtocolResult] = useState<{ ipId: string; txHash: string, valut: string, licenseTermsId: string} | null>(null);
    
  // Convex mutations
  const importAgent = useAction(api.fleekAgents.importAgent);
  const saveStoryInfo = useMutation(api.fleekAgents.saveStoryInfo);

  // Step 1: Import agent from Fleek
  const handleImport = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!sessionId) throw new Error("Not authenticated");

      const result = await importAgent({
        sessionId,
        fleekId,
        fleekKey
      });
      console.log("Imported agent:", result);
      setAgentId(result.agentId);
      setAgentData(result.agentData);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // After registration, optionally save to backend and navigate, or show next steps
  const handleRegistered = async (result: { ipId: string; txHash: string, valut: string, licenseTermsId:string }) => {
    setStoryProtocolResult(result);

    if (sessionId && agentId) {
      try {
        await saveStoryInfo({
          sessionId,
          agentId,
          ipId: result.ipId,
          vault: result.valut,
          licenseTermsId: result.licenseTermsId
        });
      } catch {
        // Optionally handle error, but don't block UX
      }
    }
  };

  const handleSkipCollection = () => {
    setCollectionInfo(null);
    setStep(3);
  };

  function shortenAddress(addr: string) {
    if (!addr || addr.length < 10) return addr || "0x...";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  return (
    <div className="min-h-screen nb-grid-bg">
      {/* Navigation Bar */}
      <nav className="nb-panel-white p-4 m-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">🤖 Kiyan</h1>
            <div className="flex space-x-6">
              <Link to="/" className="font-bold text-gray-600 hover:text-black hover:underline">Dashboard</Link>
              {!isGuest && (
                <>
                  <Link to="/create-agent" className="font-bold text-black hover:underline">
                    Import Agent
                  </Link>
                  <Link to="/my-agents" className="font-bold text-gray-600 hover:text-black hover:underline">
                    My Agents
                  </Link>
                </>
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
          <>
            <CreateNftCollectionPanel
              agentData={agentData}
              onCreated={result => { setCollectionInfo(result); setStep(3); }}
            />
            <div className="text-center my-4">
              <button
                className="nb-button w-full mt-3"
                onClick={handleSkipCollection}
                type="button"
              >
                Skip Collection Creation & Use Existing Contract
              </button>
            </div>
          </>
        )}

        {/* Step 3: Register on Story Protocol using collection */}
        {step === 3 && (
            <>
           <div className="relative  p-1 mt-6  border-2">
  {/* Yellow ribbon badge */}
  <div
    className="absolute top-3 right-3 cursor-pointer z-10"
    onClick={() => setShowEditPopover(true)}
    title="Click to edit or copy contract address"
  >
    <span
  className={`border-2 border-black text-black font-mono px-3 py-1 rounded-md shadow nb-transition text-xs select-all
    ${manualCollection || collectionInfo?.spgNftContract ? 'bg-yellow-300' : 'bg-red-400'}
  `}
>
  {shortenAddress(manualCollection || collectionInfo?.spgNftContract || "")}
</span>
  </div>
  {/* Popover */}
  {showEditPopover && (
    <div className="absolute top-12 right-3 bg-white border-2 border-black rounded-lg shadow-lg z-50 p-4 w-72 flex flex-col gap-2">
      <label className="font-bold text-sm mb-1">NFT Collection Address</label>
      {/* <input
        className="nb-input w-full font-mono px-2 py-1 text-xs"
        value={manualCollection || collectionInfo?.spgNftContract || ""}
        onChange={e => setManualCollection(e.target.value)}
        placeholder="0x..."
        autoFocus
        spellCheck={false}
      /> */}
     <input
  className="nb-input w-full font-mono px-2 py-1 text-xs"
  value={manualCollection || collectionInfo?.spgNftContract || ""}
  maxLength={42}
  spellCheck={false}
  placeholder="0x..."
  onChange={e => {
    let val = e.target.value;
    if (!val) {
      setManualCollection("");
      return;
    }
    if (!val.startsWith("0x")) {
      if (/^[a-fA-F0-9]{40}$/.test(val)) {
        val = "0x" + val;
      } else {
        return;
      }
    }
    let hex = val.slice(2).replace(/[^a-fA-F0-9]/g, "");
    hex = hex.slice(0, 40);
    setManualCollection("0x" + hex);
  }}
  onPaste={e => {
    let pasted = e.clipboardData.getData('text').trim();
    if (!pasted.startsWith("0x")) {
      if (/^[a-fA-F0-9]{40}$/.test(pasted)) {
        pasted = "0x" + pasted;
      } else {
        e.preventDefault();
        return;
      }
    }
    let hex = pasted.slice(2).replace(/[^a-fA-F0-9]/g, "");
    hex = hex.slice(0, 40);
    setManualCollection("0x" + hex);
    e.preventDefault();
  }}
/>

      <div className="flex gap-2 justify-end mt-2">
        <button
          className="nb-button px-3 py-1 text-xs"
          onClick={() => setShowEditPopover(false)}
        >
          Close
        </button>
      </div>
      <div className="flex flex-col gap-1 text-xs text-gray-700 bg-gray-50 border border-gray-300 rounded px-2 py-1">
  <div className="flex items-center gap-2">
    <span className="break-all font-mono flex-1">
      Full Address : {manualCollection || collectionInfo?.spgNftContract || ""}
    </span>
    <button
      className="px-2 py-0.5 border border-gray-400 rounded bg-white hover:bg-yellow-100 active:bg-yellow-200 transition-colors text-xs"
      onClick={() => {
        void navigator.clipboard.writeText(manualCollection || collectionInfo?.spgNftContract || "");
      }}
      style={{ flexShrink: 0 }}
    >
      Copy
    </button>
  </div>
</div>
    </div>
  )}
            <RegisterOnStoryProtocolPanel
              agentData={agentData}
              spgNftContract={collectionInfo?.spgNftContract || manualCollection}
              onRegistered={e => { void handleRegistered(e); }}
            />
         </div>
          </>
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
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
