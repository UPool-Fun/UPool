"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'
import { config } from '@/lib/wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { SdkInitializer } from '@/components/sdk-initializer'

// Get chain configuration from environment
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

// Environment detection
const isFarcasterContext = () => {
  if (typeof window === 'undefined') return false
  try {
    return !!window.parent && window.parent !== window
  } catch {
    return false
  }
}

const queryClient = new QueryClient()

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

// Browser wallet component (using Base Account via Wagmi)
function BrowserWalletProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Use Wagmi hooks for Base Account
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const connect = async () => {
    try {
      console.log('🚀 Starting Base Account connection...')
      setIsConnecting(true)
      
      // Find Base Account connector (already configured in wagmi.ts)
      const baseConnector = connectors.find(
        connector => connector.id === 'baseAccount'
      )
      
      if (baseConnector) {
        console.log('🎯 Using Base Account connector')
        await wagmiConnect({ connector: baseConnector })
        console.log('✅ Base Account connected via Wagmi')
      } else {
        console.log('⚠️ Base Account connector not found, using first available')
        // Fallback to first available connector
        if (connectors.length > 0) {
          await wagmiConnect({ connector: connectors[0] })
        }
      }
    } catch (error) {
      console.error('❌ Base Account connection failed:', error)
    } finally {
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

  console.log('🌐 BrowserWalletProvider (Base Account) state:', {
    isConnected,
    address,
    isConnecting,
    connectorsAvailable: connectors.length,
    connectorIds: connectors.map(c => c.id)
  })

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Farcaster Frame wallet component
function FarcasterWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const context = await sdk.context
        console.log('FarcasterWalletProvider: Initial context check:', context)
        
        if (context?.user) {
          console.log('FarcasterWalletProvider: User already authenticated')
          setIsConnected(true)
          
          // Use FID as identifier for Quick Auth
          const fid = context.user.fid
          if (fid) {
            setAddress(`fid:${fid}`)
            console.log('FarcasterWalletProvider: Found existing Farcaster ID:', fid)
          }
        }
      } catch (error) {
        console.error('FarcasterWalletProvider: Initial auth check error:', error)
      }
    }

    checkAuthStatus()
  }, [])

  const connect = async () => {
    try {
      console.log('FarcasterWalletProvider: Starting Quick Auth process')
      setIsConnecting(true)
      
      // Add timeout for mobile compatibility
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Quick Auth timeout')), 10000)
      })
      
      // Use Farcaster Quick Auth with timeout
      const result = await Promise.race([
        sdk.actions.signIn(),
        timeoutPromise
      ])
      
      console.log('FarcasterWalletProvider: Quick Auth result:', result)
      
      if (result && result.isLoggedIn) {
        console.log('FarcasterWalletProvider: Successfully authenticated with Farcaster')
        setIsConnected(true)
        
        // For Quick Auth, we might not get a wallet address directly
        // The user is authenticated with their Farcaster identity
        // We can use their FID as a unique identifier
        try {
          const contextPromise = sdk.context
          const contextTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Context timeout')), 3000)
          })
          
          const context = await Promise.race([contextPromise, contextTimeout])
          console.log('FarcasterWalletProvider: Context after auth:', context)
          
          // Set a placeholder address or use FID-based identifier
          const fid = context?.user?.fid || result.fid
          if (fid) {
            // Use FID as identifier (not a real wallet address)
            setAddress(`farcaster:${fid}`)
            console.log('FarcasterWalletProvider: Set Farcaster ID:', fid)
          } else {
            // Fallback to just marking as connected without address
            console.log('FarcasterWalletProvider: Connected without specific address')
          }
        } catch (contextError) {
          console.error('FarcasterWalletProvider: Context error:', contextError)
          // Still mark as connected even if context fails
          const fid = result.fid || 'unknown'
          setAddress(`farcaster:${fid}`)
          console.log('FarcasterWalletProvider: Fallback connection with FID:', fid)
        }
      } else {
        console.log('FarcasterWalletProvider: Quick Auth failed or cancelled')
      }
    } catch (error) {
      console.error('FarcasterWalletProvider: Quick Auth error:', error)
      
      // On mobile, sometimes the auth might work but throw an error
      // Try to get context anyway to see if user is actually logged in
      try {
        const context = await sdk.context
        if (context?.user?.fid) {
          console.log('FarcasterWalletProvider: Found user despite error, proceeding')
          setIsConnected(true)
          setAddress(`farcaster:${context.user.fid}`)
        }
      } catch (fallbackError) {
        console.error('FarcasterWalletProvider: Fallback check failed:', fallbackError)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      console.log('FarcasterWalletProvider: Disconnecting')
      // Reset local state
      setIsConnected(false)
      setAddress(undefined)
    } catch (error) {
      console.error('FarcasterWalletProvider: Disconnect error:', error)
    }
  }

  const contextValue: WalletContextType = {
    isConnected,
    address,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: true,
  }

  // Log connection state for debugging
  console.log('FarcasterWalletProvider state:', {
    isConnected,
    address,
    isConnecting
  })

  return (
    <WalletContext.Provider value={contextValue}>
      <SdkInitializer />
      {children}
    </WalletContext.Provider>
  )
}

// Main wallet provider that switches based on environment
export function WalletProvider({ children }: { children: ReactNode }) {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const checkFarcasterContext = async () => {
      try {
        console.log('🔍 Starting simplified environment detection...')
        
        // Check User Agent first for reliability
        const isMobileFarcaster = typeof window !== 'undefined' && 
          window.navigator.userAgent.includes('FarcasterMobile')
        
        console.log('📱 Environment check:', {
          isMobileFarcaster,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
          href: typeof window !== 'undefined' ? window.location.href : 'SSR'
        })
        
        // For now, let's be very conservative and only use Farcaster mode for mobile
        // This ensures browser mode works correctly
        setIsFarcaster(isMobileFarcaster)
        
        if (isMobileFarcaster) {
          console.log('🟣 Using Farcaster mode (mobile detected)')
        } else {
          console.log('🌐 Using Browser mode (default)')
        }
        
      } catch (error) {
        console.error('❌ Environment detection error:', error)
        console.log('🌐 Defaulting to Browser mode')
        setIsFarcaster(false)
      }
    }

    setMounted(true)
    checkFarcasterContext()
  }, [])

  // Show loading during hydration
  if (!mounted) {
    return <div>{children}</div>
  }

  if (isFarcaster) {
    // Farcaster Frame mode
    console.log('🟣 Using Farcaster MiniApp mode')
    return (
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || undefined}
        chain={targetChain}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <FarcasterWalletProvider>
              {children}
            </FarcasterWalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </OnchainKitProvider>
    )
  }

  // Browser mode with Base Account (via Wagmi)
  console.log('🌐 Using Browser mode with Base Account')
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || undefined}
      chain={targetChain}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserWalletProvider>
            {children}
          </BrowserWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
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

