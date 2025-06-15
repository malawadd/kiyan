import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

export function WalletBalance() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address: address,
  });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Balance</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Available to Allocate</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              'Loading...'
            ) : balance ? (
              `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
            ) : (
              '0 IP'
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Wallet Address</p>
          <p className="text-sm font-mono text-gray-700">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
