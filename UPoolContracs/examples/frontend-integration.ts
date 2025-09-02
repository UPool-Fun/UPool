// Example: How to integrate UPool contracts with frontend
// This demonstrates the pattern for using contract interactions from UPoolContracs in UPoolApp

import { UPoolContractService, UPoolContractHelpers } from '../scripts/contract-interactions'
import { parseEther } from 'viem'

// ✅ **EXAMPLE 1**: Initialize contract service
export async function initializeContractService() {
  // For read-only operations (no wallet needed)
  const readOnlyService = new UPoolContractService('base-mainnet')
  
  // For transactions (with wallet private key)
  const walletService = new UPoolContractService('base-mainnet', process.env.PRIVATE_KEY)
  
  // Check if contracts are deployed and accessible
  const isDeployed = await readOnlyService.isDeployed()
  console.log('Contracts deployed:', isDeployed)
  
  return { readOnlyService, walletService }
}

// ✅ **EXAMPLE 2**: Create a new pool (backend operation)
export async function createPoolExample() {
  const service = new UPoolContractService('base-mainnet', process.env.PRIVATE_KEY)
  
  const poolData = {
    title: "Trip to Japan",
    description: "Save money together for our group trip to Japan",
    fundingGoal: parseEther("5.0"), // 5 ETH goal
    currency: 0, // ETH
    platformFeeRate: 250n, // 2.5% in basis points
    platformFeeRecipient: "0x1234567890123456789012345678901234567890" as any,
    visibility: 2, // PUBLIC
    approvalMethod: 0, // MAJORITY
    approvalThreshold: 0n,
    poolName: "JapanTrip2025",
    vanityUrl: "japan-trip-2025",
    riskStrategy: 0 // LOW
  }
  
  const milestones = [
    {
      id: "milestone-1",
      title: "Book Flights",
      description: "Book round-trip flights to Tokyo",
      percentage: 4000n, // 40% in basis points
      amount: parseEther("2.0"), // 2 ETH
      status: 0,
      submittedBy: "0x0000000000000000000000000000000000000000" as any,
      proofUrl: "",
      proofDescription: "",
      votesFor: 0n,
      votesAgainst: 0n,
      submissionTime: 0n,
      approvalTime: 0n
    },
    {
      id: "milestone-2", 
      title: "Book Hotels",
      description: "Reserve hotels for 2 weeks",
      percentage: 3000n, // 30% in basis points
      amount: parseEther("1.5"), // 1.5 ETH
      status: 0,
      submittedBy: "0x0000000000000000000000000000000000000000" as any,
      proofUrl: "",
      proofDescription: "",
      votesFor: 0n,
      votesAgainst: 0n,
      submissionTime: 0n,
      approvalTime: 0n
    },
    {
      id: "milestone-3",
      title: "Activities & Food",
      description: "Budget for activities and dining",
      percentage: 3000n, // 30% in basis points
      amount: parseEther("1.5"), // 1.5 ETH
      status: 0,
      submittedBy: "0x0000000000000000000000000000000000000000" as any,
      proofUrl: "",
      proofDescription: "",
      votesFor: 0n,
      votesAgainst: 0n,
      submissionTime: 0n,
      approvalTime: 0n
    }
  ]
  
  try {
    const result = await service.factory.createPool(
      poolData,
      "farcaster:12345", // Creator FID
      milestones,
      "" // No template
    )
    
    console.log('Pool created successfully!')
    console.log('Transaction Hash:', result.hash)
    console.log('Pool Address:', result.poolAddress)
    
    return result
  } catch (error) {
    console.error('Pool creation failed:', error)
    throw error
  }
}

// ✅ **EXAMPLE 3**: Read pool data (frontend operation)
export async function readPoolDataExample(poolAddress: string) {
  const service = new UPoolContractService('base-mainnet')
  const poolService = service.getPoolService(poolAddress as any)
  
  try {
    // Get basic pool information
    const poolData = await poolService.getPoolData()
    const stats = await poolService.getPoolStats()
    const milestones = await poolService.getAllMilestones()
    const members = await poolService.getAllMembers()
    
    // Format data for frontend display
    const formattedData = {
      title: poolData.title,
      description: poolData.description,
      fundingGoal: UPoolContractHelpers.formatEthAmount(poolData.fundingGoal),
      totalRaised: UPoolContractHelpers.formatEthAmount(stats.totalRaised),
      progress: UPoolContractHelpers.getFundingProgress(stats.totalRaised, poolData.fundingGoal),
      memberCount: Number(stats.memberCount),
      milestoneCount: Number(stats.milestoneCount),
      riskStrategy: UPoolContractHelpers.riskStrategyToString(poolData.riskStrategy),
      approvalMethod: UPoolContractHelpers.approvalMethodToString(poolData.approvalMethod)
    }
    
    console.log('Pool Data:', formattedData)
    console.log('Milestones:', milestones)
    console.log('Members:', members)
    
    return { poolData: formattedData, milestones, members, stats }
  } catch (error) {
    console.error('Failed to read pool data:', error)
    throw error
  }
}

// ✅ **EXAMPLE 4**: Discover public pools (frontend operation)
export async function discoverPoolsExample() {
  const service = new UPoolContractService('base-mainnet')
  
  try {
    // Get total number of pools
    const totalPools = await service.registry.getTotalPools()
    console.log('Total pools registered:', totalPools.toString())
    
    // Get first 20 public pools
    const publicPools = await service.registry.getPublicPools(0, 20)
    console.log('Public pools:', publicPools)
    
    // Get detailed data for each pool
    const poolDetails = await Promise.all(
      publicPools.map(async (poolAddress) => {
        const poolService = service.getPoolService(poolAddress)
        const poolData = await poolService.getPoolData()
        const stats = await poolService.getPoolStats()
        
        return {
          address: poolAddress,
          title: poolData.title,
          description: poolData.description,
          fundingGoal: UPoolContractHelpers.formatEthAmount(poolData.fundingGoal),
          totalRaised: UPoolContractHelpers.formatEthAmount(stats.totalRaised),
          progress: UPoolContractHelpers.getFundingProgress(stats.totalRaised, poolData.fundingGoal),
          memberCount: Number(stats.memberCount),
          visibility: poolData.visibility,
          riskStrategy: UPoolContractHelpers.riskStrategyToString(poolData.riskStrategy)
        }
      })
    )
    
    return poolDetails
  } catch (error) {
    console.error('Pool discovery failed:', error)
    throw error
  }
}

// ✅ **EXAMPLE 5**: Record contribution after Base Pay payment
export async function recordContributionExample(
  poolAddress: string,
  contributorAddress: string,
  amount: string,
  txHash: string,
  fid: string
) {
  const service = new UPoolContractService('base-mainnet', process.env.PRIVATE_KEY)
  const poolService = service.getPoolService(poolAddress as any)
  
  try {
    const amountInWei = UPoolContractHelpers.parseEthAmount(amount)
    
    const hash = await poolService.recordContribution(
      contributorAddress as any,
      amountInWei,
      txHash,
      'base-pay', // Source
      fid
    )
    
    console.log('Contribution recorded successfully!')
    console.log('Transaction Hash:', hash)
    
    return hash
  } catch (error) {
    console.error('Failed to record contribution:', error)
    throw error
  }
}

// ✅ **EXAMPLE 6**: Vote on milestone completion
export async function voteOnMilestoneExample(
  poolAddress: string,
  milestoneId: string,
  vote: boolean
) {
  const service = new UPoolContractService('base-mainnet', process.env.PRIVATE_KEY)
  const poolService = service.getPoolService(poolAddress as any)
  
  try {
    const hash = await poolService.voteOnMilestone(milestoneId, vote)
    
    console.log('Vote submitted successfully!')
    console.log('Transaction Hash:', hash)
    console.log('Vote:', vote ? 'FOR' : 'AGAINST')
    
    return hash
  } catch (error) {
    console.error('Failed to submit vote:', error)
    throw error
  }
}

// ✅ **EXAMPLE 7**: Frontend hook pattern for React
export function useUPoolContract() {
  // This would be implemented in UPoolApp as a React hook
  
  const createPool = async (poolData: any, milestones: any[]) => {
    // This would call the backend API that uses the contract service
    const response = await fetch('/api/pools/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolData, milestones })
    })
    return response.json()
  }
  
  const getPoolData = async (poolAddress: string) => {
    // This would call a read-only API that uses the contract service
    const response = await fetch(`/api/pools/${poolAddress}`)
    return response.json()
  }
  
  return {
    createPool,
    getPoolData,
    // ... other methods
  }
}

// ✅ **EXAMPLE 8**: API route pattern for Next.js
export const poolCreationAPIExample = `
// app/api/pools/create/route.ts - UPoolApp API route
import { UPoolContractService } from '../../../../../UPoolContracs/scripts/contract-interactions'

export async function POST(request: Request) {
  const { poolData, milestones } = await request.json()
  
  const service = new UPoolContractService('base-mainnet', process.env.PRIVATE_KEY)
  
  try {
    const result = await service.factory.createPool(poolData, 'farcaster:12345', milestones, '')
    return Response.json({ success: true, ...result })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
`

// ✅ **USAGE SUMMARY**
console.log(`
🚀 UPool Contract Integration Pattern:

1. **Contract Code Location**: /UPoolContracs/scripts/contract-interactions.ts
2. **Frontend ABIs**: /UPoolApp/lib/contracts/abis.ts
3. **Integration Pattern**: 
   - Backend operations use full contract service from UPoolContracs
   - Frontend uses minimal ABIs and calls backend APIs
   - Read-only operations can be called directly from frontend

📁 File Structure:
UPoolContracs/
├── scripts/contract-interactions.ts (✅ Full contract service)
├── lib/abi-exports.ts (✅ ABI exports)
└── examples/frontend-integration.ts (✅ This file)

UPoolApp/
├── lib/contracts/abis.ts (✅ Minimal ABIs only)
├── app/api/pools/ (📝 TODO: API routes for contract calls)
└── hooks/use-contract.ts (📝 TODO: React hooks)
`)

export default {
  initializeContractService,
  createPoolExample,
  readPoolDataExample,
  discoverPoolsExample,
  recordContributionExample,
  voteOnMilestoneExample,
  useUPoolContract
}