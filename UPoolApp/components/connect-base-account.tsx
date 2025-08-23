"use client"

import React, { useState } from 'react'
import { SignInWithBaseButton } from '@base-org/account-ui/react'
import { Button } from '@/components/ui/button'
import { useUnifiedWallet } from '@/components/providers/unified-base-wallet-provider'
import { Wallet, LogOut, User, CreditCard } from 'lucide-react'

interface ConnectBaseAccountProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

export function ConnectBaseAccount({ size = 'md', variant = 'primary' }: ConnectBaseAccountProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const { 
    isConnected, 
    address, 
    connect, 
    disconnect, 
    isConnecting, 
    isFarcaster,
    hasWalletAddress,
    farcasterIdentity,
    canMakePayments,
    connectionType
  } = useUnifiedWallet()

  // If not connected, show connect button
  if (!isConnected) {
    if (isFarcaster) {
      // Farcaster environment - use custom button that handles dual auth
      return (
        <Button 
          onClick={connect}
          disabled={isConnecting}
          size={size}
          variant={variant === 'primary' ? 'default' : variant}
          className="flex items-center space-x-2"
        >
          <User className="w-4 h-4" />
          <span>{isConnecting ? 'Joining...' : 'Join'}</span>
        </Button>
      )
    } else {
      // Browser environment - use Base Account sign-in button
      return (
        <div className="flex items-center space-x-2">
          <SignInWithBaseButton
            colorScheme={variant === 'primary' ? 'blue' : 'gray'}
            size={size}
            onSignIn={() => {
              console.log('✅ Base Account sign-in successful')
            }}
            onSignInError={(error) => {
              console.error('❌ Base Account sign-in failed:', error)
            }}
          />
        </div>
      )
    }
  }

  // If connected, show connection status and actions
  const getDisplayAddress = () => {
    if (!address) return 'Connected'
    
    if (address.startsWith('farcaster:')) {
      return `FC ${address.split(':')[1]?.slice(0, 6)}...`
    }
    
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    
    return address.slice(0, 10) + '...'
  }

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'base-account':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'farcaster-identity':
        return <User className="w-4 h-4 text-purple-600" />
      default:
        return <Wallet className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDetails(!showDetails)}
        size={size}
        variant="outline"
        className="flex items-center space-x-2"
      >
        {getConnectionIcon()}
        <span>{getDisplayAddress()}</span>
      </Button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Connection Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>

            {/* Environment */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">{isFarcaster ? 'Farcaster' : 'Browser'}</span>
            </div>

            {/* Connection Type */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Connection:</span>
              <div className="flex items-center space-x-1">
                {getConnectionIcon()}
                <span className="font-medium capitalize">{connectionType.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Address Information */}
            {address && (
              <div className="space-y-2">
                {hasWalletAddress && (
                  <div className="text-sm">
                    <span className="text-gray-600">Wallet:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                      {address}
                    </div>
                  </div>
                )}
                
                {farcasterIdentity && (
                  <div className="text-sm">
                    <span className="text-gray-600">Farcaster:</span>
                    <div className="font-mono text-xs bg-purple-50 p-2 rounded mt-1">
                      {farcasterIdentity}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Capabilities */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Base Pay:</span>
                <span className={`font-medium ${canMakePayments ? 'text-green-600' : 'text-orange-600'}`}>
                  {canMakePayments ? 'Available' : 'Limited'}
                </span>
              </div>
              
              {!canMakePayments && isFarcaster && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Connect wallet in header for Base Pay transactions
                </div>
              )}
            </div>

            {/* Disconnect Button */}
            <div className="border-t pt-3">
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
      )}
      
      {/* Overlay to close details */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  )
}