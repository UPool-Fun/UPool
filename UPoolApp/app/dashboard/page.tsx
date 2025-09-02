"use client"

import { useState, useEffect } from "react"
import { useWallet } from '@/components/providers/dual-wallet-provider'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, Plus, ArrowRight, Wallet, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { WagmiWalletInfo } from "@/components/wagmi-wallet-info"
import { PoolService } from '@/lib/pool-service'
import { PoolDocument } from '@/lib/firestore-schema'

export default function Dashboard() {
  const [userPools, setUserPools] = useState<PoolDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientMounted, setClientMounted] = useState(false)

  // Safe wallet context usage with SSR protection
  let address: string | undefined
  let isConnected = false
  
  try {
    const walletContext = useWallet()
    address = walletContext?.address
    isConnected = walletContext?.isConnected || false
  } catch (error) {
    // Handle SSR or provider not available
    address = undefined
    isConnected = false
  }

  // Client-side mounting check
  useEffect(() => {
    setClientMounted(true)
  }, [])

  // Load user's pools
  useEffect(() => {
    const loadUserPools = async () => {
      if (!clientMounted || !address || !isConnected) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const pools = await PoolService.getPoolsByCreator(address)
        setUserPools(pools)
        setError(null)
      } catch (err) {
        console.error('Error loading user pools:', err)
        setError('Failed to load your pools')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserPools()
  }, [address, isConnected, clientMounted])

  // Show loading during hydration
  if (!clientMounted) {
    return <div>Loading...</div>
  }

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Header showCreateButton={true} showExploreButton={false} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <Wallet className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to view and manage your funding pools.
                </p>
                <p className="text-sm text-gray-500">
                  Use the "Connect" button in the header to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Header showCreateButton={true} showExploreButton={false} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Header showCreateButton={true} showExploreButton={false} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Pools</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>
      case 'pending_payment':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Payment</Badge>
      case 'payment_processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-700">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'draft':
        return <Clock className="w-5 h-5 text-gray-600" />
      case 'pending_payment':
      case 'payment_processing':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-purple-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Header showCreateButton={true} showExploreButton={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Manage your funding pools and track progress
                </p>
              </div>
              <Link href="/create">
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Pool
                </Button>
              </Link>
            </div>
          </div>

          {/* Debug Info */}
          {/* <div className="mb-6">
            <WagmiWalletInfo />
          </div> */}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Pools</p>
                    <p className="text-2xl font-bold text-gray-900">{userPools.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Pools</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPools.filter(pool => pool.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Draft Pools</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPools.filter(pool => pool.status === 'draft').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pools List */}
          {userPools.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pools yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first funding pool to get started with collaborative finance.
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Pool
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Pools</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {userPools.map((pool) => {
                  const fundingGoal = parseFloat(pool.poolData.fundingGoal) || 0
                  const currentAmount = parseFloat(pool.totalRaised || '0')
                  const progress = fundingGoal > 0 ? (currentAmount / fundingGoal) * 100 : 0
                  
                  return (
                    <Card key={pool.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg line-clamp-1">
                              {pool.poolData.title || 'Untitled Pool'}
                            </CardTitle>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {pool.poolData.description || 'No description provided'}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            {getStatusIcon(pool.status)}
                            {getStatusBadge(pool.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        {pool.status === 'active' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {currentAmount.toFixed(4)} / {fundingGoal.toFixed(4)} ETH
                              </span>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-2" />
                          </div>
                        )}

                        {/* Pool Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Funding Goal</p>
                            <p className="font-medium">{fundingGoal.toFixed(4)} ETH</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Milestones</p>
                            <p className="font-medium">{pool.poolData.milestones.length}</p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                          {pool.status === 'draft' ? (
                            <Link href="/create" className="w-full">
                              <Button variant="outline" className="w-full">
                                Continue Setup
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/pool/${pool.id}`} className="w-full">
                              <Button variant="outline" className="w-full">
                                View Pool
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}