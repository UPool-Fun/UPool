"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { 
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext
} from "@dynamic-labs/sdk-react-core"
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector"
import { createConfig, WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http } from "viem"
import { base, baseSepolia } from "viem/chains"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { sdk } from '@farcaster/miniapp-sdk'

// Environment detection
const isFarcasterMiniApp = () => {
  if (typeof window === 'undefined') return false
  return window.location.href.includes('farcaster') || 
         window.parent !== window || 
         !!window.navigator.userAgent.match(/Farcaster/i)
}

// Wagmi config for browser (Dynamic) - Base Sepolia for development
const browserConfig = createConfig({
  chains: [baseSepolia, base], // Sepolia first for development
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

// Wagmi config for Farcaster MiniApp - Base Sepolia for development
const miniAppConfig = createConfig({
  chains: [baseSepolia, base], // Sepolia first for development
  connectors: [miniAppConnector()],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

const queryClient = new QueryClient()

// Wallet context for unified interface
interface WalletContextType {
  isConnected: boolean
  address: string | undefined
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  isFarcasterMiniApp: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Browser wallet component (using Dynamic)
function BrowserWalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useDynamicContext()
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    setIsConnecting(true)
    try {
      // Dynamic handles the connection UI
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    // Dynamic handles disconnection
  }

  const contextValue: WalletContextType = {
    isConnected: isAuthenticated,
    address: user?.walletPublicKey,
    connect,
    disconnect,
    isConnecting,
    isFarcasterMiniApp: false,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Farcaster MiniApp wallet component
function MiniAppWalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const connect = () => {
    const miniAppConnector = connectors.find(c => c.id === 'farcasterMiniApp')
    if (miniAppConnector) {
      wagmiConnect({ connector: miniAppConnector })
    }
  }

  const contextValue: WalletContextType = {
    isConnected,
    address,
    connect,
    disconnect,
    isConnecting: isPending,
    isFarcasterMiniApp: true,
  }

  // Call ready() for Farcaster MiniApps
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sdk.actions.ready()
    }
  }, [])

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Main wallet provider that switches based on environment
export function WalletProvider({ children }: { children: ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isMinApp = isFarcasterMiniApp()
    console.log('Environment detection:', { isMinApp, href: window?.location?.href })
    setIsMiniApp(isMinApp)
  }, [])

  // Show loading during hydration
  if (!mounted) {
    return <div>{children}</div>
  }

  if (isMiniApp) {
    // Farcaster MiniApp mode
    console.log('Using Farcaster MiniApp mode')
    return (
      <WagmiProvider config={miniAppConfig}>
        <QueryClientProvider client={queryClient}>
          <MiniAppWalletProvider>
            {children}
          </MiniAppWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  // Browser mode with Dynamic
  console.log('Using Browser mode with Dynamic', process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID)
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "061ea13d-b5dd-420f-8def-07ecd7ad207f",
        walletConnectors: [EthereumWalletConnectors],
        appName: "UPool",
        appLogoUrl: "/logo.png",
      }}
    >
      <WagmiProvider config={browserConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <BrowserWalletProvider>
              {children}
            </BrowserWalletProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}

// Hook to use wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Wallet connection button component
export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state during hydration
  if (!mounted) {
    return (
      <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg animate-pulse">
        Loading...
      </button>
    )
  }

  try {
    const { isConnected, address, connect, disconnect, isConnecting, isFarcasterMiniApp } = useWallet()
    
    console.log('WalletConnectButton state:', { isConnected, address, isConnecting, isFarcasterMiniApp })

    if (isConnected && address) {
      return (
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
            <span className="mr-1">🔵</span>
            Base Sepolia
          </div>
          <span className="text-sm text-gray-600">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={disconnect}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Disconnect
          </button>
        </div>
      )
    }

    if (isFarcasterMiniApp) {
      return (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )
    }

    // For browser mode, use Dynamic's built-in widget
    console.log('Rendering DynamicWidget')
    return <DynamicWidget />
  } catch (error) {
    // Fallback if wallet context isn't available
    console.error('WalletConnectButton error:', error)
    return (
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Connect Wallet (Fallback)
      </button>
    )
  }
}