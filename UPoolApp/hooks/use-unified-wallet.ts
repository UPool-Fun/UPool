import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'
import { sdk } from '@farcaster/miniapp-sdk'
import { detectEnvironment, isFarcasterEnvironment, checkFarcasterWalletStatus, type AppEnvironment } from '@/lib/environment-detection'
import { getPreferredConnector, isConnectorAvailable } from '@/lib/wagmi'
import { uPoolTxHelper } from '@/lib/viem-utils'

// Get target chain from environment
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

/**
 * Unified wallet state interface
 * Works consistently across browser and Farcaster environments
 */
interface UnifiedWalletState {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  
  // Address and identity
  address: string | undefined
  fid: number | undefined // Farcaster ID if available
  
  // Environment info
  environment: AppEnvironment
  isFarcaster: boolean
  
  // Network state
  chainId: number | undefined
  isCorrectNetwork: boolean
  
  // Transaction capabilities
  canTransact: boolean
  canSwitchNetwork: boolean
  
  // Connection methods
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchToCorrectNetwork: () => Promise<boolean>
  
  // Farcaster-specific methods
  getFarcasterUserInfo: () => Promise<any>
  shareFarcasterContent: (content: any) => Promise<any>
  
  // Error state
  error: string | null
}

/**
 * Unified wallet hook that works across browser and Farcaster environments
 * Based on exampleApp patterns with UPool-specific adaptations
 */
export function useUnifiedWallet(): UnifiedWalletState {
  // Environment detection
  const [environment, setEnvironment] = useState<AppEnvironment>('browser')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Farcaster-specific state
  const [fid, setFid] = useState<number | undefined>()
  const [farcasterAddress, setFarcasterAddress] = useState<string | undefined>()
  const [farcasterConnected, setFarcasterConnected] = useState(false)
  
  // Wagmi hooks (always available, used conditionally based on environment)
  const { 
    address: wagmiAddress, 
    isConnected: wagmiConnected, 
    isConnecting: wagmiConnecting,
    isReconnecting: wagmiReconnecting,
  } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  // Environment detection and initialization
  useEffect(() => {
    const initializeEnvironment = async () => {
      try {
        const detectedEnv = detectEnvironment()
        setEnvironment(detectedEnv)
        setMounted(true)
        
        console.log(`🎯 Unified wallet initialized for ${detectedEnv} environment`)
        
        // If Farcaster environment, check for existing authentication
        if (isFarcasterEnvironment() && detectedEnv !== 'browser') {
          console.log('🔍 Checking Farcaster wallet status...')
          
          const walletStatus = await checkFarcasterWalletStatus()
          if (walletStatus.hasWallet) {
            setFarcasterConnected(true)
            setFarcasterAddress(walletStatus.address)
            setFid(walletStatus.fid)
            console.log('✅ Found existing Farcaster wallet connection')
          }
        }
      } catch (error) {
        console.error('❌ Environment initialization error:', error)
        setError(`Environment setup failed: ${error}`)
        setEnvironment('browser') // Fallback to browser
        setMounted(true)
      }
    }

    initializeEnvironment()
  }, [])

  // Determine final connection state based on environment
  const isConnected = mounted ? (
    environment === 'browser' ? wagmiConnected : farcasterConnected
  ) : false

  const address = mounted ? (
    environment === 'browser' ? wagmiAddress : farcasterAddress
  ) : undefined

  const isConnecting = mounted ? (
    environment === 'browser' ? wagmiConnecting : false
  ) : false

  const isReconnecting = mounted ? (
    environment === 'browser' ? wagmiReconnecting : false
  ) : false

  // Network state
  const isCorrectNetwork = chainId === targetChain.id
  const canSwitchNetwork = environment === 'browser' && !isFarcasterEnvironment()
  const canTransact = isConnected && uPoolTxHelper.canSendTransactions()

  // Connection method - environment aware
  const connect = useCallback(async (): Promise<void> => {
    setError(null)
    
    try {
      if (environment === 'browser') {
        console.log('🔌 Connecting in browser environment...')
        
        // Find preferred connector (Base Account for browser)
        const preferredConnectorId = getPreferredConnector()
        const preferredConnector = connectors.find(c => c.id === preferredConnectorId)
        
        if (preferredConnector && isConnectorAvailable(preferredConnectorId)) {
          console.log(`🎯 Using ${preferredConnectorId} connector`)
          await wagmiConnect({ connector: preferredConnector })
        } else {
          // Fallback to first available connector
          if (connectors.length > 0) {
            console.log('⚠️ Preferred connector not available, using first available')
            await wagmiConnect({ connector: connectors[0] })
          } else {
            throw new Error('No wallet connectors available')
          }
        }
      } else {
        console.log('🔌 Connecting in Farcaster environment...')
        
        // Farcaster authentication via SDK
        if (sdk && sdk.actions && typeof sdk.actions.signIn === 'function') {
          const result = await sdk.actions.signIn()
          console.log('🎯 Farcaster sign-in result:', result)
          
          if (result && result.isLoggedIn) {
            setFarcasterConnected(true)
            
            // Get user context
            const context = await sdk.context
            if (context?.user?.fid) {
              setFid(context.user.fid)
              setFarcasterAddress(`farcaster:${context.user.fid}`)
              console.log('✅ Farcaster authentication successful')
            }
          } else {
            throw new Error('Farcaster authentication failed')
          }
        } else {
          throw new Error('Farcaster SDK not available or not properly initialized')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error'
      console.error('❌ Connection failed:', errorMessage)
      setError(errorMessage)
      throw error
    }
  }, [environment, connectors, wagmiConnect])

  // Disconnect method - environment aware
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      if (environment === 'browser') {
        console.log('🔌 Disconnecting in browser environment...')
        await wagmiDisconnect()
      } else {
        console.log('🔌 Disconnecting in Farcaster environment...')
        setFarcasterConnected(false)
        setFarcasterAddress(undefined)
        setFid(undefined)
      }
      
      setError(null)
      console.log('✅ Disconnected successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown disconnection error'
      console.error('❌ Disconnection failed:', errorMessage)
      setError(errorMessage)
    }
  }, [environment, wagmiDisconnect])

  // Network switching (browser only)
  const switchToCorrectNetwork = useCallback(async (): Promise<boolean> => {
    if (!canSwitchNetwork) {
      console.log('ℹ️ Network switching not available in this environment')
      return false
    }

    try {
      console.log(`🔄 Switching to ${targetChain.name} (${targetChain.id})...`)
      await switchChain({ chainId: targetChain.id })
      console.log('✅ Network switch successful')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network switch failed'
      console.error('❌ Network switch error:', errorMessage)
      setError(errorMessage)
      return false
    }
  }, [canSwitchNetwork, switchChain, targetChain])

  // Farcaster-specific methods
  const getFarcasterUserInfo = useCallback(async () => {
    if (!isFarcasterEnvironment() || !sdk) {
      return null
    }

    try {
      const context = await sdk.context
      return context?.user || null
    } catch (error) {
      console.error('❌ Failed to get Farcaster user info:', error)
      return null
    }
  }, [])

  const shareFarcasterContent = useCallback(async (content: any) => {
    if (!isFarcasterEnvironment() || typeof window === 'undefined') {
      return null
    }

    try {
      if ((window as any).farcaster && (window as any).farcaster.share) {
        return await (window as any).farcaster.share(content)
      }
      return null
    } catch (error) {
      console.error('❌ Failed to share Farcaster content:', error)
      return null
    }
  }, [])

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('🎯 Unified wallet state:', {
        environment,
        isConnected,
        address,
        fid,
        chainId,
        isCorrectNetwork,
        canTransact,
        canSwitchNetwork
      })
    }
  }, [mounted, environment, isConnected, address, fid, chainId, isCorrectNetwork, canTransact, canSwitchNetwork])

  return {
    // Connection state
    isConnected,
    isConnecting: isConnecting || isSwitchingChain,
    isReconnecting,
    
    // Address and identity
    address,
    fid,
    
    // Environment info
    environment,
    isFarcaster: isFarcasterEnvironment(),
    
    // Network state
    chainId,
    isCorrectNetwork,
    
    // Transaction capabilities
    canTransact,
    canSwitchNetwork,
    
    // Connection methods
    connect,
    disconnect,
    switchToCorrectNetwork,
    
    // Farcaster-specific methods
    getFarcasterUserInfo,
    shareFarcasterContent,
    
    // Error state
    error,
  }
}