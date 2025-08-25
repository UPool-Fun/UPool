"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'
import { config } from '@/lib/wagmi'

// Get chain configuration from environment
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

const queryClient = new QueryClient()

// Simple wallet provider that just wraps the necessary providers
export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('🌐 Using Simple WalletProvider - Browser mode only')
  
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || process.env.NEXT_PUBLIC_CDP_API_KEY || undefined}
      chain={targetChain}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserWallet>
            {children}
          </BrowserWallet>
        </QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  )
}

// Wallet context for unified interface
interface WalletContextType {
  isConnected: boolean
  address: string | undefined
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  isFarcaster: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Browser wallet component using Wagmi hooks
function BrowserWallet({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  // Reset connecting state when connection status changes
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false)
    }
  }, [isConnected])
  
  const connect = async () => {
    try {
      console.log('🔌 Connecting wallet...')
      setIsConnecting(true)
      
      // Find Base Account connector first
      const baseConnector = connectors.find(c => c.id === 'baseAccount')
      if (baseConnector) {
        console.log('🎯 Using Base Account connector')
        wagmiConnect({ connector: baseConnector })
      } else {
        console.log('⚠️ Base Account not found, using first available')
        if (connectors.length > 0) {
          wagmiConnect({ connector: connectors[0] })
        }
      }
    } catch (error) {
      console.error('❌ Connection error:', error)
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await wagmiDisconnect()
    } catch (error) {
      console.error('❌ Disconnect error:', error)
    }
  }

  const contextValue: WalletContextType = {
    isConnected,
    address,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: false,
  }

  console.log('🌐 BrowserWallet state:', { isConnected, address })
  console.log('🔌 Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })))

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook to use wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}