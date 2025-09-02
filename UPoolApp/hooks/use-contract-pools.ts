// React Hook: UPool Smart Contract Integration
// Uses the new contract API routes with proper error handling and caching

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useToast } from './use-toast'

// Types for API responses
export interface PoolData {
  id: string
  creatorAddress: string
  creatorFid?: string
  status: string
  contractAddress?: string
  title: string
  description: string
  fundingGoal: string
  totalRaised: string
  progress: number
  memberCount: number
  milestoneCount: number
  completedMilestones: number
  riskStrategy: string
  approvalMethod: string
  visibility: string
  poolWalletAddress?: string
  milestones?: any[]
  members?: any[]
  contributions?: any[]
  stats?: any
}

export interface DiscoveredPool {
  address: string
  title: string
  description: string
  fundingGoal: string
  totalRaised: string
  progress: number
  memberCount: number
  visibility: string
  riskStrategy: string
  status: string
}

export interface CreatePoolRequest {
  poolData: {
    title: string
    description: string
    fundingGoal: string
    visibility: number
    approvalMethod: number
    approvalThreshold: string
    poolName: string
    vanityUrl: string
    riskStrategy: number
  }
  milestones: Array<{
    id: string
    title: string
    description: string
    percentage: number
  }>
  creatorFid: string
  creatorAddress: string
}

export interface CreatePoolResponse {
  success: boolean
  poolId?: string
  contractAddress?: string
  transactionHash?: string
  error?: string
}

// ✅ **MAIN HOOK** - Complete contract pool management
export function useContractPools() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ **CREATE POOL** - Create pool via smart contract
  const createPool = useCallback(async (request: CreatePoolRequest): Promise<CreatePoolResponse> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🏊 Creating pool via smart contract API...', request.poolData.title)

      const response = await fetch('/api/pools/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const result: CreatePoolResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Pool creation failed')
      }

      toast({
        title: '🎉 Pool Created Successfully!',
        description: `Pool "${request.poolData.title}" has been created on the blockchain.`
      })

      console.log('✅ Pool created successfully:', {
        poolId: result.poolId,
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Pool creation failed:', errorMessage)
      
      setError(errorMessage)
      toast({
        title: '❌ Pool Creation Failed',
        description: errorMessage,
        variant: 'destructive'
      })

      return { success: false, error: errorMessage }

    } finally {
      setLoading(false)
    }
  }, [toast])

  // ✅ **GET POOL DATA** - Fetch complete pool data from contract
  const getPoolData = useCallback(async (poolId: string): Promise<PoolData | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Fetching pool data from contract:', poolId)

      const response = await fetch(`/api/pools/${poolId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pool data')
      }

      console.log('✅ Pool data fetched:', result.poolData.title)
      return result.poolData

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pool data'
      console.error('❌ Pool data fetch failed:', errorMessage)
      
      setError(errorMessage)
      return null

    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ **DISCOVER POOLS** - Get public pools from registry
  const discoverPools = useCallback(async (offset: number = 0, limit: number = 20): Promise<{
    pools: DiscoveredPool[]
    pagination: {
      offset: number
      limit: number
      total: number
      hasMore: boolean
    }
  } | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Discovering public pools...', { offset, limit })

      const response = await fetch(`/api/pools/discover?offset=${offset}&limit=${limit}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to discover pools')
      }

      console.log('✅ Discovered', result.pools.length, 'pools')
      return {
        pools: result.pools,
        pagination: result.pagination
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to discover pools'
      console.error('❌ Pool discovery failed:', errorMessage)
      
      setError(errorMessage)
      return null

    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ **CHECK CONTRACT STATUS** - Verify contracts are deployed
  const checkContractStatus = useCallback(async (): Promise<{
    isDeployed: boolean
    network: string
    addresses?: any
  } | null> => {
    try {
      const response = await fetch('/api/pools/create')
      const result = await response.json()

      return {
        isDeployed: result.isDeployed,
        network: result.network,
        addresses: result.addresses
      }

    } catch (error) {
      console.error('❌ Contract status check failed:', error)
      return null
    }
  }, [])

  return {
    // State
    loading,
    error,
    
    // Actions
    createPool,
    getPoolData,
    discoverPools,
    checkContractStatus,
    
    // Utilities
    clearError: () => setError(null)
  }
}

// ✅ **POOL DATA HOOK** - Fetch and cache specific pool data
export function usePoolData(poolId: string | null) {
  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPoolData = useCallback(async () => {
    if (!poolId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pools/${poolId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pool data')
      }

      setPoolData(result.poolData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pool data'
      setError(errorMessage)
      setPoolData(null)
    } finally {
      setLoading(false)
    }
  }, [poolId])

  // Fetch on mount and when poolId changes
  useEffect(() => {
    fetchPoolData()
  }, [fetchPoolData])

  return {
    poolData,
    loading,
    error,
    refetch: fetchPoolData
  }
}

// ✅ **POOLS DISCOVERY HOOK** - Paginated pool discovery
export function usePoolsDiscovery(initialLimit: number = 20) {
  const [pools, setPools] = useState<DiscoveredPool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: initialLimit,
    total: 0,
    hasMore: false
  })

  const fetchPools = useCallback(async (offset: number = 0, append: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pools/discover?offset=${offset}&limit=${initialLimit}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to discover pools')
      }

      setPools(currentPools => 
        append ? [...currentPools, ...result.pools] : result.pools
      )
      setPagination(result.pagination)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to discover pools'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [initialLimit])

  // Load more pools
  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchPools(pagination.offset + pagination.limit, true)
    }
  }, [fetchPools, loading, pagination])

  // Refresh pools
  const refresh = useCallback(() => {
    fetchPools(0, false)
  }, [fetchPools])

  // Initial load
  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  return {
    pools,
    loading,
    error,
    pagination,
    loadMore,
    refresh
  }
}

// ✅ **CONTRACT STATUS HOOK** - Monitor contract deployment status
export function useContractStatus() {
  const [status, setStatus] = useState<{
    isDeployed: boolean
    network: string
    addresses?: any
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/pools/create')
        const result = await response.json()

        setStatus({
          isDeployed: result.isDeployed,
          network: result.network,
          addresses: result.addresses
        })
      } catch (error) {
        console.error('❌ Contract status check failed:', error)
        setStatus({
          isDeployed: false,
          network: 'unknown'
        })
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  return {
    status,
    loading,
    isDeployed: status?.isDeployed ?? false,
    network: status?.network ?? 'unknown'
  }
}