"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useConnectors } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { SdkInitializer } from '@/components/sdk-initializer'

// Environment detection with multiple fallback methods
const isFarcasterContext = () => {
  if (typeof window === 'undefined') return false
  
  try {
    // Method 1: Official SDK detection (most reliable)
    const isInMiniApp = sdk.isInMiniApp
    
    // Method 2: User Agent detection (mobile reliability)
    const isMobileFarcaster = window.navigator.userAgent.includes('FarcasterMobile')
    
    // Method 3: Iframe + domain detection
    const isIframe = window.parent !== window
    const hasFarcasterDomain = 
      window.location.hostname.includes('farcaster') ||
      document.referrer.includes('farcaster') ||
      window.location.href.includes('farcaster')
    
    // Final determination with priority to official SDK
    return isInMiniApp || isMobileFarcaster || (isIframe && hasFarcasterDomain)
  } catch {
    return false
  }
}

const queryClient = new QueryClient()

// Unified wallet context interface
interface WalletContextType {
  isConnected: boolean
  address: string | undefined
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  isFarcaster: boolean
  // Enhanced properties
  hasWalletAddress: boolean    // True if we have a real Ethereum address
  farcasterIdentity?: string   // FID when available  
  canMakePayments: boolean     // True if can make Base Pay transactions
  connectionType: 'base-account' | 'farcaster-identity' | 'none'
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Base Account browser wallet component (replaces Privy)
function BaseAccountWalletProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Use Wagmi hooks for Base Account
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const connectors = useConnectors()

  const connect = async () => {
    try {
      console.log('🚀 Starting Base Account browser connection...')
      setIsConnecting(true)
      
      // Find Base Account connector
      const baseConnector = connectors.find(
        connector => connector.id === 'baseAccount' || 
                    connector.name.toLowerCase().includes('base')
      )
      
      if (baseConnector) {
        console.log('🎯 Using Base Account connector:', baseConnector.name)
        await wagmiConnect({ connector: baseConnector })
        console.log('✅ Base Account connected successfully')
      } else {
        console.log('⚠️ Base Account connector not found, using first available')
        // Fallback to first available connector
        if (connectors.length > 0) {
          await wagmiConnect({ connector: connectors[0] })
          console.log('✅ Connected with fallback connector:', connectors[0].name)
        } else {
          throw new Error('No wallet connectors available')
        }
      }
    } catch (error) {
      console.error('❌ Base Account browser connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      console.log('🔌 Disconnecting Base Account...')
      await wagmiDisconnect()
      console.log('✅ Base Account disconnected')
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
    hasWalletAddress: !!address,
    canMakePayments: !!address,
    connectionType: address ? 'base-account' : 'none',
  }

  console.log('🌐 BaseAccountWalletProvider state:', {
    isConnected,
    address,
    isConnecting,
    connectionType: contextValue.connectionType
  })

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Enhanced Farcaster wallet component with dual-mode support
function FarcasterWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [localAddress, setLocalAddress] = useState<string | undefined>(undefined)
  const [farcasterIdentity, setFarcasterIdentity] = useState<string | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)

  // Wagmi hooks for wallet connection
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const { connect: wagmiConnect } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const connectors = useConnectors()

  // Check for existing Farcaster authentication
  useEffect(() => {
    const checkFarcasterAuth = async () => {
      try {
        console.log('🔍 Checking Farcaster authentication...')
        
        // Check for existing context
        const context = await sdk.context
        if (context?.user?.fid) {
          console.log('✅ Found Farcaster user:', context.user.fid)
          setFarcasterIdentity(`farcaster:${context.user.fid}`)
          setIsConnected(true)
        }

        // Check localStorage for session persistence
        const storedFid = localStorage.getItem('farcaster_fid')
        if (storedFid && !farcasterIdentity) {
          console.log('📱 Found stored Farcaster session:', storedFid)
          setFarcasterIdentity(`farcaster:${storedFid}`)
          setIsConnected(true)
        }
      } catch (error) {
        console.error('❌ Farcaster auth check failed:', error)
      }
    }

    checkFarcasterAuth()
  }, [farcasterIdentity])

  const connect = async () => {
    try {
      console.log('🚀 Starting Farcaster connection...')
      setIsConnecting(true)

      // Step 1: Try to establish Farcaster identity
      if (!farcasterIdentity) {
        try {
          console.log('🎯 Attempting Farcaster Quick Auth...')
          const authResult = await sdk.actions.signIn()
          
          if (authResult && authResult.isLoggedIn) {
            const context = await sdk.context
            const fid = context?.user?.fid || authResult.fid || 'unknown'
            
            setFarcasterIdentity(`farcaster:${fid}`)
            localStorage.setItem('farcaster_fid', fid.toString())
            console.log('✅ Farcaster identity established:', fid)
          }
        } catch (identityError) {
          console.log('⚠️ Farcaster identity setup failed, continuing with wallet connection')
        }
      }

      // Step 2: Try to connect wallet for payments (optional but preferred)
      if (!wagmiAddress) {
        try {
          console.log('💰 Attempting wallet connection for payments...')
          
          // Find Base Account connector first (preferred)
          const baseConnector = connectors.find(
            connector => connector.id === 'baseAccount' || 
                        connector.name.toLowerCase().includes('base')
          )
          
          if (baseConnector) {
            console.log('🎯 Using Base Account connector for payments')
            await wagmiConnect({ connector: baseConnector })
            console.log('✅ Wallet connected for payments')
          } else {
            console.log('⚠️ Base Account connector not found, using available connector')
            if (connectors.length > 0) {
              await wagmiConnect({ connector: connectors[0] })
              console.log('✅ Wallet connected via fallback connector')
            }
          }
        } catch (walletError) {
          console.log('⚠️ Wallet connection failed, continuing with identity only:', walletError)
        }
      }

      // Ensure we're connected (either with identity or wallet)
      if (!isConnected && !wagmiConnected) {
        setIsConnected(true)
        console.log('✅ Farcaster connection established')
      }

    } catch (error) {
      console.error('❌ Farcaster connection failed:', error)
      // Graceful fallback
      if (!farcasterIdentity && !wagmiAddress) {
        const fallbackFid = `temp_${Math.random().toString(36).substr(2, 9)}`
        setFarcasterIdentity(`farcaster:${fallbackFid}`)
        setIsConnected(true)
        localStorage.setItem('farcaster_fid', fallbackFid)
        console.log('🔄 Using fallback Farcaster identity:', fallbackFid)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      console.log('🔌 Disconnecting Farcaster...')
      
      // Disconnect wallet if connected
      if (wagmiConnected) {
        await wagmiDisconnect()
      }
      
      // Clear local state
      setIsConnected(false)
      setLocalAddress(undefined)
      setFarcasterIdentity(undefined)
      
      // Clear storage
      localStorage.removeItem('farcaster_fid')
      
      console.log('✅ Farcaster disconnected')
    } catch (error) {
      console.error('❌ Farcaster disconnect error:', error)
      // Force local disconnect
      setIsConnected(false)
      setLocalAddress(undefined)
      setFarcasterIdentity(undefined)
      localStorage.removeItem('farcaster_fid')
    }
  }

  // Determine current state
  const currentAddress = wagmiAddress || localAddress || farcasterIdentity
  const hasWalletAddress = !!wagmiAddress || !!localAddress
  const canMakePayments = hasWalletAddress
  
  let connectionType: 'base-account' | 'farcaster-identity' | 'none' = 'none'
  if (wagmiAddress) connectionType = 'base-account'
  else if (farcasterIdentity) connectionType = 'farcaster-identity'

  const contextValue: WalletContextType = {
    isConnected: isConnected || wagmiConnected,
    address: currentAddress,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: true,
    hasWalletAddress,
    farcasterIdentity,
    canMakePayments,
    connectionType,
  }

  console.log('🟣 FarcasterWalletProvider state:', {
    isConnected: contextValue.isConnected,
    address: currentAddress,
    hasWalletAddress,
    farcasterIdentity,
    canMakePayments,
    connectionType,
    wagmiAddress,
    wagmiConnected
  })

  return (
    <WalletContext.Provider value={contextValue}>
      <SdkInitializer />
      {children}
    </WalletContext.Provider>
  )
}

// Main unified Base wallet provider
export function BaseWalletProvider({ children }: { children: ReactNode }) {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('🔍 Base wallet environment detection starting...')
    const detected = isFarcasterContext()
    setIsFarcaster(detected)
    setMounted(true)
    console.log('🎯 Environment detected - Farcaster:', detected)
  }, [])

  // Show loading during hydration
  if (!mounted) {
    return <div>{children}</div>
  }

  if (isFarcaster) {
    console.log('🟣 Using Farcaster mode with Base Account support')
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

  // Browser mode with Base Account (no Privy)
  console.log('🌐 Using Browser mode with Base Account authentication')
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BaseAccountWalletProvider>
          {children}
        </BaseAccountWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Hook to use the unified Base wallet context
export function useBaseWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useBaseWallet must be used within a BaseWalletProvider')
  }
  return context
}