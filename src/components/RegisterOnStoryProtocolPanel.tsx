/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { custom, toHex, zeroAddress, parseEther } from "viem";

// PIL contract addresses
const ROYALTY_POLICY = "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E";
const CURRENCY = "0x1514000000000000000000000000000000000000";
const SPG_NFT_CONTRACT = "0x0b1Ebf81A0fBA5E931Da315bA8036Aef39865a02"; // example, use correct address if needed

// These are the four available PIL "flavors"
const PIL_FLAVORS = [
  {
    name: "Non-Commercial Social Remixing",
    description:
      "Anyone can remix and share, but cannot commercialize. Attribution required.",
    terms: {
      transferable: true,
      royaltyPolicy: zeroAddress,
      defaultMintingFee: 0n,
      expiration: 0n,
      commercialUse: false,
      commercialAttribution: false,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      currency: zeroAddress,
      uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
    },
  },
  {
    name: "Commercial Use",
    description:
      "Others may commercialize, but not remix. Attribution required. Minting fee applies.",
    terms: {
      transferable: true,
      royaltyPolicy: ROYALTY_POLICY,
      defaultMintingFee: parseEther("0.1"), // 0.1 $WIP (example)
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: false,
      derivativesAttribution: false,
      derivativesApproval: false,
      derivativesReciprocal: false,
      derivativeRevCeiling: 0n,
      currency: CURRENCY,
      uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
    },
  },
  {
    name: "Commercial Remix",
    description:
      "Remixing and commercialization allowed, but 5% revenue share with you. Attribution required.",
    terms: {
      transferable: true,
      royaltyPolicy: ROYALTY_POLICY,
      defaultMintingFee: parseEther("0.05"), // 0.05 $WIP
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 5, // 5% (basis points)
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      currency: CURRENCY,
      uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
    },
  },
  {
    name: "Creative Commons Attribution",
    description:
      "Anyone can remix, share, commercialize, and keep all revenue. Attribution required.",
    terms: {
      transferable: true,
      royaltyPolicy: ROYALTY_POLICY,
      defaultMintingFee: 0n,
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      currency: CURRENCY,
      uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
    },
  },
];

export default function RegisterOnStoryProtocolPanel({ agentData, spgNftContract, onRegistered }: {
  agentData?: any;
  spgNftContract: string; //
  onRegistered?: (result: { ipId: `0x${string}`; txHash: `0x${string}` }) => void;
}) {
  const { data: wallet } = useWalletClient();
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ipId: `0x${string}`; txHash: `0x${string}` } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For demo, these can be replaced with actual metadata from agentData if needed
  const [metadataURI, setMetadataURI] = useState("");
  const [nftImageURI, setNftImageURI] = useState("");

  // Helper to set up StoryClient
  async function setupStoryClient(): Promise<StoryClient> {
    if (!wallet) throw new Error("Wallet not connected");
    const config: StoryConfig = {
      wallet: wallet,
      transport: custom(wallet.transport),
      chainId: "aeneid", // Or "story" if mainnet
    };
    return StoryClient.newClient(config);
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      const client = await setupStoryClient();
      // Use metadata if provided, else placeholder
      const ipMetadata = {
        ipMetadataURI: metadataURI || "ip-metadata-uri",
        ipMetadataHash: toHex("demo-metadata-hash", { size: 32 }),
        nftMetadataURI: nftImageURI || "nft-image-uri",
        nftMetadataHash: toHex("demo-nft-metadata-hash", { size: 32 }),
      };
      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        //@ts-ignore
        spgNftContract: spgNftContract,
        //@ts-ignore
        licenseTermsData: [{ terms: PIL_FLAVORS[selected].terms }],
        ipMetadata,
      });

      //@ts-ignore
      setResult({ ipId: response.ipId, txHash: response.txHash });
      //@ts-ignore
      if (onRegistered) onRegistered({ ipId: response.ipId, txHash: response.txHash });
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nb-panel p-6 mt-6">
      <h2 className="text-xl font-bold mb-3">Step 2: Register as IP on Story Protocol</h2>
      <div className="grid gap-4 mb-6">
        {PIL_FLAVORS.map((flavor, idx) => (
          <label
            key={flavor.name}
            className={`nb-panel-white border-2 px-4 py-3 cursor-pointer flex items-center space-x-4 rounded-2xl shadow-sm transition ${selected === idx ? "border-black ring-4 ring-accent" : "border-gray-300"}`}
            onClick={() => setSelected(idx)}
          >
            <input
              type="radio"
              checked={selected === idx}
              onChange={() => setSelected(idx)}
              className="form-radio accent-green-500"
            />
            <div>
              <div className="font-bold">{flavor.name}</div>
              <div className="text-sm text-gray-600">{flavor.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Optional: let user set custom URIs */}
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">IP Metadata URI (optional)</label>
        <input
          value={metadataURI}
          onChange={(e) => setMetadataURI(e.target.value)}
          className="nb-input w-full px-3 py-2 mb-1"
          placeholder="e.g. https://example.com/ip.json"
        />
        <label className="block text-sm font-bold mb-1 mt-3">NFT Image URI (optional)</label>
        <input
          value={nftImageURI}
          onChange={(e) => setNftImageURI(e.target.value)}
          className="nb-input w-full px-3 py-2"
          placeholder="e.g. https://example.com/nft.png"
        />
      </div>
       
      <button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleRegister}
        disabled={loading}
        className="nb-button-accent w-full py-3 text-lg font-bold mt-2"
      >
        {loading ? "Registering..." : "Register on Story Protocol"}
      </button>

      {result && (
        <div className="nb-panel-success p-4 mt-4 rounded-xl border-2 border-black">
          <div className="font-bold mb-2">Registered successfully!</div>
          <div><b>IP ID:</b> <span className="font-mono">{result.ipId}</span></div>
          <div><b>Tx Hash:</b> <span className="font-mono">{result.txHash}</span></div>
        </div>
      )}

      {error && (
        <div className="nb-panel-warning p-4 mt-3 rounded-xl border-2 border-red-500">
          <span className="font-bold text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
