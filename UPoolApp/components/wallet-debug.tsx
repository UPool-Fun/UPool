"use client"

import { useState, useEffect } from 'react'
import { useWallet } from '@/components/providers/wallet-provider-simple'

export function WalletDebug() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-4 bg-yellow-100 rounded">⏳ Component mounting...</div>
  }

  try {
    const wallet = useWallet()
    return (
      <div className="p-4 bg-green-100 rounded">
        <h3 className="font-bold">✅ Wallet Context Available</h3>
        <pre className="text-xs mt-2 bg-white p-2 rounded">
          {JSON.stringify({
            isConnected: wallet.isConnected,
            address: wallet.address,
            isConnecting: wallet.isConnecting,
            isFarcaster: wallet.isFarcaster,
            connectFn: typeof wallet.connect,
            disconnectFn: typeof wallet.disconnect
          }, null, 2)}
        </pre>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-4 bg-red-100 rounded">
        <h3 className="font-bold">❌ Wallet Context Error</h3>
        <p className="text-sm mt-2">{String(error)}</p>
      </div>
    )
  }
}