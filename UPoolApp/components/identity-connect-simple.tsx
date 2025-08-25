"use client"

import React, { useState, useEffect } from 'react'
import { IdentityCard } from '@coinbase/onchainkit/identity'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/components/providers/wallet-provider-simple'
import { Wallet } from 'lucide-react'
import { base, baseSepolia } from 'viem/chains'

interface IdentityConnectProps {
  size?: 'sm' | 'lg' | 'default'
}

export function IdentityConnect({ size = 'default' }: IdentityConnectProps) {
  const [clientMounted, setClientMounted] = useState(false)
  
  // Client-side mounting check
  useEffect(() => {
    setClientMounted(true)
  }, [])

  // Always call hooks in the same order
  const wallet = useWallet()
  const { address, isConnected, connect, disconnect, isConnecting, isFarcaster } = wallet

  console.log('🔧 DEBUG: IdentityConnect wallet state:', {
    clientMounted,
    address,
    isConnected,
    isConnecting,
    isFarcaster
  })

  // Show loading during hydration
  if (!clientMounted) {
    return (
      <Button size={size} variant="outline" disabled>
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline ml-2">Loading...</span>
      </Button>
    )
  }

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <Button 
        onClick={connect}
        disabled={isConnecting}
        size={size}
        variant="default"
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 py-[9px] px-4 rounded-lg"
      >
        <Wallet className="w-6 h-6" />
        <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Join'}</span>
        <span className="sm:hidden">{isConnecting ? '...' : 'Connect'}</span>
      </Button>
    )
  }

  // If connected but no address, show basic connected state
  if (!address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm">Connected</span>
      </div>
    )
  }

  // For Ethereum addresses, use OnchainKit Identity
  return (
    <div className="relative">
      <div className="flex items-center space-x-2 p-2">
        <IdentityCard
          address={address as `0x${string}`}
          chain={baseSepolia}
          schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
        />
      </div>

    </div>
  )
}