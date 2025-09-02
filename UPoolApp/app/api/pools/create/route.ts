// API Route: Create Pool via Smart Contract
// Uses contract interactions from UPoolContracs directory

import { NextRequest, NextResponse } from 'next/server'
import { UPoolContractService, UPoolContractHelpers } from '../../../../lib/contracts/contract-service'
import { CDPWalletService } from '../../../../lib/cdp-wallet-service'
import { PoolService } from '../../../../lib/pool-service'
import { parseEther, Address } from 'viem'

interface PoolCreationRequest {
  poolData: {
    title: string
    description: string
    fundingGoal: string // ETH string
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
    percentage: number // 0-100
  }>
  creatorFid: string
  creatorAddress: string
}

interface PoolCreationResponse {
  success: boolean
  poolId?: string
  contractAddress?: string
  transactionHash?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<PoolCreationResponse>> {
  try {
    const body: PoolCreationRequest = await request.json()
    console.log('🏊 Pool creation request:', { 
      title: body.poolData.title, 
      creator: body.creatorAddress,
      goal: body.poolData.fundingGoal 
    })

    // Validate required fields
    if (!body.poolData.title || !body.creatorAddress || !body.poolData.fundingGoal) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate funding goal
    let fundingGoalWei: bigint
    try {
      fundingGoalWei = parseEther(body.poolData.fundingGoal)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid funding goal amount' },
        { status: 400 }
      )
    }

    // Validate milestone percentages
    const totalPercentage = body.milestones.reduce((sum, m) => sum + m.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Milestone percentages must total 100%' },
        { status: 400 }
      )
    }

    // Check if we're on mainnet or testnet
    const network = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
    console.log('🌐 Using network:', network)

    // Initialize contract service
    const contractService = new UPoolContractService(network, process.env.POOL_CREATOR_PRIVATE_KEY)

    // Check if contracts are deployed
    const isDeployed = await contractService.isDeployed()
    if (!isDeployed) {
      console.error('❌ Contracts not deployed on', network)
      return NextResponse.json(
        { success: false, error: `Contracts not deployed on ${network}` },
        { status: 503 }
      )
    }

    // Create CDP wallet for the pool
    let poolWalletAddress: string
    try {
      const walletInfo = await CDPWalletService.createPoolWallet()
      poolWalletAddress = walletInfo.address
      console.log('💰 Created pool wallet:', poolWalletAddress)
    } catch (error) {
      console.error('❌ Failed to create pool wallet:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create pool wallet' },
        { status: 500 }
      )
    }

    // Prepare contract pool data
    const contractPoolData = {
      title: body.poolData.title,
      description: body.poolData.description,
      fundingGoal: fundingGoalWei,
      currency: 0, // ETH
      platformFeeRate: 250n, // 2.5% in basis points
      platformFeeRecipient: poolWalletAddress as Address, // Use pool wallet as recipient
      visibility: body.poolData.visibility,
      approvalMethod: body.poolData.approvalMethod,
      approvalThreshold: body.poolData.approvalMethod === 1 || body.poolData.approvalMethod === 2 
        ? parseEther(body.poolData.approvalThreshold || '0') 
        : 0n,
      poolName: body.poolData.poolName,
      vanityUrl: body.poolData.vanityUrl,
      riskStrategy: body.poolData.riskStrategy
    }

    // Prepare contract milestones
    const contractMilestones = body.milestones.map((milestone, index) => ({
      id: `milestone-${index + 1}`,
      title: milestone.title,
      description: milestone.description,
      percentage: BigInt(milestone.percentage * 100), // Convert to basis points
      amount: UPoolContractHelpers.calculateMilestonePayout(fundingGoalWei, BigInt(milestone.percentage * 100)),
      status: 0, // LOCKED
      submittedBy: '0x0000000000000000000000000000000000000000' as Address,
      proofUrl: '',
      proofDescription: '',
      votesFor: 0n,
      votesAgainst: 0n,
      submissionTime: 0n,
      approvalTime: 0n
    }))

    // Create pool on blockchain
    let contractResult
    try {
      console.log('📝 Creating pool on blockchain...')
      contractResult = await contractService.factory.createPool(
        contractPoolData,
        body.creatorFid || '',
        contractMilestones,
        '' // No template
      )
      console.log('✅ Pool created on blockchain:', {
        hash: contractResult.hash,
        address: contractResult.poolAddress
      })
    } catch (error) {
      console.error('❌ Blockchain pool creation failed:', error)
      return NextResponse.json(
        { success: false, error: 'Blockchain transaction failed: ' + (error as Error).message },
        { status: 500 }
      )
    }

    // Save pool data to Firestore
    let poolId: string
    try {
      const poolDocument = {
        creatorAddress: body.creatorAddress,
        creatorFid: body.creatorFid,
        status: 'active' as const,
        poolData: body.poolData,
        
        // Contract integration
        contractAddress: contractResult.poolAddress,
        transactionHash: contractResult.hash,
        
        // Pool wallet information  
        poolWalletAddress: poolWalletAddress,
        
        // Metadata
        version: '2.0.0',
        source: 'api' as const,
        network: network
      }

      poolId = await PoolService.createPool(poolDocument)
      console.log('💾 Pool saved to Firestore:', poolId)
    } catch (error) {
      console.error('❌ Failed to save pool to database:', error)
      // Pool was created on blockchain but not saved to database
      // This is recoverable - we have the contract address and transaction hash
      return NextResponse.json(
        { 
          success: true, // Still success since blockchain creation worked
          poolId: 'pending-database-sync',
          contractAddress: contractResult.poolAddress,
          transactionHash: contractResult.hash,
          error: 'Pool created on blockchain but database sync failed'
        },
        { status: 200 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      poolId,
      contractAddress: contractResult.poolAddress,
      transactionHash: contractResult.hash
    })

  } catch (error) {
    console.error('❌ Pool creation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for testing
export async function GET(): Promise<NextResponse> {
  const network = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
  
  try {
    const contractService = new UPoolContractService(network)
    const isDeployed = await contractService.isDeployed()
    const addresses = contractService.getAllContractAddresses()
    
    return NextResponse.json({
      network,
      isDeployed,
      addresses,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      network,
      isDeployed: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}