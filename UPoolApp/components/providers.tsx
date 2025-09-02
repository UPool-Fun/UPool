'use client'

import { ReactNode, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { ThemeProvider } from 'next-themes'
import { base, baseSepolia } from 'wagmi/chains'
import { config } from '@/lib/wagmi'
import { detectEnvironment, logEnvironmentInfo, type AppEnvironment } from '@/lib/environment-detection'
import { FarcasterWebProviders, FarcasterMobileProviders } from '@/components/providers/farcaster-providers'
import { DualWalletProvider } from '@/components/providers/dual-wallet-provider'

// Get chain configuration from environment
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

const queryClient = new QueryClient()

/**
 * Browser Environment Provider Stack (Default for UPool)
 * Full Base Account + WalletConnect + wagmi setup for web browsers
 */
function BrowserProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || process.env.NEXT_PUBLIC_CDP_API_KEY}
        chain={targetChain}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DualWalletProvider>
              {children}
            </DualWalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </OnchainKitProvider>
    </ThemeProvider>
  )
}

/**
 * Multi-Environment Provider System for UPool
 * Detects environment and loads appropriate provider stack
 * Based on exampleApp patterns with UPool-specific adaptations
 */
export function Providers({ children }: { children: ReactNode }) {
  const [environment, setEnvironment] = useState<AppEnvironment>('browser')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Detect environment on client-side only
    const env = detectEnvironment()
    setEnvironment(env)
    setIsLoading(false)
    
    // Log environment info for debugging (UPool-specific logging)
    logEnvironmentInfo()
    
    console.log('🚀 UPool Multi-Environment Provider System Active')
    console.log(`📱 Environment: ${env}`)
    console.log('💰 Wallet System: Enhanced Base Account + Farcaster integration')
    
    // Log known warnings and their status
    console.log('⚠️  Known Dependency Warnings (expected):')
    console.log('   • @farcaster/frame-sdk deprecation (from @coinbase/onchainkit) - awaiting OnchainKit update')
    if (env === 'browser') {
      console.log('   • Multiple Lit versions (from WalletConnect UI) - browser environment only')
    }
  }, [])

  // Loading state while detecting environment
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Detecting environment...</p>
          <p className="text-gray-500 text-sm text-center mt-2">UPool initializing...</p>
        </div>
      </div>
    )
  }

  // Route to appropriate provider stack based on detected environment
  switch (environment) {
    case 'farcaster-web':
      console.log('🎯 Loading UPool Farcaster Web Providers (WalletConnect disabled)')
      return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <FarcasterWebProviders>
            {children}
          </FarcasterWebProviders>
        </ThemeProvider>
      )

    case 'farcaster-mobile':
      console.log('📱 Loading UPool Farcaster Mobile Providers (WalletConnect disabled)')
      return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <FarcasterMobileProviders>
            {children}
          </FarcasterMobileProviders>
        </ThemeProvider>
      )

    case 'browser':
    default:
      console.log('🌐 Loading UPool Browser Providers (Base Account + WalletConnect)')
      console.log('⚠️  Note: WalletConnect dependencies may load multiple Lit versions - this is expected')
      return (
        <BrowserProviders>
          {children}
        </BrowserProviders>
      )
  }
}