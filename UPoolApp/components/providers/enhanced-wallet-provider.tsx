"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import { useMiniKit, MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { base, baseSepolia } from 'wagmi/chains'

// Environment detection using multiple methods
const isFarcasterContext = () => {
  if (typeof window === 'undefined') return false
  
  try {
    // Check User Agent first (most reliable)
    const isMobileFarcaster = window.navigator.userAgent.includes('FarcasterMobile')
    
    // Check if we're in an iframe (common for Mini Apps)
    const isIframe = window.parent !== window
    
    // Check for Farcaster-related domains
    const hasFarcasterDomain = 
      window.location.hostname.includes('farcaster') ||
      document.referrer.includes('farcaster') ||
      window.location.href.includes('farcaster')
    
    return isMobileFarcaster || (isIframe && hasFarcasterDomain)
  } catch {
    return false
  }
}

// Get chain configuration from environment variables
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

const queryClient = new QueryClient()

// Enhanced wallet context for unified interface
interface WalletContextType {
  isConnected: boolean
  address: string | undefined
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  isFarcaster: boolean
  // New properties for enhanced functionality
  hasWalletAddress: boolean  // True if we have a real Ethereum address
  farcasterIdentity?: string  // FID when available
  canMakePayments: boolean   // True if can make Base Pay transactions
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Enhanced Browser wallet component
function BrowserWalletProvider({ children }: { children: ReactNode }) {
  const { login, logout, authenticated, user } = usePrivy()
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = () => {
    setIsConnecting(true)
    login()
      .then(() => setIsConnecting(false))
      .catch((error) => {
        console.error('Browser wallet login failed:', error)
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
    hasWalletAddress: !!user?.wallet?.address,
    canMakePayments: !!user?.wallet?.address,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Enhanced Farcaster wallet component with MiniKit
function FarcasterWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [farcasterIdentity, setFarcasterIdentity] = useState<string | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)
  const [frameReady, setFrameReady] = useState(false)

  // Get wagmi hooks
  const { address: wagmiAddress } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  
  // Initialize MiniKit frame
  const { setFrameReady: miniKitSetReady, isFrameReady } = useMiniKit()

  useEffect(() => {
    if (!isFrameReady && !frameReady) {
      console.log('🎯 Initializing MiniKit frame...')
      miniKitSetReady()
      setFrameReady(true)
    }
  }, [isFrameReady, frameReady, miniKitSetReady])

  // Check for existing authentication
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking Farcaster authentication status...')
        
        // Check if already connected with wallet
        if (wagmiAddress) {
          console.log('✅ Found connected wallet address:', wagmiAddress)
          setAddress(wagmiAddress)
          setIsConnected(true)
          return
        }

        // Legacy check for existing FID-based connection
        // This maintains compatibility with existing user sessions
        const legacyFid = localStorage.getItem('farcaster_fid')
        if (legacyFid) {
          console.log('📱 Found legacy Farcaster session:', legacyFid)
          setFarcasterIdentity(`farcaster:${legacyFid}`)
          setIsConnected(true)
        }
      } catch (error) {
        console.error('❌ Auth status check failed:', error)
      }
    }

    if (frameReady) {
      checkAuthStatus()
    }
  }, [frameReady, wagmiAddress])

  const connect = async () => {
    try {
      console.log('🚀 Starting Farcaster wallet connection...')
      setIsConnecting(true)
      
      // Find Farcaster connector if available
      const farcasterConnector = connectors.find(
        connector => connector.name.toLowerCase().includes('farcaster') ||
                    connector.id.includes('farcaster')
      )
      
      if (farcasterConnector) {
        console.log('🎯 Using Farcaster connector:', farcasterConnector.name)
        await wagmiConnect({ connector: farcasterConnector })
        console.log('✅ Farcaster wallet connected successfully')
      } else {
        console.log('⚠️ No Farcaster connector found, using fallback')
        
        // Fallback: Still provide identity but note payment limitation
        const mockFid = Math.random().toString(36).substr(2, 9)
        setFarcasterIdentity(`farcaster:${mockFid}`)
        setIsConnected(true)
        
        // Store for session persistence
        localStorage.setItem('farcaster_fid', mockFid)
        
        console.log('📱 Farcaster identity created (limited payments):', mockFid)
      }
      
    } catch (error) {
      console.error('❌ Farcaster wallet connection failed:', error)
      
      // Graceful fallback - still provide identity
      const mockFid = Math.random().toString(36).substr(2, 9)
      setFarcasterIdentity(`farcaster:${mockFid}`)
      setIsConnected(true)
      localStorage.setItem('farcaster_fid', mockFid)
      
      console.log('🔄 Fallback connection successful with identity:', mockFid)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      console.log('🔌 Disconnecting Farcaster wallet...')
      
      await wagmiDisconnect()
      
      setIsConnected(false)
      setAddress(undefined)
      setFarcasterIdentity(undefined)
      
      localStorage.removeItem('farcaster_fid')
      console.log('✅ Farcaster wallet disconnected')
    } catch (error) {
      console.error('❌ Disconnect error:', error)
      // Force disconnect locally even if remote fails
      setIsConnected(false)
      setAddress(undefined)
      setFarcasterIdentity(undefined)
      localStorage.removeItem('farcaster_fid')
    }
  }
  
  // Determine current address and capabilities
  const currentAddress = wagmiAddress || address || farcasterIdentity
  const hasWalletAddress = !!wagmiAddress || !!address
  const canMakePayments = hasWalletAddress

  const contextValue: WalletContextType = {
    isConnected,
    address: currentAddress,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: true,
    hasWalletAddress,
    farcasterIdentity,
    canMakePayments,
  }

  console.log('🎯 FarcasterWalletProvider state:', {
    isConnected,
    address: currentAddress,
    hasWalletAddress,
    farcasterIdentity,
    canMakePayments,
    wagmiAddress,
    frameReady
  })

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Main enhanced wallet provider with MiniKit integration
export function EnhancedWalletProvider({ children }: { children: ReactNode }) {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('🔍 Enhanced environment detection starting...')
    setIsFarcaster(isFarcasterContext())
    setMounted(true)
    console.log('🎯 Environment detected as Farcaster:', isFarcasterContext())
  }, [])

  // Show loading during hydration
  if (!mounted) {
    return <div>{children}</div>
  }

  if (isFarcaster) {
    console.log('🟣 Using Enhanced Farcaster MiniKit mode')
    return (
      <MiniKitProvider
        apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
        chain={targetChain}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <FarcasterWalletProvider>
              {children}
            </FarcasterWalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </MiniKitProvider>
    )
  }

  // Browser mode with Privy
  console.log('🌐 Using Enhanced Browser mode with Privy')
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

// Enhanced hook with additional capabilities
export function useEnhancedWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useEnhancedWallet must be used within an EnhancedWalletProvider')
  }
  return context
}