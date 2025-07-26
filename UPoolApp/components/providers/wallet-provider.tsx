"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { SdkInitializer } from '@/components/sdk-initializer'

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

// Browser wallet component (using Privy)
function BrowserWalletProvider({ children }: { children: ReactNode }) {
  const { login, logout, authenticated, user } = usePrivy()
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = () => {
    setIsConnecting(true)
    login()
      .then(() => {
        setIsConnecting(false)
      })
      .catch((error) => {
        console.error('Login failed:', error)
        setIsConnecting(false)
      })
  }

  const disconnect = () => {
    logout()
  }

  const contextValue: WalletContextType = {
    isConnected: authenticated,
    address: user?.wallet?.address,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: false,
  }

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
            setAddress(`farcaster:${fid}`)
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
      
      // Use Farcaster Quick Auth
      const result = await sdk.actions.signIn()
      console.log('FarcasterWalletProvider: Quick Auth result:', result)
      
      if (result && result.isLoggedIn) {
        console.log('FarcasterWalletProvider: Successfully authenticated with Farcaster')
        setIsConnected(true)
        
        // For Quick Auth, we might not get a wallet address directly
        // The user is authenticated with their Farcaster identity
        // We can use their FID as a unique identifier
        const context = await sdk.context
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
      } else {
        console.log('FarcasterWalletProvider: Quick Auth failed or cancelled')
      }
    } catch (error) {
      console.error('FarcasterWalletProvider: Quick Auth error:', error)
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
        const context = await sdk.context
        console.log('🔍 Environment detection context:', context)
        
        // Check multiple indicators that we're in a Farcaster environment
        // Be more specific about Farcaster detection to avoid false positives
        const isFarcasterFrame = !!(
          context?.client?.clientFid ||  // Original check for Farcaster client
          (context?.isMinApp === true) || // Explicit check for miniapp
          context?.miniApp === true      // Alternative property name
        )
        
        // Additional check: if we're in a regular browser (not in iframe/frame), it's NOT Farcaster
        const isRegularBrowser = typeof window !== 'undefined' && 
          window.parent === window && 
          !window.location.href.includes('farcaster')
        
        // Final determination: only Farcaster if we have positive indicators AND not in regular browser
        const finalIsFarcaster = isFarcasterFrame && !isRegularBrowser
        
        console.log('🎯 Environment detection result:', {
          contextExists: !!context,
          clientFid: context?.client?.clientFid,
          isMinApp: context?.isMinApp,
          miniApp: context?.miniApp,
          isFarcasterFrame,
          isRegularBrowser,
          finalIsFarcaster,
          href: typeof window !== 'undefined' ? window.location.href : 'SSR',
          windowParent: typeof window !== 'undefined' ? (window.parent === window ? 'same' : 'different') : 'SSR'
        })
        
        setIsFarcaster(finalIsFarcaster)
      } catch (error) {
        console.error('Failed to get Farcaster context:', error)
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
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <FarcasterWalletProvider>
            {children}
          </FarcasterWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  // Browser mode with Privy
  console.log('🌐 Using Browser mode with Privy')
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#8B5CF6',
          logo: '/logo.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: config.chains[0],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserWalletProvider>
            {children}
          </BrowserWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
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

