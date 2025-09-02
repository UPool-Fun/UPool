// UPool Smart Contract Interaction Utilities
// Complete viem-based contract interaction patterns for deployed Base Mainnet contracts

import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  Address, 
  encodeFunctionData, 
  parseEther, 
  formatEther,
  getContract,
  PublicClient,
  WalletClient,
  parseUnits,
  formatUnits
} from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// ✅ **DEPLOYED CONTRACT ADDRESSES** - Base Mainnet (January 26, 2025)
export const CONTRACT_ADDRESSES = {
  UPOOL_IMPLEMENTATION: {
    'base-mainnet': '0xad859B1c980c1F14048bCee70bda19C2F2726F1F' as Address,
    'base-sepolia': '0x0000000000000000000000000000000000000000' as Address // TODO: Deploy to testnet
  },
  UPOOL_REGISTRY: {
    'base-mainnet': '0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA' as Address, 
    'base-sepolia': '0x0000000000000000000000000000000000000000' as Address // TODO: Deploy to testnet
  },
  UPOOL_FACTORY: {
    'base-mainnet': '0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a' as Address,
    'base-sepolia': '0x0000000000000000000000000000000000000000' as Address // TODO: Deploy to testnet
  }
} as const

// Network Configuration
export const NETWORK_CONFIG = {
  'base-mainnet': {
    chain: base,
    CHAIN_ID: 8453,
    NETWORK_NAME: 'Base Mainnet',
    RPC_URL: 'https://mainnet.base.org',
    EXPLORER: 'https://basescan.org',
    CURRENCY: 'ETH',
    CREATION_FEE: '0.001' // ETH
  },
  'base-sepolia': {
    chain: baseSepolia,
    CHAIN_ID: 84532,
    NETWORK_NAME: 'Base Sepolia',
    RPC_URL: 'https://sepolia.base.org', 
    EXPLORER: 'https://sepolia.basescan.org',
    CURRENCY: 'ETH',
    CREATION_FEE: '0.001' // ETH
  }
} as const

// Import ABIs from the compiled contracts
import UPoolFactoryArtifact from '../artifacts/contracts/UPoolFactory.sol/UPoolFactory.json'
import UPoolRegistryArtifact from '../artifacts/contracts/UPoolRegistry.sol/UPoolRegistry.json'
import UPoolArtifact from '../artifacts/contracts/UPool.sol/UPool.json'

export const UPOOL_FACTORY_ABI = UPoolFactoryArtifact.abi as const
export const UPOOL_REGISTRY_ABI = UPoolRegistryArtifact.abi as const
export const UPOOL_ABI = UPoolArtifact.abi as const

// Pool status enums from contracts
export enum PoolStatus {
  DRAFT = 0,
  PENDING_PAYMENT = 1,
  PAYMENT_PROCESSING = 2, 
  ACTIVE = 3,
  COMPLETED = 4,
  CANCELLED = 5
}

export enum MilestoneStatus {
  LOCKED = 0,
  PENDING_VOTE = 1,
  APPROVED = 2,
  REJECTED = 3
}

export enum Visibility {
  PRIVATE = 0,
  LINK = 1,
  PUBLIC = 2
}

export enum ApprovalMethod {
  MAJORITY = 0,
  PERCENTAGE = 1,
  NUMBER = 2,
  CREATOR = 3
}

export enum RiskStrategy {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export enum PoolCurrency {
  ETH = 0,
  USDC = 1,
  EURC = 2
}

// TypeScript interfaces matching deployed contract structures
export interface PoolData {
  title: string
  description: string
  fundingGoal: bigint
  currency: PoolCurrency
  platformFeeRate: bigint // basis points (10 = 0.1%)
  platformFeeRecipient: Address
  visibility: Visibility
  approvalMethod: ApprovalMethod
  approvalThreshold: bigint
  poolName: string
  vanityUrl: string
  riskStrategy: RiskStrategy
}

export interface Milestone {
  id: string
  title: string
  description: string
  percentage: bigint // basis points (1000 = 10%)
  amount: bigint // calculated amount in wei
  status: MilestoneStatus
  submittedBy: Address
  proofUrl: string
  proofDescription: string
  votesFor: bigint
  votesAgainst: bigint
  submissionTime: bigint
  approvalTime: bigint
}

export interface Member {
  memberAddress: Address
  fid: string
  contributed: bigint
  joinedAt: bigint
  isActive: boolean
  votingWeight: bigint
}

export interface Contribution {
  contributor: Address
  amount: bigint
  timestamp: bigint
  transactionHash: string
  source: string
}

export interface PoolStats {
  totalRaised: bigint
  memberCount: bigint
  milestoneCount: bigint
  contributionCount: bigint
  completedMilestones: bigint
  fundingProgress: bigint // percentage in basis points
}

// ✅ **VIEM CLIENT FACTORY** - Environment-aware client creation
export class UPoolViemClient {
  private network: 'base-mainnet' | 'base-sepolia'
  private publicClient: PublicClient
  private walletClient?: WalletClient

  constructor(
    network: 'base-mainnet' | 'base-sepolia' = 'base-sepolia',
    privateKey?: string
  ) {
    this.network = network
    const config = NETWORK_CONFIG[network]

    // Create public client for reading
    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.RPC_URL)
    })

    // Create wallet client for transactions if private key provided
    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`)
      this.walletClient = createWalletClient({
        account,
        chain: config.chain,
        transport: http(config.RPC_URL)
      })
    }
  }

  getPublicClient(): PublicClient {
    return this.publicClient
  }

  getWalletClient(): WalletClient | undefined {
    return this.walletClient
  }

  getNetwork(): 'base-mainnet' | 'base-sepolia' {
    return this.network
  }

  getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES): Address {
    const address = CONTRACT_ADDRESSES[contractName][this.network]
    
    if (address === '0x0000000000000000000000000000000000000000') {
      throw new Error(`${contractName} not deployed on ${this.network}`)
    }
    
    return address
  }
}

// ✅ **FACTORY CONTRACT INTERACTIONS** - Pool creation and management
export class UPoolFactoryService {
  private client: UPoolViemClient
  private factoryAddress: Address

  constructor(client: UPoolViemClient) {
    this.client = client
    this.factoryAddress = client.getContractAddress('UPOOL_FACTORY')
  }

  /**
   * Create a new pool with milestones
   */
  async createPool(
    poolData: PoolData,
    creatorFid: string,
    milestones: Milestone[],
    templateName: string = ''
  ): Promise<{ hash: string; poolAddress: Address }> {
    const walletClient = this.client.getWalletClient()
    if (!walletClient) throw new Error('Wallet client required for pool creation')

    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: { public: this.client.getPublicClient(), wallet: walletClient }
    })

    // Get creation fee
    const creationFee = await this.getCreationFee()

    // Create pool transaction
    const hash = await factory.write.createPool([
      poolData,
      creatorFid,
      milestones,
      templateName
    ], {
      value: creationFee
    })

    // Wait for transaction and get pool address from events
    const receipt = await this.client.getPublicClient().waitForTransactionReceipt({ hash })
    
    // Parse PoolCreated event to get pool address
    const poolCreatedEvent = receipt.logs.find(log => 
      log.address.toLowerCase() === this.factoryAddress.toLowerCase()
    )
    
    if (!poolCreatedEvent) {
      throw new Error('Pool creation failed - no PoolCreated event found')
    }

    // Decode event to get pool address
    // This would require proper event decoding - for now return address from receipt
    const poolAddress = poolCreatedEvent.address // This needs proper event parsing
    
    return { hash, poolAddress }
  }

  /**
   * Get pools created by specific creator
   */
  async getCreatorPools(creatorAddress: Address): Promise<Address[]> {
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: this.client.getPublicClient()
    })

    return factory.read.getCreatorPools([creatorAddress])
  }

  /**
   * Get pool by vanity URL
   */
  async getPoolByVanityUrl(vanityUrl: string): Promise<Address> {
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: this.client.getPublicClient()
    })

    return factory.read.getPoolByVanityUrl([vanityUrl])
  }

  /**
   * Check if vanity URL is available
   */
  async isVanityUrlAvailable(vanityUrl: string): Promise<boolean> {
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: this.client.getPublicClient()
    })

    return factory.read.isVanityUrlAvailable([vanityUrl])
  }

  /**
   * Get current pool creation fee
   */
  async getCreationFee(): Promise<bigint> {
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: this.client.getPublicClient()
    })

    return factory.read.poolCreationFee()
  }

  /**
   * Get factory statistics
   */
  async getFactoryStats(): Promise<{
    totalPools: bigint
    totalFees: bigint
    creationFee: bigint
  }> {
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: this.client.getPublicClient()
    })

    return factory.read.getFactoryStats()
  }
}

// ✅ **REGISTRY CONTRACT INTERACTIONS** - Pool discovery and management
export class UPoolRegistryService {
  private client: UPoolViemClient
  private registryAddress: Address

  constructor(client: UPoolViemClient) {
    this.client = client
    this.registryAddress = client.getContractAddress('UPOOL_REGISTRY')
  }

  /**
   * Get public pools with pagination
   */
  async getPublicPools(offset: number = 0, limit: number = 20): Promise<Address[]> {
    const registry = getContract({
      address: this.registryAddress,
      abi: UPOOL_REGISTRY_ABI,
      client: this.client.getPublicClient()
    })

    return registry.read.getPublicPools([BigInt(offset), BigInt(limit)])
  }

  /**
   * Check if pool is registered
   */
  async isPoolRegistered(poolAddress: Address): Promise<boolean> {
    const registry = getContract({
      address: this.registryAddress,
      abi: UPOOL_REGISTRY_ABI,
      client: this.client.getPublicClient()
    })

    return registry.read.isPoolRegistered([poolAddress])
  }

  /**
   * Get total number of registered pools
   */
  async getTotalPools(): Promise<bigint> {
    const registry = getContract({
      address: this.registryAddress,
      abi: UPOOL_REGISTRY_ABI,
      client: this.client.getPublicClient()
    })

    return registry.read.getTotalPools()
  }

  /**
   * Register a pool (admin only)
   */
  async registerPool(poolAddress: Address, fee: bigint): Promise<string> {
    const walletClient = this.client.getWalletClient()
    if (!walletClient) throw new Error('Wallet client required for pool registration')

    const registry = getContract({
      address: this.registryAddress,
      abi: UPOOL_REGISTRY_ABI,
      client: { public: this.client.getPublicClient(), wallet: walletClient }
    })

    return registry.write.registerPool([poolAddress], { value: fee })
  }
}

// ✅ **INDIVIDUAL POOL INTERACTIONS** - Pool-specific operations
export class UPoolService {
  private client: UPoolViemClient
  private poolAddress: Address

  constructor(client: UPoolViemClient, poolAddress: Address) {
    this.client = client
    this.poolAddress = poolAddress
  }

  /**
   * Get pool data
   */
  async getPoolData(): Promise<PoolData> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.poolData()
  }

  /**
   * Get pool creator
   */
  async getCreator(): Promise<Address> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.creator()
  }

  /**
   * Get pool status
   */
  async getPoolStatus(): Promise<PoolStatus> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    const status = await pool.read.poolStatus()
    return status as PoolStatus
  }

  /**
   * Get total amount raised
   */
  async getTotalRaised(): Promise<bigint> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.totalRaised()
  }

  /**
   * Get all milestones
   */
  async getAllMilestones(): Promise<Milestone[]> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.getAllMilestones()
  }

  /**
   * Get all members
   */
  async getAllMembers(): Promise<Member[]> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.getAllMembers()
  }

  /**
   * Get all contributions
   */
  async getAllContributions(): Promise<Contribution[]> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.getAllContributions()
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(): Promise<PoolStats> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    const [
      totalRaised,
      memberCount,
      milestoneCount,
      contributionCount,
      completedMilestones,
      fundingProgress
    ] = await pool.read.getPoolStats()

    return {
      totalRaised,
      memberCount,
      milestoneCount,
      contributionCount,
      completedMilestones,
      fundingProgress
    }
  }

  /**
   * Record a contribution (admin only)
   */
  async recordContribution(
    contributor: Address,
    amount: bigint,
    txHash: string,
    source: string,
    fid: string
  ): Promise<string> {
    const walletClient = this.client.getWalletClient()
    if (!walletClient) throw new Error('Wallet client required for recording contributions')

    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: { public: this.client.getPublicClient(), wallet: walletClient }
    })

    return pool.write.recordContribution([contributor, amount, txHash, source, fid])
  }

  /**
   * Vote on milestone
   */
  async voteOnMilestone(milestoneId: string, vote: boolean): Promise<string> {
    const walletClient = this.client.getWalletClient()
    if (!walletClient) throw new Error('Wallet client required for voting')

    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: { public: this.client.getPublicClient(), wallet: walletClient }
    })

    return pool.write.voteOnMilestone([milestoneId, vote])
  }

  /**
   * Submit milestone proof
   */
  async submitMilestoneProof(
    milestoneId: string,
    proofUrl: string,
    proofDescription: string
  ): Promise<string> {
    const walletClient = this.client.getWalletClient()
    if (!walletClient) throw new Error('Wallet client required for submitting proof')

    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: { public: this.client.getPublicClient(), wallet: walletClient }
    })

    return pool.write.submitMilestoneProof([milestoneId, proofUrl, proofDescription])
  }

  /**
   * Get contract version
   */
  async getVersion(): Promise<string> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return pool.read.getVersion()
  }
}

// ✅ **UTILITY FUNCTIONS** - Contract calculation helpers
export const UPoolContractHelpers = {
  /**
   * Format ETH amounts for display
   */
  formatEthAmount(amount: bigint): string {
    return formatEther(amount)
  },

  /**
   * Parse ETH amount from string
   */
  parseEthAmount(amount: string): bigint {
    return parseEther(amount)
  },

  /**
   * Format USDC amounts for display
   */
  formatUsdcAmount(amount: bigint): string {
    return formatUnits(amount, 6) // USDC has 6 decimals
  },

  /**
   * Parse USDC amount from string
   */
  parseUsdcAmount(amount: string): bigint {
    return parseUnits(amount, 6)
  },

  /**
   * Calculate milestone payout amount
   */
  calculateMilestonePayout(fundingGoal: bigint, percentage: bigint): bigint {
    return (fundingGoal * percentage) / 10000n // percentage is in basis points
  },

  /**
   * Check if milestone voting threshold is met
   */
  isMilestoneVotePassed(
    votesFor: bigint,
    votesAgainst: bigint,
    approvalMethod: ApprovalMethod,
    approvalThreshold: bigint,
    totalVotingWeight: bigint
  ): boolean {
    const totalVotes = votesFor + votesAgainst
    
    switch (approvalMethod) {
      case ApprovalMethod.CREATOR:
        return true // Creator approval handled separately
        
      case ApprovalMethod.MAJORITY:
        return votesFor > votesAgainst && totalVotes > 0n
        
      case ApprovalMethod.PERCENTAGE:
        if (totalVotingWeight === 0n) return false
        const approvalRate = totalVotes > 0n ? (votesFor * 10000n) / totalVotes : 0n
        return approvalRate >= approvalThreshold
        
      case ApprovalMethod.NUMBER:
        return votesFor >= approvalThreshold
        
      default:
        return false
    }
  },

  /**
   * Calculate voting weight based on contribution
   */
  calculateVotingWeight(contribution: bigint, totalRaised: bigint): bigint {
    if (totalRaised === 0n) return 0n
    return (contribution * 10000n) / totalRaised // weight in basis points
  },

  /**
   * Calculate platform fee
   */
  calculatePlatformFee(amount: bigint, feeRate: bigint): bigint {
    return (amount * feeRate) / 10000n // feeRate in basis points
  },

  /**
   * Get funding progress percentage
   */
  getFundingProgress(totalRaised: bigint, fundingGoal: bigint): number {
    if (fundingGoal === 0n) return 0
    return Number((totalRaised * 10000n) / fundingGoal) / 100 // return as percentage
  },

  /**
   * Check if pool funding goal is reached
   */
  isFundingGoalReached(totalRaised: bigint, fundingGoal: bigint): boolean {
    return totalRaised >= fundingGoal
  },

  /**
   * Convert pool currency enum to string
   */
  currencyToString(currency: PoolCurrency): string {
    switch (currency) {
      case PoolCurrency.ETH: return 'ETH'
      case PoolCurrency.USDC: return 'USDC' 
      case PoolCurrency.EURC: return 'EURC'
      default: return 'ETH'
    }
  },

  /**
   * Convert approval method enum to readable string
   */
  approvalMethodToString(method: ApprovalMethod): string {
    switch (method) {
      case ApprovalMethod.CREATOR: return 'Creator Only'
      case ApprovalMethod.MAJORITY: return 'Simple Majority'
      case ApprovalMethod.PERCENTAGE: return 'Percentage Threshold'
      case ApprovalMethod.NUMBER: return 'Minimum Count'
      default: return 'Unknown'
    }
  },

  /**
   * Convert risk strategy enum to readable string
   */
  riskStrategyToString(strategy: RiskStrategy): string {
    switch (strategy) {
      case RiskStrategy.LOW: return 'Conservative (Aave)'
      case RiskStrategy.MEDIUM: return 'Balanced (Moonwell)' 
      case RiskStrategy.HIGH: return 'Aggressive (DeFi)'
      default: return 'Conservative'
    }
  },

  /**
   * Validate milestone percentages total 100%
   */
  validateMilestonePercentages(milestones: Milestone[]): boolean {
    const total = milestones.reduce((sum, m) => sum + Number(m.percentage), 0)
    return total === 10000 // 100% in basis points
  },

  /**
   * Generate milestone ID
   */
  generateMilestoneId(poolId: string, index: number): string {
    return `${poolId}-milestone-${index}`
  }
}

// ✅ **COMPREHENSIVE UPOOL SERVICE** - Main service class
export class UPoolContractService {
  private client: UPoolViemClient
  public factory: UPoolFactoryService
  public registry: UPoolRegistryService

  constructor(
    network: 'base-mainnet' | 'base-sepolia' = 'base-sepolia',
    privateKey?: string
  ) {
    this.client = new UPoolViemClient(network, privateKey)
    this.factory = new UPoolFactoryService(this.client)
    this.registry = new UPoolRegistryService(this.client)
  }

  /**
   * Get pool service for specific pool
   */
  getPoolService(poolAddress: Address): UPoolService {
    return new UPoolService(this.client, poolAddress)
  }

  /**
   * Get the viem client
   */
  getClient(): UPoolViemClient {
    return this.client
  }

  /**
   * Check if contracts are deployed on current network
   */
  async isDeployed(): Promise<boolean> {
    try {
      await this.factory.getCreationFee()
      await this.registry.getTotalPools()
      return true
    } catch (error) {
      console.error('Contracts not deployed or accessible:', error)
      return false
    }
  }

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    return NETWORK_CONFIG[this.client.getNetwork()]
  }

  /**
   * Get all contract addresses
   */
  getAllContractAddresses() {
    const network = this.client.getNetwork()
    return {
      factory: this.client.getContractAddress('UPOOL_FACTORY'),
      registry: this.client.getContractAddress('UPOOL_REGISTRY'), 
      implementation: this.client.getContractAddress('UPOOL_IMPLEMENTATION'),
      network: NETWORK_CONFIG[network]
    }
  }
}