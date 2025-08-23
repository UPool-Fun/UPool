"use client"

import React, { ReactNode } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'

// Get chain configuration from environment variables
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitContextProvider({ children }: MiniKitProviderProps) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
      chain={targetChain}
      config={{
        appearance: {
          mode: 'auto',
          theme: 'default'
        }
      }}
    >
      {children}
    </OnchainKitProvider>
  )
}