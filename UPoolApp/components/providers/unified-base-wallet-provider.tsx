"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { SdkInitializer } from '@/components/sdk-initializer'
import { createBaseAccountSDK } from '@base-org/account'

// Initialize Base Account SDK for direct usage
const baseAccountSDK = createBaseAccountSDK({
  appName: 'UPool',
  appLogo: process.env.NEXT_PUBLIC_IMAGE_URL || 'https://upool.fun/logo.png',
})

// Environment detection
const isFarcasterContext = () => {
  if (typeof window === 'undefined') return false
  
  try {
    // Official SDK detection
    const isInMiniApp = sdk.isInMiniApp
    
    // User Agent detection
    const isMobileFarcaster = window.navigator.userAgent.includes('FarcasterMobile')
    
    // Domain detection
    const hasFarcasterDomain = 
      window.location.hostname.includes('farcaster') ||
      document.referrer.includes('farcaster')
    
    return isInMiniApp || isMobileFarcaster || hasFarcasterDomain
  } catch {
    return false
  }
}

const queryClient = new QueryClient()

// Unified wallet context
interface UnifiedWalletContextType {
  isConnected: boolean
  address: string | undefined
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  isFarcaster: boolean
  // Enhanced properties
  hasWalletAddress: boolean
  farcasterIdentity?: string
  canMakePayments: boolean
  connectionType: 'base-account' | 'farcaster-identity' | 'none'
  // Base Account SDK access
  baseAccountSDK: typeof baseAccountSDK
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | undefined>(undefined)

// Browser wallet using Base Account + Wagmi
function BaseAccountBrowserProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const connect = async () => {
    try {
      console.log('🚀 Starting Base Account connection...')
      setIsConnecting(true)
      
      // Find Base Account connector (added in wagmi.ts)
      const baseConnector = connectors.find(
        connector => connector.id === 'baseAccount'
      )
      
      if (baseConnector) {
        console.log('🎯 Using Base Account connector')
        await wagmiConnect({ connector: baseConnector })
        console.log('✅ Base Account connected via Wagmi')
      } else {
        console.log('⚠️ Base Account connector not found, using first available')
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

  const contextValue: UnifiedWalletContextType = {
    isConnected,
    address,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: false,
    hasWalletAddress: !!address,
    canMakePayments: !!address,
    connectionType: address ? 'base-account' : 'none',
    baseAccountSDK,
  }

  return (
    <UnifiedWalletContext.Provider value={contextValue}>
      {children}
    </UnifiedWalletContext.Provider>
  )
}

// Farcaster provider with dual authentication support
function FarcasterProvider({ children }: { children: ReactNode }) {
  const [farcasterIdentity, setFarcasterIdentity] = useState<string | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)
  const [localConnected, setLocalConnected] = useState(false)

  const { address, isConnected: wagmiConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  // Check for existing Farcaster session
  useEffect(() => {
    const checkFarcasterAuth = async () => {
      try {
        // Check SDK context
        const context = await sdk.context
        if (context?.user?.fid) {
          setFarcasterIdentity(`farcaster:${context.user.fid}`)
          setLocalConnected(true)
          console.log('✅ Found Farcaster identity:', context.user.fid)
        }

        // Check stored session
        const storedFid = localStorage.getItem('farcaster_fid')
        if (storedFid) {
          setFarcasterIdentity(`farcaster:${storedFid}`)
          setLocalConnected(true)
          console.log('📱 Restored Farcaster session:', storedFid)
        }
      } catch (error) {
        console.error('❌ Farcaster auth check failed:', error)
      }
    }

    checkFarcasterAuth()
  }, [])

  const connect = async () => {
    try {
      setIsConnecting(true)
      console.log('🚀 Starting Farcaster connection...')

      // Step 1: Establish Farcaster identity if not already present
      if (!farcasterIdentity) {
        try {
          console.log('🎯 Getting Farcaster identity...')
          const authResult = await sdk.actions.signIn()
          
          if (authResult && authResult.isLoggedIn) {
            const context = await sdk.context
            const fid = context?.user?.fid || authResult.fid || 'unknown'
            
            setFarcasterIdentity(`farcaster:${fid}`)
            localStorage.setItem('farcaster_fid', fid.toString())
            setLocalConnected(true)
            console.log('✅ Farcaster identity established:', fid)
          }
        } catch (identityError) {
          console.log('⚠️ Farcaster identity failed, proceeding with wallet connection')
        }
      }

      // Step 2: Connect wallet for payments (optional)
      if (!address) {
        try {
          console.log('💰 Connecting wallet for Base Pay...')
          
          const baseConnector = connectors.find(
            connector => connector.id === 'baseAccount'
          )
          
          if (baseConnector) {
            await wagmiConnect({ connector: baseConnector })
            console.log('✅ Base Account wallet connected')
          } else if (connectors.length > 0) {
            await wagmiConnect({ connector: connectors[0] })
            console.log('✅ Fallback wallet connected')
          }
        } catch (walletError) {
          console.log('⚠️ Wallet connection optional, continuing with identity')
        }
      }

      // Ensure some form of connection
      if (!localConnected && !wagmiConnected) {
        setLocalConnected(true)
      }

    } catch (error) {
      console.error('❌ Farcaster connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      if (wagmiConnected) {
        await wagmiDisconnect()
      }
      
      setLocalConnected(false)
      setFarcasterIdentity(undefined)
      localStorage.removeItem('farcaster_fid')
      
      console.log('✅ Farcaster disconnected')
    } catch (error) {
      console.error('❌ Farcaster disconnect error:', error)
    }
  }

  const currentAddress = address || farcasterIdentity
  const isConnected = localConnected || wagmiConnected
  const hasWalletAddress = !!address
  const canMakePayments = hasWalletAddress

  let connectionType: 'base-account' | 'farcaster-identity' | 'none' = 'none'
  if (address) connectionType = 'base-account'
  else if (farcasterIdentity) connectionType = 'farcaster-identity'

  const contextValue: UnifiedWalletContextType = {
    isConnected,
    address: currentAddress,
    connect,
    disconnect,
    isConnecting,
    isFarcaster: true,
    hasWalletAddress,
    farcasterIdentity,
    canMakePayments,
    connectionType,
    baseAccountSDK,
  }

  return (
    <UnifiedWalletContext.Provider value={contextValue}>
      <SdkInitializer />
      {children}
    </UnifiedWalletContext.Provider>
  )
}

// Main unified provider
export function UnifiedBaseWalletProvider({ children }: { children: ReactNode }) {
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsFarcaster(isFarcasterContext())
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>{children}</div>
  }

  const WalletProvider = isFarcaster ? FarcasterProvider : BaseAccountBrowserProvider

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Hook for accessing unified wallet context
export function useUnifiedWallet(): UnifiedWalletContextType {
  const context = useContext(UnifiedWalletContext)
  if (context === undefined) {
    throw new Error('useUnifiedWallet must be used within a UnifiedBaseWalletProvider')
  }
  return context
}