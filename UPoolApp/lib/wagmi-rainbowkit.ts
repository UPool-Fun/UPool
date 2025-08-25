import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

export const config = getDefaultConfig({
  appName: 'UPool - Social Funding Platform',
  projectId,
  chains: [base, baseSepolia],
  ssr: true, // Enable server-side rendering
})

// Export chain configurations for use in components
export const targetChain = process.env.NODE_ENV === 'production' ? base : baseSepolia
export { base, baseSepolia }