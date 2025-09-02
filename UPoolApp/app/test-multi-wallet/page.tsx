'use client'

import { WalletTestComponent } from '@/components/wallet-test-component'

export default function TestMultiWalletPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          🎯 UPool Multi-Environment Wallet Testing
        </h1>
        <p className="text-gray-600">
          Test the enhanced wallet system based on exampleApp patterns. 
          This page demonstrates how UPool works across browser, Farcaster web, and Farcaster mobile environments.
        </p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🧪 Test Environments:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li><strong>Browser:</strong> Base Account + WalletConnect + Injected wallets</li>
            <li><strong>Farcaster Web:</strong> Pre-connected wallet with Farcaster SDK integration</li>
            <li><strong>Farcaster Mobile:</strong> Native mobile wallet with optimized UI</li>
          </ul>
        </div>
      </div>
      
      <WalletTestComponent />
    </div>
  )
}