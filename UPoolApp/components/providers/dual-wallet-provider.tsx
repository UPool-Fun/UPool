'use client'

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'
import { ThemeProvider } from 'next-themes'
import { sdk } from '@farcaster/miniapp-sdk'
import { config } from '@/lib/wagmi'

// Get chain configuration from environment
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

const queryClient = new QueryClient()

// Wallet context interface
interface WalletContextType {
  isConnected: boolean
  address: string | undefined
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  isFarcaster: boolean
  environmentReady: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Environment detection hook
function useEnvironmentDetection() {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [environmentReady, setEnvironmentReady] = useState(false)

  useEffect(() => {
    const detectEnvironment = async () => {
      try {
        console.log('🎯 Starting environment detection...')
        
        // Check if we're in a browser first
        if (typeof window === 'undefined') {
          console.log('🎯 Server-side rendering, defaulting to browser')
          setIsFarcaster(false)
          setEnvironmentReady(true)
          return
        }

        // Primary detection: Check if SDK methods are actually available
        let sdkAvailable = false
        let isInMiniApp = false
        
        try {
          // Test if sdk is properly initialized and has required methods
          isInMiniApp = sdk && typeof sdk.isInMiniApp === 'boolean' ? sdk.isInMiniApp : false
          sdkAvailable = !!(sdk && sdk.actions && sdk.context)
          console.log('🎯 SDK available:', sdkAvailable, 'isInMiniApp:', isInMiniApp)
        } catch (error) {
          console.log('🎯 SDK not available:', error.message)
          sdkAvailable = false
          isInMiniApp = false
        }

        // Secondary detection: Try to get context only if SDK is available
        let hasValidContext = false
        if (sdkAvailable) {
          try {
            const context = await Promise.race([
              sdk.context,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Context timeout')), 2000))
            ])
            hasValidContext = !!(context?.client?.clientFid || context?.user?.fid || context?.isMinApp || context?.miniApp)
            console.log('🎯 Valid context:', hasValidContext, context)
          } catch (error) {
            console.log('🎯 Context check failed:', error.message)
            hasValidContext = false
          }
        }

        // Fallback detection: User Agent (only as last resort)
        const isMobileFarcaster = typeof window !== 'undefined' && 
          window.navigator.userAgent.includes('FarcasterMobile')
        console.log('🎯 Mobile Farcaster UA:', isMobileFarcaster)

        // Final determination - be more strict about what constitutes Farcaster environment
        const finalIsFarcaster = sdkAvailable && (isInMiniApp || hasValidContext) && isMobileFarcaster
        console.log('🎯 Final environment detection - isFarcaster:', finalIsFarcaster)
        console.log('🎯 Decision factors:', { sdkAvailable, isInMiniApp, hasValidContext, isMobileFarcaster })

        setIsFarcaster(finalIsFarcaster)
        setEnvironmentReady(true)

        // Initialize SDK only if we're confident we're in Farcaster environment
        if (finalIsFarcaster && sdkAvailable) {
          console.log('🚀 Initializing Farcaster SDK...')
          try {
            await sdk.actions.ready()
            console.log('✅ Farcaster SDK ready!')
          } catch (error) {
            console.error('❌ SDK initialization failed:', error)
            // If SDK fails to initialize, fall back to browser mode
            setIsFarcaster(false)
          }
        }

      } catch (error) {
        console.error('❌ Environment detection error:', error)
        setIsFarcaster(false)
        setEnvironmentReady(true)
      }
    }

    detectEnvironment()
  }, [])

  return { isFarcaster, environmentReady }
}

// Browser wallet component using Base Account and other connectors
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
      console.log('🔌 Browser: Connecting with Base Account...')
      setIsConnecting(true)
      
      // Find Base Account connector first (priority for browser)
      const baseConnector = connectors.find(c => c.id === 'baseAccount')
      if (baseConnector) {
        console.log('🎯 Using Base Account connector for browser')
        wagmiConnect({ connector: baseConnector })
      } else {
        console.log('⚠️ Base Account not found, using first available')
        if (connectors.length > 0) {
          wagmiConnect({ connector: connectors[0] })
        }
      }
    } catch (error) {
      console.error('❌ Browser connection error:', error)
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await wagmiDisconnect()
    } catch (error) {
      console.error('❌ Browser disconnect error:', error)
    }
  }

  const contextValue: WalletContextType = {
    isConnected,
    address,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: false,
    environmentReady: true
  }

  console.log('🌐 BrowserWallet state:', { isConnected, address, connectors: connectors.length })

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Farcaster wallet component with Mini App authentication
function FarcasterWallet({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [farcasterAddress, setFarcasterAddress] = useState<string | undefined>()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if already signed in
    const checkFarcasterAuth = async () => {
      try {
        const context = await sdk.context
        if (context?.user?.fid) {
          setFarcasterAddress(`farcaster:${context.user.fid}`)
          setIsConnected(true)
          console.log('✅ Already authenticated with Farcaster:', context.user.fid)
        }
      } catch (error) {
        console.log('ℹ️ Not authenticated with Farcaster')
      }
    }

    checkFarcasterAuth()
  }, [])

  const connect = async () => {
    try {
      console.log('🔌 Farcaster: Authenticating with Mini App...')
      setIsConnecting(true)
      
      // Check if SDK methods are available before using them
      if (!sdk || !sdk.actions || typeof sdk.actions.signIn !== 'function') {
        throw new Error('Farcaster SDK not properly initialized or signIn method not available')
      }
      
      const result = await sdk.actions.signIn()
      console.log('🎯 Farcaster sign in result:', result)
      
      // Get updated context after sign in
      const context = await sdk.context
      if (context?.user?.fid) {
        setFarcasterAddress(`farcaster:${context.user.fid}`)
        setIsConnected(true)
        console.log('✅ Farcaster authentication successful:', context.user.fid)
      } else {
        throw new Error('No user FID found in context after sign in')
      }
      
    } catch (error) {
      console.error('❌ Farcaster authentication error:', error)
      // Show user-friendly error
      alert(`Farcaster authentication failed: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      setFarcasterAddress(undefined)
      setIsConnected(false)
      console.log('✅ Farcaster disconnected')
    } catch (error) {
      console.error('❌ Farcaster disconnect error:', error)
    }
  }

  const contextValue: WalletContextType = {
    isConnected,
    address: farcasterAddress,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: true,
    environmentReady: true
  }

  console.log('🎯 FarcasterWallet state:', { isConnected, address: farcasterAddress })

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Main provider that switches between environments
export function DualWalletProvider({ children }: { children: ReactNode }) {
  const { isFarcaster, environmentReady } = useEnvironmentDetection()
  
  console.log('🎯 DualWalletProvider:', { isFarcaster, environmentReady })

  // Show loading during environment detection
  if (!environmentReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing UPool...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/* Always wrap with Wagmi for browser compatibility - Farcaster will just ignore it */}
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || process.env.NEXT_PUBLIC_CDP_API_KEY}
            chain={targetChain}
          >
            {isFarcaster ? (
              // Farcaster Mini App environment
              <FarcasterWallet>
                {children}
              </FarcasterWallet>
            ) : (
              // Browser environment with Wagmi
              <BrowserWallet>
                {children}
              </BrowserWallet>
            )}
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}

// Hook to use wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a DualWalletProvider')
  }
  return context
}