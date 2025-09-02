"use client"

// Environment detection utilities for UPool Multi-Platform support
// Supports: Web Browser, Farcaster Web Client, Farcaster Mobile App
// Based on exampleApp patterns with UPool-specific optimizations

export type AppEnvironment = 'browser' | 'farcaster-web' | 'farcaster-mobile'

/**
 * Detect the current application environment
 * Returns the environment type for proper provider and wallet configuration
 */
export function detectEnvironment(): AppEnvironment {
  // Server-side rendering - default to browser
  if (typeof window === 'undefined') {
    return 'browser'
  }

  // Primary Farcaster detection - check for SDK availability
  const hasFarcasterSDK = !!(window as any).farcaster || !!(window as any).sdk || !!(window as any).minikit
  const hasReadyFunction = typeof (window as any).ready === 'function'
  
  if (hasFarcasterSDK || hasReadyFunction) {
    console.log('🎯 Farcaster environment detected via SDK', {
      farcaster: !!(window as any).farcaster,
      sdk: !!(window as any).sdk,
      minikit: !!(window as any).minikit,
      ready: hasReadyFunction
    })
    
    // Check if mobile based on user agent and viewport
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768

    return isMobile ? 'farcaster-mobile' : 'farcaster-web'
  }

  // Secondary detection - check user agent for Farcaster-specific strings  
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('farcaster') || userAgent.includes('miniapp') || userAgent.includes('farcastermobile')) {
      console.log('🎯 Farcaster user agent detected')
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
      return isMobile ? 'farcaster-mobile' : 'farcaster-web'
    }
  }

  // Tertiary detection - check for development/production domains (ngrok, vercel, etc.)
  if (typeof window !== 'undefined') {
    const hostname = window.location?.hostname || ''
    if (hostname.includes('ngrok.io') || hostname.includes('vercel.app') || hostname.includes('codalabs.ngrok.io')) {
      // In dev environments, we need to be more careful about detection
      // Only assume Farcaster if we have strong indicators
      const strongFarcasterIndicators = hasFarcasterSDK || hasReadyFunction
      if (strongFarcasterIndicators) {
        console.log(`🔧 Domain detected: ${hostname} with Farcaster indicators`)
        const isMobile = window.innerWidth < 768
        return isMobile ? 'farcaster-mobile' : 'farcaster-web'
      }
    }
  }

  // Default to browser environment
  console.log('🌐 Browser environment detected (default)')
  return 'browser'
}

/**
 * Check if running in any Farcaster environment
 */
export function isFarcasterEnvironment(): boolean {
  const env = detectEnvironment()
  return env === 'farcaster-web' || env === 'farcaster-mobile'
}

/**
 * Check if running in browser environment
 */
export function isBrowserEnvironment(): boolean {
  return detectEnvironment() === 'browser'
}

/**
 * Check if wallet is already connected in Farcaster environment
 * In Farcaster, users are pre-authenticated with wallet access
 */
export async function checkFarcasterWalletStatus(): Promise<{
  hasWallet: boolean
  address?: string
  fid?: number
}> {
  if (!isFarcasterEnvironment()) {
    return { hasWallet: false }
  }

  try {
    // For UPool, we need to check if we can access the connected wallet via wagmi
    // In Farcaster, the user's wallet is already connected through the app
    
    // Check for Farcaster context first
    if ((window as any).sdk) {
      const context = await (window as any).sdk.context
      if (context?.user?.fid) {
        return {
          hasWallet: true,
          fid: context.user.fid,
          address: `farcaster:${context.user.fid}` // UPool uses FID-based addressing
        }
      }
    }

    // Fallback: check for direct Farcaster wallet access
    if ((window as any).farcaster && (window as any).farcaster.request) {
      try {
        const accounts = await (window as any).farcaster.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          return {
            hasWallet: true,
            address: accounts[0]
          }
        }
      } catch (error) {
        console.log('Farcaster wallet access not available:', error)
      }
    }

    return { hasWallet: false }
  } catch (error) {
    console.error('Error checking Farcaster wallet status:', error)
    return { hasWallet: false }
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(environment: AppEnvironment) {
  const baseConfig = {
    appName: 'UPool - Social Funding Platform',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  }

  switch (environment) {
    case 'browser':
      return {
        ...baseConfig,
        providersNeeded: ['wagmi', 'onchainkit', 'auth'],
        walletSupport: 'full', // Base Account + WalletConnect + injected
        features: ['base-account', 'wallet-connect', 'manual-network-switch', 'full-ui'],
        preferredConnector: 'baseAccount' // UPool uses Base Account as primary
      }
      
    case 'farcaster-web':
      return {
        ...baseConfig,
        providersNeeded: ['wagmi', 'farcaster-sdk', 'onchainkit'],
        walletSupport: 'farcaster-native', // Farcaster wallet integration
        features: ['farcaster-auth', 'pre-connected-wallet', 'frame-integration'],
        preferredConnector: 'farcasterMiniApp'
      }
      
    case 'farcaster-mobile':
      return {
        ...baseConfig,
        providersNeeded: ['wagmi', 'farcaster-sdk', 'onchainkit'],
        walletSupport: 'farcaster-native', // Mobile Farcaster wallet
        features: ['mobile-optimized', 'farcaster-auth', 'native-ui', 'pre-connected-wallet'],
        preferredConnector: 'farcasterMiniApp'
      }
      
    default:
      return baseConfig
  }
}

/**
 * Environment-specific logging with UPool context
 */
export function logEnvironmentInfo() {
  const env = detectEnvironment()
  const config = getEnvironmentConfig(env)
  
  console.log('🎯 UPool Environment Detection Results:')
  console.log('📱 Environment:', env)
  console.log('⚙️ Configuration:', config)
  console.log('🔗 User Agent:', navigator?.userAgent || 'N/A')
  console.log('📏 Viewport:', `${window?.innerWidth || 0}x${window?.innerHeight || 0}`)
  console.log('🪟 Window objects:', {
    farcaster: !!(window as any)?.farcaster,
    sdk: !!(window as any)?.sdk,
    minikit: !!(window as any)?.minikit,
    ethereum: !!(window as any)?.ethereum,
    upool: 'environment-detection-active'
  })
  
  // UPool-specific logging
  if (env !== 'browser') {
    console.log('🟣 Farcaster mode: User wallet should be pre-connected')
    console.log('💡 UPool will use FID-based authentication in this environment')
  } else {
    console.log('🌐 Browser mode: User will connect via Base Account or WalletConnect')
    console.log('💡 UPool will use traditional wallet connection flow')
  }
}

/**
 * Check if current environment supports smart contract interactions via wagmi/viem
 */
export function supportsSmartContracts(): boolean {
  const env = detectEnvironment()
  
  switch (env) {
    case 'browser':
      return true // Full smart contract support via Base Account + wagmi
    case 'farcaster-web':
    case 'farcaster-mobile':
      return true // Smart contract support via Farcaster wallet + wagmi
    default:
      return false
  }
}

/**
 * Get the appropriate wagmi connector for the current environment
 */
export function getPreferredWagmiConnector(environment?: AppEnvironment): string {
  const env = environment || detectEnvironment()
  const config = getEnvironmentConfig(env)
  return config.preferredConnector || 'baseAccount'
}