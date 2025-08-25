import { NextRequest, NextResponse } from 'next/server'
import { PoolService } from '@/lib/pool-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poolId = params.id
    
    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID is required' },
        { status: 400 }
      )
    }
    
    // Get pool data from Firestore
    const pool = await PoolService.getPool(poolId)
    
    if (!pool) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      )
    }
    
    // Transform pool data for frontend display
    const poolResponse = {
      id: pool.id,
      title: pool.poolData.title,
      description: pool.poolData.description,
      fundingGoal: parseFloat(pool.poolData.fundingGoal) || 0,
      milestones: pool.poolData.milestones,
      visibility: pool.poolData.visibility,
      approvalMethod: pool.poolData.approvalMethod,
      approvalThreshold: pool.poolData.approvalThreshold,
      poolName: pool.poolData.poolName,
      vanityUrl: pool.poolData.vanityUrl,
      riskStrategy: pool.poolData.riskStrategy,
      
      // Pool metadata
      creatorAddress: pool.creatorAddress,
      creatorFid: pool.creatorFid,
      status: pool.status,
      
      // Pool wallet information
      poolWalletAddress: pool.poolWalletAddress,
      poolWalletId: pool.poolWalletId,
      
      // Payment information
      paymentId: pool.paymentId,
      paymentStatus: pool.paymentStatus,
      paymentAmount: pool.paymentAmount,
      transactionHash: pool.transactionHash,
      
      // Timestamps
      createdAt: pool.createdAt?.toDate?.().toISOString() || null,
      updatedAt: pool.updatedAt?.toDate?.().toISOString() || null,
      activatedAt: pool.activatedAt?.toDate?.().toISOString() || null,
      
      // Statistics (calculated or default values)
      currentAmount: 0.01, // Start with initial Base Pay deposit
      yieldEarned: 0,
      yieldRate: 4.2, // Default APY
      protocol: 'Morpho',
      members: 1, // Start with creator
      totalRaised: pool.totalRaised || '0',
      contributorCount: pool.contributorCount || 0,
      milestonesCompleted: pool.milestonesCompleted || 0,
      
      // Additional properties
      version: pool.version,
      source: pool.source,
    }
    
    return NextResponse.json(poolResponse)
    
  } catch (error) {
    console.error('❌ Error fetching pool:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch pool',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}