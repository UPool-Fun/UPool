'use client'

import React, { useState, useEffect } from 'react'
import { IdentityCard } from '@coinbase/onchainkit/identity'
import { Button } from '@/components/ui/button'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { detectEnvironment } from '@/lib/utils/environment-detection'
import { Wallet, LogOut } from 'lucide-react'
import { base, baseSepolia } from 'viem/chains'

interface DualConnectProps {
  size?: 'sm' | 'lg' | 'default'
}

export function DualConnect({ size = 'default' }: DualConnectProps) {
  const [clientMounted, setClientMounted] = useState(false)
  const [environment, setEnvironment] = useState<'browser' | 'farcaster-web' | 'farcaster-mobile'>('browser')
  const [autoConnecting, setAutoConnecting] = useState(false)
  
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  // Client-side mounting and environment detection
  useEffect(() => {
    setClientMounted(true)
    const env = detectEnvironment()
    setEnvironment(env)
  }, [])

  // Auto-connection for Farcaster environments (based on exampleApp2)
  useEffect(() => {
    if (clientMounted && !isConnected && !autoConnecting && connectors.length > 0) {
      const isFarcaster = environment === 'farcaster-web' || environment === 'farcaster-mobile'
      
      if (isFarcaster) {
        console.log('🎯 Farcaster environment detected - checking for auto-connection')
        const farcasterConnector = connectors.find(c => 
          c.name.toLowerCase().includes('farcaster') || 
          c.name.toLowerCase().includes('miniapp') ||
          c.id === 'farcaster'
        )
        
        if (farcasterConnector) {
          console.log('✅ Farcaster connector found - auto-connecting:', farcasterConnector.name)
          setAutoConnecting(true)
          
          // Auto-connect with small delay to ensure connector is ready
          setTimeout(() => {
            connect({ connector: farcasterConnector })
              .then(() => {
                console.log('✅ Auto-connection successful in Farcaster environment')
              })
              .catch((error) => {
                console.warn('⚠️ Auto-connection failed (may already be connected):', error.message)
              })
              .finally(() => {
                setAutoConnecting(false)
              })
          }, 500)
        } else {
          console.log('🔍 Available connectors in Farcaster environment:', 
            connectors.map(c => ({ id: c.id, name: c.name })))
        }
      }
    }
  }, [clientMounted, isConnected, autoConnecting, connectors, environment, connect])

  console.log('🔧 DEBUG: DualConnect wallet state:', {
    clientMounted,
    address,
    isConnected,
    isPending,
    autoConnecting,
    environment,
    availableConnectors: connectors.map(c => ({ id: c.id, name: c.name })),
    farcasterConnectorAvailable: connectors.some(c => 
      c.name.toLowerCase().includes('farcaster') || 
      c.name.toLowerCase().includes('miniapp') ||
      c.id === 'farcaster'
    ),
    // Enhanced auto-connection debugging
    autoConnectionEligible: clientMounted && !isConnected && !autoConnecting && connectors.length > 0,
    isFarcasterEnvironment: environment === 'farcaster-web' || environment === 'farcaster-mobile',
    shouldAutoConnect: (environment === 'farcaster-web' || environment === 'farcaster-mobile') && 
                       clientMounted && !isConnected && !autoConnecting && connectors.length > 0,
    preferredFarcasterConnector: connectors.find(c => 
      c.name.toLowerCase().includes('farcaster') || 
      c.name.toLowerCase().includes('miniapp') ||
      c.id === 'farcaster'
    )?.name || 'none'
  })

  // Show loading during hydration or auto-connection
  if (!clientMounted) {
    return (
      <Button size={size} variant="outline" disabled>
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline ml-2">Loading...</span>
      </Button>
    )
  }

  // Show auto-connecting state for Farcaster
  if (autoConnecting) {
    const isFarcaster = environment === 'farcaster-web' || environment === 'farcaster-mobile'
    return (
      <Button size={size} variant="outline" disabled>
        <Wallet className="w-4 h-4 animate-pulse" />
        <span className="hidden sm:inline ml-2">
          {isFarcaster ? 'Connecting wallet...' : 'Connecting...'}
        </span>
      </Button>
    )
  }

  // If not connected, show connect button
  if (!isConnected) {
    const isFarcaster = environment === 'farcaster-web' || environment === 'farcaster-mobile'
    const preferredConnector = isFarcaster 
      ? connectors.find(c => c.name.includes('Farcaster') || c.name.includes('MiniApp')) || connectors[0]
      : connectors[0]

    return (
      <Button 
        onClick={() => connect({ connector: preferredConnector })}
        disabled={isPending}
        size={size}
        variant="default"
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 py-[9px] px-4 rounded-lg"
      >
        <Wallet className="w-6 h-6" />
        {isFarcaster ? (
          <>
            <span className="hidden sm:inline">{isPending ? 'Joining...' : 'Join'}</span>
            <span className="sm:hidden">{isPending ? '...' : 'Join'}</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">{isPending ? 'Connecting...' : 'Connect'}</span>
            <span className="sm:hidden">{isPending ? '...' : 'Login'}</span>
          </>
        )}
      </Button>
    )
  }

  // If connected but no address (shouldn't happen with new system), show loading
  if (!address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm">Getting address...</span>
      </div>
    )
  }

  // For Ethereum addresses, use OnchainKit Identity
  if (address.startsWith('0x')) {
    return (
      <div className="relative">
        <div className="flex items-center space-x-2 p-2">
          <IdentityCard
            address={address as `0x${string}`}
            chain={baseSepolia}
            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
          />
          <Button
            onClick={disconnect}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            title="Disconnect wallet"
          >
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  // Fallback for unknown address format
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm">{address.slice(0, 10)}...</span>
      <Button
        onClick={disconnect}
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
      >
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  )
}