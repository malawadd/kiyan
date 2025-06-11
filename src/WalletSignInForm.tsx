import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { useAuth } from './WalletAuthProvider';

export function WalletSignInForm() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signInWithWallet, signInAsGuest, isLoading } = useAuth();

  const handleWalletSignIn = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    setIsSigningIn(true);
    setError(null);
    
    try {
      await signInWithWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with wallet');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="min-h-screen nb-grid-bg flex items-center justify-center p-4">
      <div className="nb-panel-white p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🤖 TradingBot Pro</h1>
          <p className="text-lg font-medium">
            Connect your wallet to start trading with AI agents
          </p>
        </div>

        <div className="space-y-4">
          {/* Wallet Connection Status */}
          {isConnected && address && (
            <div className="nb-panel-success p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">WALLET CONNECTED</p>
                  <p className="font-mono text-lg">{formatAddress(address)}</p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          )}

          {/* Sign In with Wallet */}
          <button
            onClick={handleWalletSignIn}
            disabled={isSigningIn || isLoading}
            className="w-full nb-button-accent p-4 text-lg font-bold"
          >
            {!isConnected ? (
              <>🔗 Connect Wallet</>
            ) : isSigningIn || isLoading ? (
              <>⏳ Signing Message...</>
            ) : (
              <>🔐 Sign Message to Continue</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t-4 border-black"></div>
            <span className="px-4 font-bold">OR</span>
            <div className="flex-1 border-t-4 border-black"></div>
          </div>

          {/* Guest Mode */}
          <button
            onClick={handleGuestSignIn}
            className="w-full nb-button p-4 text-lg font-bold"
          >
            👤 Continue as Guest
          </button>

          {/* Error Display */}
          {error && (
            <div className="nb-panel-warning p-4 mt-4">
              <p className="font-bold text-sm mb-1">⚠️ ERROR</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="nb-panel p-4 mt-6">
            <p className="text-sm font-medium">
              <strong>Wallet Mode:</strong> Full access to trading features with blockchain integration
            </p>
            <p className="text-sm font-medium mt-2">
              <strong>Guest Mode:</strong> Demo mode with simulated data only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
