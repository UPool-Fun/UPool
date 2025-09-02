// API Route: Get Pool Data from Smart Contract
// Uses contract interactions from UPoolContracs directory

import { NextRequest, NextResponse } from 'next/server'
import { UPoolContractService, UPoolContractHelpers } from '../../../../lib/contracts/contract-service'
import { PoolService } from '../../../../lib/pool-service'
import { isAddress } from 'viem'

interface PoolDataResponse {
  success: boolean
  poolData?: {
    // Database data
    id: string
    creatorAddress: string
    creatorFid?: string
    status: string
    
    // Contract data
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
    
    // Pool wallet
    poolWalletAddress?: string
    
    // Arrays
    milestones?: any[]
    members?: any[]
    contributions?: any[]
    stats?: any
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PoolDataResponse>> {
  try {
    const poolId = params.id
    console.log('🔍 Fetching pool data for:', poolId)

    // Check if we're on mainnet or testnet
    const network = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
    
    // Initialize read-only contract service
    const contractService = new UPoolContractService(network)

    // First, try to get pool from Firestore
    let poolDocument
    try {
      poolDocument = await PoolService.getPool(poolId)
    } catch (error) {
      console.log('Pool not found in database, checking if it\'s a contract address...')
    }

    let contractAddress: string
    let poolData: any

    if (poolDocument && poolDocument.contractAddress) {
      // Pool exists in database with contract address
      contractAddress = poolDocument.contractAddress
      console.log('📄 Found pool in database with contract:', contractAddress)
    } else if (isAddress(poolId)) {
      // Pool ID is actually a contract address
      contractAddress = poolId
      console.log('📝 Using pool ID as contract address:', contractAddress)
    } else {
      return NextResponse.json(
        { success: false, error: 'Pool not found' },
        { status: 404 }
      )
    }

    // Get pool service for the contract
    const poolService = contractService.getPoolService(contractAddress as any)

    // Fetch data from smart contract
    let contractData, stats, milestones, members, contributions
    try {
      console.log('🔗 Fetching data from smart contract...')
      
      // Parallel contract calls for better performance
      const [contractPoolData, contractStats, contractMilestones, contractMembers, contractContributions] = await Promise.all([
        poolService.getPoolData(),
        poolService.getPoolStats(),
        poolService.getAllMilestones(),
        poolService.getAllMembers(), 
        poolService.getAllContributions()
      ])

      contractData = contractPoolData
      stats = contractStats
      milestones = contractMilestones
      members = contractMembers
      contributions = contractContributions

      console.log('✅ Contract data fetched successfully')
    } catch (error) {
      console.error('❌ Failed to fetch contract data:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch contract data: ' + (error as Error).message },
        { status: 500 }
      )
    }

    // Format the response data
    const formattedPoolData = {
      // Database fields
      id: poolDocument?.id || poolId,
      creatorAddress: poolDocument?.creatorAddress || '',
      creatorFid: poolDocument?.creatorFid || '',
      status: poolDocument?.status || 'active',
      
      // Contract fields
      contractAddress,
      title: contractData.title,
      description: contractData.description,
      fundingGoal: UPoolContractHelpers.formatEthAmount(contractData.fundingGoal),
      totalRaised: UPoolContractHelpers.formatEthAmount(stats.totalRaised),
      progress: UPoolContractHelpers.getFundingProgress(stats.totalRaised, contractData.fundingGoal),
      memberCount: Number(stats.memberCount),
      milestoneCount: Number(stats.milestoneCount),
      completedMilestones: Number(stats.completedMilestones),
      riskStrategy: UPoolContractHelpers.riskStrategyToString(contractData.riskStrategy),
      approvalMethod: UPoolContractHelpers.approvalMethodToString(contractData.approvalMethod),
      visibility: getVisibilityString(contractData.visibility),
      
      // Pool wallet
      poolWalletAddress: poolDocument?.poolWalletAddress || '',
      
      // Arrays (formatted)
      milestones: milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        percentage: Number(milestone.percentage) / 100, // Convert from basis points
        amount: UPoolContractHelpers.formatEthAmount(milestone.amount),
        status: getMilestoneStatusString(milestone.status),
        votesFor: Number(milestone.votesFor),
        votesAgainst: Number(milestone.votesAgainst),
        proofUrl: milestone.proofUrl,
        proofDescription: milestone.proofDescription
      })),
      
      members: members.map(member => ({
        address: member.memberAddress,
        fid: member.fid,
        contributed: UPoolContractHelpers.formatEthAmount(member.contributed),
        joinedAt: new Date(Number(member.joinedAt) * 1000).toISOString(),
        isActive: member.isActive,
        votingWeight: Number(member.votingWeight) / 100 // Convert from basis points
      })),
      
      contributions: contributions.map(contribution => ({
        contributor: contribution.contributor,
        amount: UPoolContractHelpers.formatEthAmount(contribution.amount),
        timestamp: new Date(Number(contribution.timestamp) * 1000).toISOString(),
        transactionHash: contribution.transactionHash,
        source: contribution.source
      })),
      
      // Raw stats for advanced usage
      stats: {
        totalRaisedWei: stats.totalRaised.toString(),
        fundingGoalWei: contractData.fundingGoal.toString(),
        memberCount: Number(stats.memberCount),
        milestoneCount: Number(stats.milestoneCount),
        contributionCount: Number(stats.contributionCount),
        completedMilestones: Number(stats.completedMilestones),
        fundingProgress: Number(stats.fundingProgress)
      }
    }

    console.log('📊 Pool data formatted:', {
      title: formattedPoolData.title,
      totalRaised: formattedPoolData.totalRaised,
      progress: formattedPoolData.progress,
      members: formattedPoolData.memberCount
    })

    return NextResponse.json({
      success: true,
      poolData: formattedPoolData
    })

  } catch (error) {
    console.error('❌ Pool data API error:', error)
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

// Helper function to convert milestone status enum to string
function getMilestoneStatusString(status: number): string {
  switch (status) {
    case 0: return 'Locked'
    case 1: return 'Pending Vote'
    case 2: return 'Approved'
    case 3: return 'Rejected'
    default: return 'Unknown'
  }
}