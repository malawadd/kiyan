import { useAccount, useBalance } from 'wagmi';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';

export function WalletStatusPanel() {
  const { address, isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: balance } = useBalance({
    address: address,
  });

  if (!isConnected) {
    return (
      <div className="nb-panel-accent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🔗 Web3 Wallet Connection</h3>
            <p className="font-medium">Connect your wallet to start trading with blockchain assets</p>
          </div>
          <button 
            onClick={openConnectModal}
            className="nb-button-accent px-6 py-3 text-lg"
          >
            🔗 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatBalance = (bal: any) => {
    if (!bal) return '0.0000';
    return parseFloat(bal.formatted).toFixed(4);
  };

  return (
    <div className="nb-panel-success p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-4">✅ Wallet Connected</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="nb-panel-white p-3">
              <p className="text-sm font-bold mb-1">ADDRESS</p>
              <p className="font-mono text-lg">{formatAddress(address!)}</p>
            </div>
            <div className="nb-panel-white p-3">
              <p className="text-sm font-bold mb-1">NETWORK</p>
              <p className="text-lg font-bold">{chain?.name || 'Unknown'}</p>
            </div>
            <div className="nb-panel-white p-3">
              <p className="text-sm font-bold mb-1">BALANCE</p>
              <p className="text-lg font-bold">{formatBalance(balance)} {balance?.symbol || 'ETH'}</p>
            </div>
          </div>
        </div>
        <div className="text-6xl ml-6">
          🚀
        </div>
      </div>
    </div>
  );
}
