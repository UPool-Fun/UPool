'use client'

import { useWallet } from '@/components/providers/dual-wallet-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useTokenBalances, TOKEN_ADDRESSES } from '@/hooks/use-token-balances'
import { Copy, ExternalLink, Settings, Wallet, DollarSign, Info, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/header'
import Link from 'next/link'

export default function SettingsPage() {
  const [clientMounted, setClientMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  // Safe wallet context usage with SSR protection
  let address: string | undefined
  let isConnected = false
  let isFarcaster = false
  let wagmiAddress: string | undefined
  
  try {
    const walletContext = useWallet()
    address = walletContext?.address
    isConnected = walletContext?.isConnected || false
    isFarcaster = walletContext?.isFarcaster || false
  } catch (error) {
    // Handle SSR or provider not available
    address = undefined
    isConnected = false
    isFarcaster = false
  }

  try {
    const wagmiAccount = useAccount()
    wagmiAddress = wagmiAccount?.address
  } catch (error) {
    wagmiAddress = undefined
  }

  // Use the appropriate address based on environment
  const walletAddress = address || wagmiAddress

  // Client-side mounting check
  useEffect(() => {
    setClientMounted(true)
  }, [])

  // Disconnect function
  const handleDisconnect = async () => {
    try {
      const walletContext = useWallet()
      if (walletContext?.disconnect) {
        await walletContext.disconnect()
        toast.success('Wallet disconnected successfully')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  // Get token balances
  const { 
    ethBalance, 
    usdcBalance, 
    eurcBalance, 
    isLoading, 
    error 
  } = useTokenBalances(walletAddress)

  const copyAddress = async () => {
    if (!walletAddress) return
    
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy address')
    }
  }

  const copyTokenAddress = async (address: string, tokenName: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success(`${tokenName} contract address copied to clipboard`)
    } catch (err) {
      toast.error('Failed to copy contract address')
    }
  }

  const formatBalance = (balance: string | undefined, symbol: string) => {
    if (!balance) return `0.0000 ${symbol}`
    const num = parseFloat(balance)
    return `${num.toFixed(4)} ${symbol}`
  }

  const openInExplorer = () => {
    if (!walletAddress) return
    const explorerUrl = `https://base-sepolia.blockscout.com/address/${walletAddress}`
    window.open(explorerUrl, '_blank')
  }

  const openTokenInExplorer = (tokenAddress: string) => {
    if (tokenAddress === 'Native') {
      // For ETH, open the Base Sepolia network page instead of a contract
      window.open('https://base-sepolia.blockscout.com', '_blank')
      return
    }
    const explorerUrl = `https://base-sepolia.blockscout.com/address/${tokenAddress}`
    window.open(explorerUrl, '_blank')
  }

  // Only show content after client has mounted to prevent hydration issues
  if (!clientMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Header showCreateButton={true} />
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Header showCreateButton={true} />
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="text-center py-16">
            <Settings className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access settings
            </p>
            <Link href="/">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Header showCreateButton={true} />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your wallet and account settings
          </p>
        </div>

        {/* Wallet Information Card */}
        <Card className="mb-6 border-blue-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  Wallet Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your connected wallet details and current balances
                </CardDescription>
              </div>
              <Badge 
                variant={isFarcaster ? "default" : "secondary"}
                className={isFarcaster ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
              >
                {isFarcaster ? "Farcaster" : "Browser"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Wallet Address */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Wallet Address
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono break-all text-gray-800">
                  {walletAddress || 'No address available'}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAddress}
                  disabled={!walletAddress}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openInExplorer}
                  disabled={!walletAddress}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Token Balances */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">
                Token Balances
              </label>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-blue-100 rounded-lg animate-pulse bg-gradient-to-br from-blue-50/50 to-emerald-50/50">
                    <div className="h-4 bg-blue-100 rounded mb-2"></div>
                    <div className="h-6 bg-blue-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 border border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
                <p className="text-red-600 text-sm font-medium">
                  Failed to load balances: {error}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ETH Balance */}
                <Card className="border-blue-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">ETH</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatBalance(ethBalance, 'ETH')}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="flex-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate">
                        Native Token
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => copyTokenAddress('Native Token - No Contract Address', 'ETH')}
                        title="ETH is a native token"
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => openTokenInExplorer('Native')}
                        title="View ETH on explorer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* USDC Balance */}
                <Card className="border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">USDC</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatBalance(usdcBalance, 'USDC')}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="flex-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate">
                        {TOKEN_ADDRESSES.USDC}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => copyTokenAddress(TOKEN_ADDRESSES.USDC, 'USDC')}
                        title="Copy USDC contract address"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => openTokenInExplorer(TOKEN_ADDRESSES.USDC)}
                        title="View USDC contract on explorer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* EURC Balance */}
                <Card className="border-purple-200 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">EURC</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatBalance(eurcBalance, 'EURC')}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="flex-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate">
                        {TOKEN_ADDRESSES.EURC}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-50"
                        onClick={() => copyTokenAddress(TOKEN_ADDRESSES.EURC, 'EURC')}
                        title="Copy EURC contract address"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-50"
                        onClick={() => openTokenInExplorer(TOKEN_ADDRESSES.EURC)}
                        title="View EURC contract on explorer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="destructive" 
              onClick={handleDisconnect} 
              className="flex-1 hover:bg-red-600"
            >
              Disconnect Wallet
            </Button>
            <Button 
              variant="outline" 
              onClick={openInExplorer} 
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Information */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-blue-100">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Network Information
          </CardTitle>
          <CardDescription className="text-gray-600">
            Current network and connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium text-gray-900">Base Sepolia Testnet</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-600">Chain ID:</span>
              <span className="font-medium text-gray-900">84532</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium text-gray-900">
                {isFarcaster ? 'Farcaster Mini App' : 'Web Browser'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-600">Explorer:</span>
              <a 
                href="https://base-sepolia.blockscout.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Blockscout
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}