"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Shield, Smartphone } from "lucide-react"
import { useWallet } from "./providers/wallet-provider"

interface WalletConnectionProps {
  onConnect: (userData: any) => void
  isConnecting?: boolean
}

export function WalletConnection({ onConnect, isConnecting = false }: WalletConnectionProps) {
  const { isConnected, address, connect, isConnecting: walletConnecting, isFarcaster } = useWallet()

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address) {
      // Create user data from wallet connection
      const userData = {
        address,
        ensName: null, // Will be resolved separately
        talentScore: {
          identity: 0,
          builder: 0,
          overall: 0,
        },
        isFarcaster,
      }
      onConnect(userData)
    }
  }, [isConnected, address, onConnect, isFarcaster])

  const handleConnect = () => {
    connect()
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
          {isFarcaster ? (
            <Smartphone className="w-8 h-8 text-white" />
          ) : (
            <Wallet className="w-8 h-8 text-white" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {isFarcaster ? 'Connect your Farcaster wallet' : 'Choose your wallet'}
        </h3>
        <p className="text-gray-600 text-sm">
          {isFarcaster 
            ? 'Connect your wallet to join the pool and start earning yield'
            : 'Connect your wallet to join the pool and start earning yield'
          }
        </p>
      </div>

      {isFarcaster ? (
        // Farcaster Frame - Simple connect button
        <Card
          className="cursor-pointer border-2 transition-colors hover:border-blue-200 border-blue-500 bg-blue-50"
          onClick={handleConnect}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🟣</span>
              <div>
                <h4 className="font-medium text-gray-900">Farcaster Wallet</h4>
                <p className="text-sm text-gray-600">Connect using your Farcaster account</p>
              </div>
            </div>
            {(walletConnecting || isConnecting) && (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
          </CardContent>
        </Card>
      ) : (
        // Browser - Privy will handle the wallet selection
        <div className="space-y-3">
          <Card
            className="cursor-pointer border-2 transition-colors hover:border-blue-200 border-blue-500 bg-blue-50"
            onClick={handleConnect}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h4 className="font-medium text-gray-900">Connect Wallet 7</h4>
                  <p className="text-sm text-gray-600">Choose from MetaMask, Coinbase Wallet, WalletConnect and more</p>
                </div>
              </div>
              {(walletConnecting || isConnecting) && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure & Private</p>
            <p>
              {isFarcaster 
                ? "Your Farcaster identity and social connections help build trust with pool members."
                : "We'll verify your identity using ENS and Talent Protocol to build trust with other pool members."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
