"use client"

import { PropsWithChildren, useEffect } from "react"
import { WagmiProvider, useAccount } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { createConfig, http } from "wagmi"
import { baseSepolia, base } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { sdk } from '@farcaster/miniapp-sdk'
import { SdkInitializer } from '@/components/sdk-initializer'

// Get chain configuration from environment
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

// Farcaster Mini App specific wagmi configuration
// In Farcaster, the user's wallet is pre-connected, so we use injected connector
const farcasterWagmiConfig = createConfig({
  chains: [targetChain], // Use same chain as main app
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    // Note: @farcaster/miniapp-wagmi-connector would go here when available
    // farcasterMiniApp(), 
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org'),
  },
  ssr: true,
})

const farcasterQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false, // Disable in mini app environment
      retry: 3, // More retries for mobile stability
    },
  },
})

/**
 * Farcaster Web Client Provider Stack
 * Optimized for Farcaster web environment with frame integration
 */
export function FarcasterWebProviders({ children }: PropsWithChildren) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || undefined}
      chain={targetChain}
    >
      <WagmiProvider config={farcasterWagmiConfig}>
        <QueryClientProvider client={farcasterQueryClient}>
          <FarcasterWebWrapper>
            {children}
          </FarcasterWebWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  )
}

/**
 * Farcaster Mobile App Provider Stack  
 * Optimized for mobile Farcaster app with native UI patterns
 */
export function FarcasterMobileProviders({ children }: PropsWithChildren) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || undefined}
      chain={targetChain}
    >
      <WagmiProvider config={farcasterWagmiConfig}>
        <QueryClientProvider client={farcasterQueryClient}>
          <FarcasterMobileWrapper>
            {children}
          </FarcasterMobileWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  )
}

/**
 * Farcaster Web Environment Wrapper
 * Handles web-specific optimizations and frame integration
 */
function FarcasterWebWrapper({ children }: PropsWithChildren) {
  console.log('🎯 UPool Farcaster Web Environment Active')
  
  // Initialize Farcaster SDK if available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).farcaster) {
      console.log('🔗 Farcaster SDK detected and ready for UPool')
    }
  }, [])
  
  return (
    <div className="upool-farcaster-web-app">
      <SdkInitializer />
      <FarcasterWalletMonitor />
      {children}
    </div>
  )
}

/**
 * Farcaster Mobile Environment Wrapper
 * Handles mobile-specific optimizations and native UI patterns
 */
function FarcasterMobileWrapper({ children }: PropsWithChildren) {
  console.log('📱 UPool Farcaster Mobile Environment Active')
  
  // Initialize MiniKit/SDK if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSDK = !!(window as any).sdk || !!(window as any).minikit || !!(window as any).farcaster
      if (hasSDK) {
        console.log('📱 Farcaster MiniKit/SDK detected and ready for UPool')
      }
    }
  }, [])
  
  return (
    <div className="upool-farcaster-mobile-app">
      <SdkInitializer />
      <FarcasterWalletMonitor />
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {children}
      </div>
    </div>
  )
}

/**
 * Monitor Farcaster wallet connection status
 * In Farcaster environments, users are pre-connected but we need to detect the wallet
 */
function FarcasterWalletMonitor() {
  const { address, isConnected } = useAccount()

  useEffect(() => {
    const checkFarcasterWallet = async () => {
      try {
        // In Farcaster, the user should be pre-connected
        console.log('💰 Farcaster Wallet Status:', {
          wagmiConnected: isConnected,
          wagmiAddress: address,
          environment: 'farcaster'
        })

        // Try to get Farcaster user context
        if ((window as any).sdk) {
          const context = await (window as any).sdk.context
          if (context?.user?.fid) {
            console.log('👤 Farcaster User Context:', {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName
            })
          }
        }

        // If wagmi shows no connection but we're in Farcaster, try to trigger connection
        if (!isConnected && typeof window !== 'undefined') {
          console.log('🔄 Attempting to establish wagmi connection in Farcaster environment')
          
          // This would trigger the injected connector to pick up the Farcaster wallet
          // The actual connection would be handled by the wallet connection logic
        }

      } catch (error) {
        console.error('❌ Error checking Farcaster wallet:', error)
      }
    }

    // Check wallet status when component mounts and when connection status changes
    checkFarcasterWallet()
  }, [isConnected, address])

  return null // This is a monitoring component with no UI
}

/**
 * Shared Farcaster utilities for UPool integration
 */
export const uPoolFarcasterUtils = {
  /**
   * Check if Farcaster environment is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           ((window as any).farcaster || (window as any).minikit || (window as any).sdk)
  },

  /**
   * Get Farcaster user info for UPool profile integration
   */
  async getUserInfo() {
    if (typeof window !== 'undefined') {
      // Try SDK first (most reliable)
      if ((window as any).sdk) {
        try {
          const context = await (window as any).sdk.context
          if (context?.user) {
            return {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
              source: 'sdk'
            }
          }
        } catch (error) {
          console.warn('Failed to get SDK user info:', error)
        }
      }

      // Fallback to direct farcaster object
      if ((window as any).farcaster) {
        try {
          return await (window as any).farcaster.getUser()
        } catch (error) {
          console.warn('Failed to get Farcaster user info:', error)
        }
      }
    }
    return null
  },

  /**
   * Share UPool pool via Farcaster
   */
  async sharePool(poolData: { 
    title: string
    description: string
    fundingGoal: string
    poolId: string
  }) {
    if (typeof window !== 'undefined' && (window as any).farcaster) {
      try {
        const shareContent = {
          text: `🏦 Join my UPool: "${poolData.title}" - Goal: ${poolData.fundingGoal} ETH\n\n${poolData.description}`,
          url: `${process.env.NEXT_PUBLIC_URL}/pool/${poolData.poolId}`,
          embeds: [{
            url: `${process.env.NEXT_PUBLIC_URL}/pool/${poolData.poolId}`
          }]
        }
        
        return await (window as any).farcaster.share(shareContent)
      } catch (error) {
        console.error('Failed to share pool via Farcaster:', error)
        return null
      }
    }
    return null
  },

  /**
   * Request transaction via Farcaster wallet
   * This integrates with UPool's smart contract interactions
   */
  async requestTransaction(txData: {
    to: string
    value?: string
    data?: string
    chainId?: number
  }) {
    if (typeof window !== 'undefined' && (window as any).farcaster) {
      try {
        // Use Farcaster's transaction request method
        return await (window as any).farcaster.request({
          method: 'eth_sendTransaction',
          params: [{
            to: txData.to,
            value: txData.value || '0x0',
            data: txData.data || '0x',
            chainId: `0x${(txData.chainId || targetChain.id).toString(16)}`
          }]
        })
      } catch (error) {
        console.error('Failed to request transaction via Farcaster:', error)
        throw error
      }
    }
    throw new Error('Farcaster transaction not available')
  },

  /**
   * Check if user can interact with smart contracts
   */
  async canInteractWithContracts(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && (window as any).farcaster) {
        // Try to get account access
        const accounts = await (window as any).farcaster.request({ 
          method: 'eth_requestAccounts' 
        })
        return accounts && accounts.length > 0
      }
      return false
    } catch (error) {
      console.warn('Cannot access Farcaster wallet for contract interaction:', error)
      return false
    }
  }
}