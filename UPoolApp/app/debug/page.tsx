"use client"

import { useWallet } from "@/components/providers/wallet-provider"
import { DynamicWidget } from "@dynamic-labs/sdk-react-core"

export default function DebugPage() {
  try {
    const wallet = useWallet()
    
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">Wallet Debug Page</h1>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Wallet State:</h2>
          <pre>{JSON.stringify(wallet, null, 2)}</pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold">Environment Variables:</h2>
          <pre>{JSON.stringify({
            DYNAMIC_ENV_ID: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID,
            CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
            RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
            NETWORK: process.env.NEXT_PUBLIC_NETWORK,
            MAINNET_CHAIN_ID: process.env.NEXT_PUBLIC_MAINNET_CHAIN_ID,
          }, null, 2)}</pre>
        </div>
        
        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold">Direct Dynamic Widget:</h2>
          <DynamicWidget />
        </div>
        
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold">Browser Info:</h2>
          <pre>{JSON.stringify({
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
            href: typeof window !== 'undefined' ? window.location.href : 'SSR',
            parent: typeof window !== 'undefined' ? window.parent === window : 'SSR',
          }, null, 2)}</pre>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <pre className="bg-red-50 p-4 rounded mt-4">{error.toString()}</pre>
      </div>
    )
  }
}