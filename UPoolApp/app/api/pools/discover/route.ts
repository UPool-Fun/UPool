// API Route: Discover Public Pools via Smart Contract Registry
// Uses contract interactions from UPoolContracs directory

import { NextRequest, NextResponse } from 'next/server'
import { UPoolContractService, UPoolContractHelpers } from '../../../../lib/contracts/contract-service'

interface DiscoverPoolsRequest {
  offset?: number
  limit?: number
}

interface DiscoverPoolsResponse {
  success: boolean
  pools?: Array<{
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
  }>
  pagination?: {
    offset: number
    limit: number
    total: number
    hasMore: boolean
  }
  error?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<DiscoverPoolsResponse>> {
  try {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100) // Max 100 per request

    console.log('🔍 Discovering pools:', { offset, limit })

    // Check if we're on mainnet or testnet
    const network = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
    
    // Initialize read-only contract service
    const contractService = new UPoolContractService(network)

    // Check if contracts are deployed
    const isDeployed = await contractService.isDeployed()
    if (!isDeployed) {
      console.error('❌ Contracts not deployed on', network)
      return NextResponse.json(
        { success: false, error: `Contracts not deployed on ${network}` },
        { status: 503 }
      )
    }

    // Get total pools count
    let totalPools: number
    try {
      const total = await contractService.registry.getTotalPools()
      totalPools = Number(total)
      console.log('📊 Total pools registered:', totalPools)
    } catch (error) {
      console.error('❌ Failed to get total pools:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to access pool registry' },
        { status: 500 }
      )
    }

    // Get public pools with pagination
    let poolAddresses: string[]
    try {
      const addresses = await contractService.registry.getPublicPools(offset, limit)
      poolAddresses = addresses.map(addr => addr.toString())
      console.log('📋 Found pool addresses:', poolAddresses.length)
    } catch (error) {
      console.error('❌ Failed to get public pools:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch public pools' },
        { status: 500 }
      )
    }

    // If no pools found
    if (poolAddresses.length === 0) {
      return NextResponse.json({
        success: true,
        pools: [],
        pagination: {
          offset,
          limit,
          total: totalPools,
          hasMore: false
        }
      })
    }

    // Get detailed data for each pool
    const poolDetails = await Promise.allSettled(
      poolAddresses.map(async (poolAddress) => {
        try {
          const poolService = contractService.getPoolService(poolAddress as any)
          
          // Get basic pool data and stats
          const [poolData, stats] = await Promise.all([
            poolService.getPoolData(),
            poolService.getPoolStats()
          ])

          return {
            address: poolAddress,
            title: poolData.title,
            description: poolData.description.substring(0, 200) + (poolData.description.length > 200 ? '...' : ''), // Truncate for list view
            fundingGoal: UPoolContractHelpers.formatEthAmount(poolData.fundingGoal),
            totalRaised: UPoolContractHelpers.formatEthAmount(stats.totalRaised),
            progress: UPoolContractHelpers.getFundingProgress(stats.totalRaised, poolData.fundingGoal),
            memberCount: Number(stats.memberCount),
            visibility: getVisibilityString(poolData.visibility),
            riskStrategy: UPoolContractHelpers.riskStrategyToString(poolData.riskStrategy),
            status: getPoolStatusFromProgress(
              UPoolContractHelpers.getFundingProgress(stats.totalRaised, poolData.fundingGoal),
              Number(stats.completedMilestones),
              Number(stats.milestoneCount)
            )
          }
        } catch (error) {
          console.error(`❌ Failed to fetch data for pool ${poolAddress}:`, error)
          return null // Will be filtered out
        }
      })
    )

    // Filter successful results and remove null values
    const successfulPools = poolDetails
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)

    console.log('✅ Successfully fetched data for', successfulPools.length, 'pools')

    // Calculate pagination info
    const hasMore = offset + limit < totalPools
    
    return NextResponse.json({
      success: true,
      pools: successfulPools,
      pagination: {
        offset,
        limit,
        total: totalPools,
        hasMore
      }
    })

  } catch (error) {
    console.error('❌ Pool discovery API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST method for advanced filtering (future implementation)
export async function POST(request: NextRequest): Promise<NextResponse<DiscoverPoolsResponse>> {
  try {
    const body: DiscoverPoolsRequest & {
      filters?: {
        minFundingGoal?: string
        maxFundingGoal?: string
        riskStrategy?: string
        category?: string
        searchTerm?: string
      }
    } = await request.json()

    // For now, just use the GET method logic
    // TODO: Implement advanced filtering with search terms, categories, etc.
    
    return NextResponse.json(
      { success: false, error: 'Advanced filtering not yet implemented' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Pool discovery POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to convert visibility enum to string
function getVisibilityString(visibility: number): string {
  switch (visibility) {
    case 0: return 'Private'
    case 1: return 'Link Only'
    case 2: return 'Public'
    default: return 'Unknown'
  }
}

// Helper function to determine pool status from metrics
function getPoolStatusFromProgress(progress: number, completedMilestones: number, totalMilestones: number): string {
  if (completedMilestones === totalMilestones && totalMilestones > 0) {
    return 'Completed'
  } else if (progress >= 100) {
    return 'Funded'
  } else if (progress > 0) {
    return 'Active'
  } else {
    return 'New'
  }
}