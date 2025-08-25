import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect, baseAccount } from 'wagmi/connectors'

// Get chain configuration from environment variables
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")

// Select the appropriate chain based on the chain ID
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

// WalletConnect project ID is required for WalletConnect v2
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Create transports object with proper typing for both chains
const transports = {
  [base.id]: http(),
  [baseSepolia.id]: http(),
} as const

// Configure chain-specific settings
const chainConfig = {
  [base.id]: {
    ...base,
    rpcUrls: {
      ...base.rpcUrls,
      default: { http: [process.env.NEXT_PUBLIC_RPC_URL_BASE || 'https://mainnet.base.org'] },
    }
  },
  [baseSepolia.id]: {
    ...baseSepolia,
    rpcUrls: {
      ...baseSepolia.rpcUrls,
      default: { http: [process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org'] },
    }
  }
}

// Use the chain config for the target chain
const configuredChain = chainConfig[targetChain.id]

export const config = createConfig({
  chains: [configuredChain],
  transports,
  connectors: [
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
  ],
  ssr: true,
})