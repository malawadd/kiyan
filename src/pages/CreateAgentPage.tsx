import React, { useState } from 'react';
import { useNavigate , Link} from 'react-router-dom';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../WalletAuthProvider';
import { Id } from "../../convex/_generated/dataModel";
import { WalletConnection } from "../WalletConnection";


// Example PIL templates
const PIL_TEMPLATES = [
  {
    name: "Non-Commercial Social",
    description: "Free remixing with attribution. No commercialization.",
    terms: {
      defaultMintingFee: 0n,
      currency: "0x1514000000000000000000000000000000000000",
      royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      transferable: true,
      expiration: 0n,
      commercialUse: false,
      commercialAttribution: true,
      commercialRevShare: 0,
    }
  },
  {
    name: "Commercial Use",
    description: "Pay to use with attribution, no revenue share.",
    terms: {
      defaultMintingFee: 100000000000000000n, // 0.1 ETH
      currency: "0x1514000000000000000000000000000000000000",
      royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      transferable: true,
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,  
      commercialRevShare: 0,
    }
  },
  {
    name: "Commercial Remix",
    description: "Pay to use + 5% revenue share.",
    terms: {
      defaultMintingFee: 50000000000000000n, // 0.05 ETH
      currency: "0x1514000000000000000000000000000000000000",
      royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      transferable: true,
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercialRevShare: 500, // 5%
    }
  }
];

export function CreateAgentPage() {
  const navigate = useNavigate();
  const { user, isGuest, signOut, sessionId } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [fleekId, setFleekId] = useState('');
  const [fleekKey, setFleekKey] = useState('');
  const [agentId, setAgentId] = useState<Id<"agents"> | null>(null);

  // Step 2 state
  const [selectedPIL, setSelectedPIL] = useState<number>(0);
  const [sellShares, setSellShares] = useState(false);
  const [shareAmount, setShareAmount] = useState(10);
  const [sharePrice, setSharePrice] = useState(0.1);

  // Convex mutations
  const importAgent = useAction(api.fleekAgents.importAgent);
  const saveStoryInfo = useMutation(api.fleekAgents.saveStoryInfo);
  const sellTokens = useMutation(api.fleekAgents.sellTokens);
  
  

  const handleImport = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!sessionId) throw new Error("Not authenticated");
      
      const id = await importAgent({
        sessionId,
        fleekId,
        fleekKey
      });
      
      setAgentId(id);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!sessionId || !agentId) throw new Error("Missing session or agent");

      // Mock Story Protocol registration for demo
      const mockIpId = `0x${Math.random().toString(16).substr(2, 40)}`;
      const mockVault = `0x${Math.random().toString(16).substr(2, 40)}`;

      await saveStoryInfo({
        sessionId,
        agentId,
        ipId: mockIpId,
        vault: mockVault
      });

      if (sellShares) {
        await sellTokens({
          sessionId,
          agentId,
          amount: shareAmount,
          priceWei: (sharePrice * 1e18).toString()
        });
      }

      navigate(`/agent/${agentId}`);
    } catch (err: any) {
      setError(err.message);
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
                        <Link to="/create-agent" className="font-bold text-black  hover:underline">
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

        {step === 1 ? (
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
                onClick={(e) => void handleImport(e)}
                disabled={!fleekId || !fleekKey}
                className="nb-button-accent w-full py-3"
              >
                Import Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="nb-panel p-6">
            <h2 className="text-xl font-bold mb-4">Step 2: Register on Story Protocol</h2>
            
            <div className="space-y-6">
              {/* PIL Templates */}
              <div>
                <label className="block text-sm font-bold mb-2">Choose License Template</label>
                <div className="space-y-3">
                  {PIL_TEMPLATES.map((template, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedPIL(index)}
                      className={`nb-panel-white p-4 cursor-pointer ${
                        selectedPIL === index ? 'border-accent' : ''
                      }`}
                    >
                      <h3 className="font-bold">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Sale Configuration */}
              <div className="nb-panel-white p-4">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={sellShares}
                    onChange={(e) => setSellShares(e.target.checked)}
                    className="nb-input mr-2"
                  />
                  <span className="font-bold">Enable Share Sale</span>
                </label>

                {sellShares && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Share Amount (%)</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={shareAmount}
                        onChange={(e) => setShareAmount(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm font-bold">{shareAmount}%</span>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Price per Share (ETH)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sharePrice}
                        onChange={(e) => setSharePrice(Number(e.target.value))}
                        className="nb-input w-full px-4 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => void handleRegister(e)}
                className="nb-button-accent w-full py-3"
              >
                Register & {sellShares ? 'List Shares' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="nb-panel-warning p-4">
            <p className="text-sm font-bold">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}