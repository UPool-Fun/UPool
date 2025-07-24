"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Shield } from "lucide-react"

interface WalletConnectionProps {
  onConnect: (userData: any) => void
  isConnecting?: boolean
}

export function WalletConnection({ onConnect, isConnecting = false }: WalletConnectionProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask wallet",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Connect using Coinbase Wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗",
      description: "Connect using WalletConnect",
    },
  ]

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock user data
    const mockUserData = {
      address: "0x1234...5678",
      ensName: "john.eth",
      talentScore: {
        identity: 85,
        builder: 72,
        overall: 78,
      },
    }

    onConnect(mockUserData)
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Choose your wallet</h3>
        <p className="text-gray-600 text-sm">Connect your wallet to join the pool and start earning yield</p>
      </div>

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <Card
            key={wallet.id}
            className={`cursor-pointer border-2 transition-colors hover:border-blue-200 ${
              selectedWallet === wallet.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
            onClick={() => handleConnect(wallet.id)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                  <p className="text-sm text-gray-600">{wallet.description}</p>
                </div>
              </div>
              {selectedWallet === wallet.id && isConnecting && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure & Private</p>
            <p>We'll verify your identity using ENS and Talent Protocol to build trust with other pool members.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
