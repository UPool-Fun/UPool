import { http, createConfig } from 'wagmi'
import { base, baseSepolia, mainnet } from 'wagmi/chains'
import { injected, walletConnect, baseAccount } from 'wagmi/connectors'
import { detectEnvironment } from './environment-detection'

// Get chain configuration from environment variables
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")

// Select the appropriate chain based on the chain ID
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

// WalletConnect project ID is required for WalletConnect v2
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Create transports object with proper typing for all supported chains
const transports = {
  [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE || 'https://mainnet.base.org'),
  [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org'),
  [mainnet.id]: http(), // For ENS resolution and broader compatibility
} as const

// Configure supported chains for multi-environment support
const supportedChains = [targetChain, mainnet] // Always include mainnet for ENS

/**
 * Get environment-appropriate connectors
 * Browser: Base Account (primary) + WalletConnect + Injected
 * Farcaster: Injected (primary) - wallet is pre-connected (NO WalletConnect to prevent double init)
 */
function getConnectors() {
  // On server-side, provide default browser connectors
  if (typeof window === 'undefined') {
    return [
      baseAccount({
        appName: 'UPool',
      }),
      injected({
        shimDisconnect: true,
      }),
      walletConnect({
        projectId,
        showQrModal: true,
        metadata: {
          name: 'UPool',
          description: 'Social funding pools that grow together',
          url: process.env.NEXT_PUBLIC_URL || 'https://upool.fun',
          icons: [process.env.NEXT_PUBLIC_IMAGE_URL || 'https://upool.fun/logo.png'],
        },
      }),
    ]
  }

  const environment = detectEnvironment()
  
  switch (environment) {
    case 'farcaster-web':
    case 'farcaster-mobile':
      // In Farcaster, user wallet is pre-connected
      // ONLY use injected connector to prevent WalletConnect double initialization
      console.log('🔧 WalletConnect disabled in Farcaster environment to prevent double initialization')
      return [
        injected({
          shimDisconnect: true,
        }),
        // Note: @farcaster/miniapp-wagmi-connector would be added here when available
        // farcasterMiniApp(),
        
        // Keep Base Account as fallback for compatibility (but no WalletConnect)
        baseAccount({
          appName: 'UPool',
        }),
      ]
      
    case 'browser':
    default:
      // Browser environment - prioritize Base Account for best UX
      return [
        baseAccount({
          appName: 'UPool',
        }),
        injected({
          shimDisconnect: true,
        }),
        walletConnect({
          projectId,
          showQrModal: true,
          metadata: {
            name: 'UPool',
            description: 'Social funding pools that grow together',
            url: process.env.NEXT_PUBLIC_URL || 'https://upool.fun',
            icons: [process.env.NEXT_PUBLIC_IMAGE_URL || 'https://upool.fun/logo.png'],
          },
        }),
      ]
  }
}

// Create wagmi configuration with environment-aware settings
export const config = createConfig({
  chains: supportedChains,
  transports,
  connectors: getConnectors(),
  ssr: true,
  // Enable batch requests for better performance
  batch: {
    multicall: true,
  },
})

/**
 * Create Farcaster-specific wagmi configuration
 * Used by Farcaster providers for optimal performance in Mini App environment
 */
export const farcasterConfig = createConfig({
  chains: [targetChain], // Only target chain for Farcaster (simpler setup)
  transports: {
    [targetChain.id]: transports[targetChain.id],
  },
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    // Future: Add farcasterMiniApp() when connector is available
  ],
  ssr: true,
  batch: {
    multicall: true,
  },
})

/**
 * Environment-aware configuration getter
 * Returns appropriate config based on detected environment
 */
export function getWagmiConfig() {
  if (typeof window === 'undefined') {
    return config // Default config for SSR
  }
  
  const environment = detectEnvironment()
  
  switch (environment) {
    case 'farcaster-web':
    case 'farcaster-mobile':
      return farcasterConfig // Simplified config for Farcaster
    case 'browser':
    default:
      return config // Full config for browser
  }
}

/**
 * Utility to check if a specific connector is available
 */
export function isConnectorAvailable(connectorId: string): boolean {
  const currentConfig = getWagmiConfig()
  return currentConfig.connectors.some(connector => connector.id === connectorId)
}

/**
 * Get the preferred connector for the current environment
 */
export function getPreferredConnector(): string {
  const environment = typeof window !== 'undefined' ? detectEnvironment() : 'browser'
  
  switch (environment) {
    case 'farcaster-web':
    case 'farcaster-mobile':
      return 'injected' // Pre-connected Farcaster wallet
    case 'browser':
    default:
      return 'baseAccount' // Base Account for best browser UX
  }
}