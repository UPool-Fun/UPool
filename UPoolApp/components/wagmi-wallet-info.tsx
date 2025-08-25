'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useWallet } from '@/components/providers/dual-wallet-provider'

/**
 * Component that shows both Wagmi and our dual wallet state
 * Useful for debugging and ensuring both systems see the same wallet
 */
export function WagmiWalletInfo() {
  const { address: wagmiAddress, isConnected: wagmiConnected, chain } = useAccount()
  const { address: dualAddress, isConnected: dualConnected, isFarcaster } = useWallet()
  const { disconnect } = useDisconnect()

  return (
    <div className="p-4 bg-gray-50 rounded-lg text-xs space-y-2">
      <h3 className="font-semibold">Wallet State Debug</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Wagmi State:</strong>
          <pre className="bg-white p-2 rounded mt-1">
            {JSON.stringify({
              address: wagmiAddress,
              isConnected: wagmiConnected,
              chain: chain?.name,
              chainId: chain?.id
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Dual Wallet State:</strong>
          <pre className="bg-white p-2 rounded mt-1">
            {JSON.stringify({
              address: dualAddress,
              isConnected: dualConnected,
              isFarcaster
            }, null, 2)}
          </pre>
        </div>
      </div>

      {wagmiConnected && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => disconnect()}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Disconnect Wagmi
          </button>
        </div>
      )}
    </div>
  )
}