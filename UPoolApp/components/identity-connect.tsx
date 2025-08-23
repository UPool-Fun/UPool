"use client"

import React, { useState, useEffect } from 'react'
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/components/providers/wallet-provider-simple'
import { User, LogOut, Wallet, CreditCard } from 'lucide-react'

interface IdentityConnectProps {
  size?: 'sm' | 'md' | 'lg'
}

export function IdentityConnect({ size = 'md' }: IdentityConnectProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [clientMounted, setClientMounted] = useState(false)
  
  // Client-side mounting check
  useEffect(() => {
    setClientMounted(true)
  }, [])

  // Safe wallet context usage with SSR protection
  let address: string | undefined
  let isConnected = false
  let connect = () => {}
  let disconnect = () => {}
  let isConnecting = false
  let isFarcaster = false

  try {
    if (clientMounted) {
      const walletContext = useWallet()
      address = walletContext.address
      isConnected = walletContext.isConnected
      connect = walletContext.connect
      disconnect = walletContext.disconnect
      isConnecting = walletContext.isConnecting
      isFarcaster = walletContext.isFarcaster
      
      console.log('🔧 DEBUG: IdentityConnect wallet state:', {
        clientMounted,
        address,
        isConnected,
        isConnecting,
        isFarcaster
      })
    }
  } catch (error) {
    // Handle SSR or provider not available
    console.log('IdentityConnect: Wallet provider not available during SSR', error)
  }

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
        className="flex items-center space-x-2"
      >
        {isFarcaster ? (
          <>
            <User className="w-4 h-4" />
            <span>{isConnecting ? 'Joining...' : 'Join'}</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
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

  // Special handling for Farcaster identity addresses (fid:xxx format)
  if (address.startsWith('farcaster:') || address.startsWith('fid:')) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowDetails(!showDetails)}
          size={size}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <User className="w-4 h-4 text-purple-600" />
          <span>{address.split(':')[1]?.slice(0, 6)}...</span>
        </Button>

        {showDetails && (
          <>
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Farcaster Identity</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-purple-600">Connected</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Farcaster ID:</span>
                  <div className="font-mono text-xs bg-purple-50 p-2 rounded mt-1">
                    {address}
                  </div>
                </div>

                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Connect a wallet in settings for Base Pay transactions
                </div>

                <Button
                  onClick={() => {
                    disconnect()
                    setShowDetails(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </Button>
              </div>
            </div>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDetails(false)}
            />
          </>
        )}
      </div>
    )
  }

  // For Ethereum addresses, use OnchainKit Identity
  return (
    <div className="relative">
      <Button
        onClick={() => setShowDetails(!showDetails)}
        size={size}
        variant="ghost"
        className="flex items-center space-x-2 p-2"
      >
        <Identity
          address={address as `0x${string}`}
          className="flex items-center space-x-2"
        >
          <Avatar className="w-8 h-8" />
          <div className="hidden sm:flex flex-col">
            <Name className="text-sm font-medium">
              <Badge />
            </Name>
            <Address className="text-xs text-gray-500" />
          </div>
        </Identity>
      </Button>

      {showDetails && (
        <>
          <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-50">
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <Identity address={address as `0x${string}`}>
                  <Avatar className="w-16 h-16" />
                  <div className="flex-1">
                    <Name className="text-lg font-semibold">
                      <Badge />
                    </Name>
                    <Address className="text-sm text-gray-500 font-mono" />
                  </div>
                </Identity>
              </div>

              {/* Connection Status */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Connection Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium">{isFarcaster ? 'Farcaster' : 'Browser'}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Wallet Type:</span>
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Base Account</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Base Pay:</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <Button
                  onClick={() => {
                    disconnect()
                    setShowDetails(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Overlay to close details */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDetails(false)}
          />
        </>
      )}
    </div>
  )
}