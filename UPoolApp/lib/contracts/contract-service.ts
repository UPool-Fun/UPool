// UPool Contract Service - Local Implementation for UPoolApp
// Contains essential contract interaction logic without external dependencies

import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  Address, 
  parseEther, 
  formatEther,
  getContract,
  PublicClient,
  WalletClient
} from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { UPOOL_FACTORY_ABI, UPOOL_REGISTRY_ABI, UPOOL_ABI } from './abis'

// ✅ **DEPLOYED CONTRACT ADDRESSES** - Base Mainnet & Sepolia
export const CONTRACT_ADDRESSES = {
  UPOOL_IMPLEMENTATION: {
    'base-mainnet': '0xad859B1c980c1F14048bCee70bda19C2F2726F1F' as Address,
    'base-sepolia': '0x4894cc56cCEb7d3196F45eaa51c08E6EB46B408E' as Address // ✅ Deployed September 2, 2025
  },
  UPOOL_REGISTRY: {
    'base-mainnet': '0xf8f067c65A73BC17d4D78FB48A774551CBc6C5EA' as Address, 
    'base-sepolia': '0xcFE4F99826276ed6fD51bb94bfbc36bc83bEDaDA' as Address // ✅ Deployed September 2, 2025
  },
  UPOOL_FACTORY: {
    'base-mainnet': '0x72672fa9EB552e50841a4DaC3637bC328FBDAc0a' as Address,
    'base-sepolia': '0xB38FFb94A76D8c0C5D99B103DBe6c7aBe717bb7d' as Address // ✅ Deployed September 2, 2025
  }
} as const

// Network Configuration
export const NETWORK_CONFIG = {
  'base-mainnet': {
    chain: base,
    rpcUrl: 'https://mainnet.base.org',
    creationFee: parseEther('0.001')
  },
  'base-sepolia': {
    chain: baseSepolia,
    rpcUrl: 'https://sepolia.base.org',
    creationFee: parseEther('0.001')
  }
} as const

export type NetworkType = keyof typeof NETWORK_CONFIG

// ✅ **VIEM CLIENT** - Blockchain connection management
export class UPoolViemClient {
  private publicClient: PublicClient
  private walletClient?: WalletClient
  private network: NetworkType

  constructor(network: NetworkType = 'base-sepolia', privateKey?: string) {
    this.network = network
    const config = NETWORK_CONFIG[network]

    // Create public client for reading
    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl)
    })

    // Create wallet client if private key provided
    if (privateKey) {
      const account = privateKeyToAccount(privateKey as Address)
      this.walletClient = createWalletClient({
        account,
        chain: config.chain,
        transport: http(config.rpcUrl)
      })
    }
  }

  getPublicClient(): PublicClient {
    return this.publicClient
  }

  getWalletClient(): WalletClient {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Provide private key.')
    }
    return this.walletClient
  }

  getNetwork(): NetworkType {
    return this.network
  }
}

// ✅ **FACTORY SERVICE** - Pool creation and management
export class UPoolFactoryService {
  private client: UPoolViemClient
  private factoryAddress: Address

  constructor(client: UPoolViemClient) {
    this.client = client
    this.factoryAddress = CONTRACT_ADDRESSES.UPOOL_FACTORY[client.getNetwork()]
    
    if (this.factoryAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Factory contract not deployed on ${client.getNetwork()}`)
    }
  }

  async createPool(
    poolData: any,
    creatorFid: string,
    milestones: any[],
    template: string
  ): Promise<{ hash: string; poolAddress: string }> {
    const walletClient = this.client.getWalletClient()
    
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: { public: this.client.getPublicClient(), wallet: walletClient }
    })

    // Call createPool function
    const hash = await factory.write.createPool([
      poolData,
      creatorFid,
      milestones,
      template
    ], {
      value: NETWORK_CONFIG[this.client.getNetwork()].creationFee
    })

    // Get transaction receipt to find pool address
    const receipt = await this.client.getPublicClient().waitForTransactionReceipt({ hash })
    
    // Extract pool address from logs (simplified - would need proper event parsing)
    const poolAddress = '0x1234567890123456789012345678901234567890' // TODO: Extract from logs
    
    return { hash, poolAddress }
  }

  async getPoolCount(): Promise<number> {
    const factory = getContract({
      address: this.factoryAddress,
      abi: UPOOL_FACTORY_ABI,
      client: this.client.getPublicClient()
    })

    // getFactoryStats returns [totalPools, totalFees, creationFee]
    const [totalPools] = await factory.read.getFactoryStats()
    return Number(totalPools)
  }
}

// ✅ **REGISTRY SERVICE** - Pool discovery and registration
export class UPoolRegistryService {
  private client: UPoolViemClient
  private registryAddress: Address

  constructor(client: UPoolViemClient) {
    this.client = client
    this.registryAddress = CONTRACT_ADDRESSES.UPOOL_REGISTRY[client.getNetwork()]
    
    if (this.registryAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Registry contract not deployed on ${client.getNetwork()}`)
    }
  }

  async getTotalPools(): Promise<bigint> {
    const registry = getContract({
      address: this.registryAddress,
      abi: UPOOL_REGISTRY_ABI,
      client: this.client.getPublicClient()
    })

    return await registry.read.getTotalPools()
  }

  async getPublicPools(offset: number, limit: number): Promise<Address[]> {
    const registry = getContract({
      address: this.registryAddress,
      abi: UPOOL_REGISTRY_ABI,
      client: this.client.getPublicClient()
    })

    return await registry.read.getPublicPools([BigInt(offset), BigInt(limit)])
  }
}

// ✅ **POOL SERVICE** - Individual pool interactions
export class UPoolService {
  private client: UPoolViemClient
  private poolAddress: Address

  constructor(client: UPoolViemClient, poolAddress: Address) {
    this.client = client
    this.poolAddress = poolAddress
  }

  async getPoolData(): Promise<any> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return await pool.read.getPoolData()
  }

  async getPoolStats(): Promise<any> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return await pool.read.getPoolStats()
  }

  async getAllMilestones(): Promise<any[]> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return await pool.read.getAllMilestones()
  }

  async getAllMembers(): Promise<any[]> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return await pool.read.getAllMembers()
  }

  async getAllContributions(): Promise<any[]> {
    const pool = getContract({
      address: this.poolAddress,
      abi: UPOOL_ABI,
      client: this.client.getPublicClient()
    })

    return await pool.read.getAllContributions()
  }
}

// ✅ **CONTRACT HELPERS** - Utility functions
export class UPoolContractHelpers {
  static formatEthAmount(amount: bigint): string {
    return formatEther(amount)
  }

  static parseEthAmount(amount: string): bigint {
    return parseEther(amount)
  }

  static getFundingProgress(totalRaised: bigint, fundingGoal: bigint): number {
    if (fundingGoal === 0n) return 0
    return Number((totalRaised * 100n) / fundingGoal)
  }

  static calculateMilestonePayout(fundingGoal: bigint, percentageBasisPoints: bigint): bigint {
    return (fundingGoal * percentageBasisPoints) / 10000n
  }

  static riskStrategyToString(strategy: number): string {
    switch (strategy) {
      case 0: return 'Low Risk'
      case 1: return 'Medium Risk'
      case 2: return 'High Risk'
      default: return 'Unknown'
    }
  }

  static approvalMethodToString(method: number): string {
    switch (method) {
      case 0: return 'Majority Vote'
      case 1: return 'Percentage Threshold'
      case 2: return 'Number Threshold'
      case 3: return 'Creator Only'
      default: return 'Unknown'
    }
  }
}

// ✅ **MAIN CONTRACT SERVICE** - Unified interface
export class UPoolContractService {
  private client: UPoolViemClient
  public factory: UPoolFactoryService
  public registry: UPoolRegistryService

  constructor(network: NetworkType = 'base-sepolia', privateKey?: string) {
    this.client = new UPoolViemClient(network, privateKey)
    this.factory = new UPoolFactoryService(this.client)
    this.registry = new UPoolRegistryService(this.client)
  }

  getPoolService(poolAddress: Address): UPoolService {
    return new UPoolService(this.client, poolAddress)
  }

  async isDeployed(): Promise<boolean> {
    try {
      const network = this.client.getNetwork()
      const factoryAddress = CONTRACT_ADDRESSES.UPOOL_FACTORY[network]
      const registryAddress = CONTRACT_ADDRESSES.UPOOL_REGISTRY[network]
      
      return factoryAddress !== '0x0000000000000000000000000000000000000000' &&
             registryAddress !== '0x0000000000000000000000000000000000000000'
    } catch {
      return false
    }
  }

  getAllContractAddresses() {
    const network = this.client.getNetwork()
    return {
      factory: CONTRACT_ADDRESSES.UPOOL_FACTORY[network],
      registry: CONTRACT_ADDRESSES.UPOOL_REGISTRY[network],
      implementation: CONTRACT_ADDRESSES.UPOOL_IMPLEMENTATION[network],
      network
    }
  }
}