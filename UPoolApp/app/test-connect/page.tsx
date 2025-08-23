"use client"

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'

export default function TestConnectPage() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setConnecting(true)
      console.log('🔌 Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })))
      
      // Try Base Account first
      const baseConnector = connectors.find(c => c.id === 'baseAccount')
      if (baseConnector) {
        console.log('🎯 Using Base Account connector')
        connect({ connector: baseConnector })
      } else {
        console.log('⚠️ Base Account not found, using first available')
        if (connectors.length > 0) {
          connect({ connector: connectors[0] })
        }
      }
    } catch (error) {
      console.error('❌ Connection error:', error)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 Direct Wagmi Connection Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Connection Status:</h2>
        <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
        <p>Address: {address || 'None'}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Available Connectors:</h2>
        <ul className="text-sm">
          {connectors.map(connector => (
            <li key={connector.id} className="mb-1">
              {connector.id} - {connector.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-x-4">
        {!isConnected ? (
          <Button 
            onClick={handleConnect}
            disabled={connecting}
            className="bg-blue-600 text-white"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <Button 
            onClick={() => disconnect()}
            variant="outline"
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  )
}