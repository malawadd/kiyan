/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from "react";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { custom, zeroAddress } from "viem";

// Helper to safely access agentData fields
//@ts-ignore
function getAgentField(agentData, fallback = "") {
  return agentData && typeof agentData === "object" ? agentData.name || fallback : fallback;
}

export default function CreateNftCollectionPanel({
  agentData,
  onCreated,
}: {
  agentData: any;
  onCreated: (result: { spgNftContract: string; txHash: string; collectionName: string }) => void;
}) {
  const { data: wallet } = useWalletClient();

  // Autofill from agentData (customize as needed)
  const [name, setName] = useState(
    getAgentField(agentData, "My NFT Collection")
  );
  const [symbol, setSymbol] = useState(
    agentData && agentData.name
      ? agentData.name.substring(0, 4).toUpperCase()
      : "NFTS"
  );
  const [contractURI, setContractURI] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateCollection() {
    setCreating(true);
    setError(null);
    try {
      if (!wallet) throw new Error("Wallet not connected");

      const config: StoryConfig = {
        wallet: wallet,
        transport: custom(wallet.transport),
        chainId: "aeneid", // Use "story" for mainnet
      };
      const client = StoryClient.newClient(config);

      // You can also upload metadata to IPFS here and use its URI as contractURI
      const newCollection = await client.nftClient.createNFTCollection({
        name,
        symbol,
        isPublicMinting: false,
        mintOpen: true,
        mintFeeRecipient: zeroAddress,
        contractURI,
      });

      onCreated({
        //@ts-ignore
        spgNftContract: newCollection.spgNftContract,
        //@ts-ignore
        txHash: newCollection.txHash,
        collectionName: name,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create NFT collection");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="nb-panel p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Step 2: Create NFT Collection for Agent</h2>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">Collection Name</label>
        <input
          className="nb-input w-full px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection Name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">Symbol</label>
        <input
          className="nb-input w-full px-3 py-2"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="SYMB"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">Contract Metadata URI (optional)</label>
        <input
          className="nb-input w-full px-3 py-2"
          value={contractURI}
          onChange={(e) => setContractURI(e.target.value)}
          placeholder="e.g. https://ipfs.io/ipfs/..."
        />
      </div>
      <button
        className="nb-button-accent w-full py-3 text-lg font-bold mt-2"
        onClick={handleCreateCollection}
        disabled={creating}
      >
        {creating ? "Creating..." : "Create NFT Collection"}
      </button>
      {error && (
        <div className="nb-panel-warning p-4 mt-4 rounded-xl border-2 border-red-500">
          <span className="font-bold text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
