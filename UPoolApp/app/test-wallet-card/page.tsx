'use client'

import { WalletAddressCard } from '@/components/wallet-address-card'

export default function TestWalletCard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center">Wallet Address Card Test</h1>
        
        <div className="space-y-6">
          <WalletAddressCard
            address="0x742C4F0e2C2A7e5c26Ed72aF2e2F0B8e8A5D2B1c"
            title="Test Ethereum Wallet"
            description="This is a test Ethereum wallet address"
            isFarcaster={false}
          />
          
          <WalletAddressCard
            address="farcaster:12345"
            title="Test Farcaster ID"
            description="This is a test Farcaster user ID"
            isFarcaster={true}
          />
          
          <WalletAddressCard
            address="0x1234567890123456789012345678901234567890"
            title="Pool Contribution Address"
            description="Send funds directly to support this pool"
            isFarcaster={false}
            className="border-solid border-green-200 bg-green-50/50"
          />
        </div>
      </div>
    </div>
  )
}