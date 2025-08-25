'use client'

import { ReactNode } from 'react'
import { DualWalletProvider } from '@/components/providers/dual-wallet-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DualWalletProvider>
      {children}
    </DualWalletProvider>
  )
}