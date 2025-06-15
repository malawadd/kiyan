import React, { useState } from "react";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { custom } from "viem";

interface MintLicenseTokensPanelProps {
  ipId: string;
  licenseTermsId: string;
  vault: string;
}

const PIL_TEMPLATE_ADDRESS = "0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316";

export const MintLicenseTokensPanel: React.FC<MintLicenseTokensPanelProps> = ({ ipId, licenseTermsId, vault }) => {
  const { data: wallet } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [amount, setAmount] = useState('1');

  async function setupStoryClient(): Promise<StoryClient> {
    if (!wallet) throw new Error("Wallet not connected");
    const config: StoryConfig = {
      wallet: wallet,
      transport: custom(wallet.transport),
      chainId: "aeneid",
    };
    return StoryClient.newClient(config);
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const client = await setupStoryClient();
   
      const tx = await client.license.mintLicenseTokens({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
        licensorIpId: ipId,
        licenseTemplate: PIL_TEMPLATE_ADDRESS,
        licenseTermsId: licenseTermsId,
        maxMintingFee: BigInt(0), // disabled
          maxRevenueShare: 100, // default
        amount: BigInt(amount),
      });
      const txUrl = `https://aeneid.storyscan.io/tx/${tx.txHash}`;
      setSuccess(`${tx.txHash}`);
    } catch (err: any) {
      setError(err.message || 'Failed to mint license tokens');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nb-panel-accent p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Mint License Tokens</h2>
      
      <form onSubmit={handleMint} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Amount</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="nb-input w-full px-4 py-2"
            required
          />
        </div>
        {error && <div className="nb-panel-warning p-2 text-red-700 font-bold">{error}</div>}
        {success && <div className="nb-panel-success p-2 text-green-700 font-bold">
            Minted {amount} license token(s)!&nbsp;
      <a
        href={`https://aeneid.storyscan.io/tx/${success}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-600 hover:text-blue-800"
      >
        View Transaction
      </a>
            </div>}
        <button
          type="submit"
          disabled={isLoading}
          className="nb-button-accent w-full py-2 font-bold"
        >
          {isLoading ? 'Minting...' : 'Mint License Tokens'}
        </button>
      </form>
    </div>
  );
};
