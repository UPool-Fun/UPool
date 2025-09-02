"use client"

import { PropsWithChildren } from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "@/lib/wagmi"

// Create a separate query client for browser environment
const browserQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: true, // Enable in browser environment
    },
  },
})

/**
 * Browser Environment Provider Stack
 * Maintains existing Privy + Wagmi integration for traditional web browsers
 */
export function BrowserProviders({ children }: PropsWithChildren) {
  console.log('🌐 Browser Environment Active - Privy Integration')
  
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmdj78523003jjo0lfaifpl8h"}
      config={{
        loginMethods: ['wallet', 'email', 'sms'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/logo.png'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={browserQueryClient}>
          <BrowserWrapper>
            {children}
          </BrowserWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}

/**
 * Browser Environment Wrapper
 * Handles browser-specific optimizations and traditional web features
 */
function BrowserWrapper({ children }: PropsWithChildren) {
  return (
    <div className="browser-web-app">
      {children}
    </div>
  )
}