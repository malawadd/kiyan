import { useConnectModal, useAccountModal, useChainModal } from '@tomo-inc/tomo-evm-kit';
import { useAccount, useDisconnect } from 'wagmi';

export function WalletConnection() {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <button 
        onClick={openConnectModal}
        className="nb-button-accent px-4 py-2 text-sm font-bold"
      >
        🔗 Connect Wallet
      </button>
    );
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Chain Selector */}
      <button 
        onClick={openChainModal}
        className="nb-panel px-3 py-2 text-xs font-bold"
      >
        {chain?.name || 'Unknown'}
      </button>
      
      {/* Wallet Address */}
      <button 
        onClick={openAccountModal}
        className="nb-panel-success px-3 py-2 text-sm font-bold"
      >
        💰 {formatAddress(address!)}
      </button>
      
      {/* Disconnect Button */}
      <button 
        onClick={() => disconnect()}
        className="nb-button px-3 py-2 text-xs font-bold"
      >
        ❌
      </button>
    </div>
  );
}
