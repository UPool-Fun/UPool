'use client'

import React, { useState, useEffect } from 'react'
import { IdentityCard } from '@coinbase/onchainkit/identity'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/components/providers/dual-wallet-provider'
import { Wallet, LogOut } from 'lucide-react'
import { base, baseSepolia } from 'viem/chains'

interface DualConnectProps {
  size?: 'sm' | 'lg' | 'default'
}

export function DualConnect({ size = 'default' }: DualConnectProps) {
  const [clientMounted, setClientMounted] = useState(false)
  
  // Client-side mounting check
  useEffect(() => {
    setClientMounted(true)
  }, [])

  // Always call hooks in the same order
  const wallet = useWallet()
  const { address, isConnected, connect, disconnect, isConnecting, isFarcaster, environmentReady } = wallet

  console.log('🔧 DEBUG: DualConnect wallet state:', {
    clientMounted,
    address,
    isConnected,
    isConnecting,
    isFarcaster,
    environmentReady
  })

  // Show loading during hydration or environment detection
  if (!clientMounted || !environmentReady) {
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
        {isFarcaster ? (
          <>
            <span className="hidden sm:inline">{isConnecting ? 'Joining...' : 'Join'}</span>
            <span className="sm:hidden">{isConnecting ? '...' : 'Join'}</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect'}</span>
            <span className="sm:hidden">{isConnecting ? '...' : 'Login'}</span>
          </>
        )}
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

  // For Farcaster addresses (farcaster:12345 format), show FID
  if (isFarcaster && address.startsWith('farcaster:')) {
    const fid = address.replace('farcaster:', '')
    return (
      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">FC</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">FID {fid}</span>
          <span className="text-xs text-blue-600">Farcaster User</span>
        </div>
        {/* Try again button to attempt getting wallet address */}
        <Button
          onClick={connect}
          size="sm"
          variant="outline"
          className="text-xs px-2 py-1 h-6 border-blue-300 text-blue-600 hover:bg-blue-100"
          disabled={isConnecting}
          title="Try to get wallet address for blockchain features"
        >
          {isConnecting ? '...' : 'Get Wallet'}
        </Button>
        <Button
          onClick={disconnect}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          title="Disconnect"
        >
          ×
        </Button>
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