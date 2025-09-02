import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient, type Address, type Hash } from 'viem'
import { base, baseSepolia, mainnet } from 'viem/chains'
import { detectEnvironment, isFarcasterEnvironment } from './environment-detection'

// Get chain configuration
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

/**
 * Create environment-aware public client for reading blockchain data
 * Works across browser and Farcaster environments
 */
export function createUPoolPublicClient(): PublicClient {
  const environment = detectEnvironment()
  
  // Use appropriate RPC endpoint based on environment and chain
  const transport = http(
    targetChain.id === base.id 
      ? (process.env.NEXT_PUBLIC_RPC_URL_BASE || 'https://mainnet.base.org')
      : (process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org')
  )

  console.log(`📡 Creating UPool public client for ${targetChain.name} in ${environment} environment`)
  
  return createPublicClient({
    chain: targetChain,
    transport,
    batch: {
      multicall: true, // Enable multicall for better performance
    },
  })
}

/**
 * Create environment-aware wallet client for transactions
 * Adapts to browser vs Farcaster wallet access patterns
 */
export function createUPoolWalletClient(): WalletClient | null {
  if (typeof window === 'undefined') {
    return null // No wallet client on server-side
  }

  const environment = detectEnvironment()
  
  try {
    if (isFarcasterEnvironment()) {
      console.log('📱 Creating Farcaster wallet client')
      
      // In Farcaster, check for embedded wallet provider
      const farcasterProvider = (window as any).farcaster || (window as any).ethereum
      
      if (farcasterProvider) {
        return createWalletClient({
          chain: targetChain,
          transport: custom(farcasterProvider),
        })
      } else {
        console.warn('⚠️ Farcaster provider not found')
        return null
      }
    } else {
      console.log('🌐 Creating browser wallet client')
      
      // In browser, use window.ethereum (MetaMask, Base Account, etc.)
      if ((window as any).ethereum) {
        return createWalletClient({
          chain: targetChain,
          transport: custom((window as any).ethereum),
        })
      } else {
        console.warn('⚠️ No Ethereum provider found in browser')
        return null
      }
    }
  } catch (error) {
    console.error('❌ Error creating wallet client:', error)
    return null
  }
}

/**
 * Enhanced transaction helper with environment-specific optimizations
 */
export class UPoolTransactionHelper {
  private publicClient: PublicClient
  private walletClient: WalletClient | null

  constructor() {
    this.publicClient = createUPoolPublicClient()
    this.walletClient = createUPoolWalletClient()
  }

  /**
   * Check if wallet client is available for transactions
   */
  canSendTransactions(): boolean {
    return this.walletClient !== null
  }

  /**
   * Get user's wallet address
   */
  async getWalletAddress(): Promise<Address | null> {
    if (!this.walletClient) {
      return null
    }

    try {
      const [address] = await this.walletClient.getAddresses()
      return address || null
    } catch (error) {
      console.error('❌ Error getting wallet address:', error)
      return null
    }
  }

  /**
   * Send transaction with environment-specific handling
   */
  async sendTransaction(txParams: {
    to: Address
    value?: bigint
    data?: `0x${string}`
  }): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client not available')
    }

    const environment = detectEnvironment()
    console.log(`💸 Sending transaction in ${environment} environment`)

    try {
      // Get wallet address
      const [account] = await this.walletClient.getAddresses()
      if (!account) {
        throw new Error('No wallet address available')
      }

      // Prepare transaction request
      const request = await this.walletClient.prepareTransactionRequest({
        account,
        to: txParams.to,
        value: txParams.value || 0n,
        data: txParams.data,
        chain: targetChain,
      })

      console.log('📋 Transaction request prepared:', {
        to: request.to,
        value: request.value?.toString(),
        gasLimit: request.gas?.toString(),
        environment
      })

      // Send transaction
      const hash = await this.walletClient.sendTransaction(request)
      console.log('✅ Transaction sent:', hash)

      return hash
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    }
  }

  /**
   * Wait for transaction confirmation with retries
   */
  async waitForTransaction(hash: Hash, confirmations = 1): Promise<any> {
    console.log(`⏳ Waiting for transaction ${hash} with ${confirmations} confirmations`)

    try {
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
        confirmations,
        timeout: 60_000, // 60 second timeout
      })

      console.log('✅ Transaction confirmed:', {
        hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status
      })

      return receipt
    } catch (error) {
      console.error('❌ Transaction confirmation failed:', error)
      throw error
    }
  }

  /**
   * Read contract data (view functions)
   */
  async readContract({
    address,
    abi,
    functionName,
    args = [],
  }: {
    address: Address
    abi: any[]
    functionName: string
    args?: any[]
  }): Promise<any> {
    try {
      console.log(`📖 Reading contract ${functionName} at ${address}`)

      const result = await this.publicClient.readContract({
        address,
        abi,
        functionName,
        args,
      })

      console.log(`✅ Contract read successful:`, { functionName, result })
      return result
    } catch (error) {
      console.error(`❌ Contract read failed:`, error)
      throw error
    }
  }

  /**
   * Write to contract (state-changing functions)
   */
  async writeContract({
    address,
    abi,
    functionName,
    args = [],
    value,
  }: {
    address: Address
    abi: any[]
    functionName: string
    args?: any[]
    value?: bigint
  }): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for contract writes')
    }

    try {
      console.log(`📝 Writing to contract ${functionName} at ${address}`)

      const [account] = await this.walletClient.getAddresses()
      if (!account) {
        throw new Error('No wallet address available')
      }

      // Simulate the contract call first
      const { request } = await this.publicClient.simulateContract({
        address,
        abi,
        functionName,
        args,
        account,
        value,
      })

      console.log('✅ Contract simulation successful')

      // Execute the transaction
      const hash = await this.walletClient.writeContract(request)
      console.log(`✅ Contract write transaction sent:`, hash)

      return hash
    } catch (error) {
      console.error(`❌ Contract write failed:`, error)
      throw error
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas({
    to,
    value,
    data,
  }: {
    to: Address
    value?: bigint
    data?: `0x${string}`
  }): Promise<bigint> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for gas estimation')
    }

    try {
      const [account] = await this.walletClient.getAddresses()
      if (!account) {
        throw new Error('No wallet address available')
      }

      const gasEstimate = await this.publicClient.estimateGas({
        account,
        to,
        value: value || 0n,
        data,
      })

      console.log(`⛽ Gas estimate:`, gasEstimate.toString())
      return gasEstimate
    } catch (error) {
      console.error('❌ Gas estimation failed:', error)
      throw error
    }
  }

  /**
   * Check if user is on the correct network
   */
  async checkNetwork(): Promise<boolean> {
    if (!this.walletClient) {
      return false
    }

    try {
      const chainId = await this.walletClient.getChainId()
      const isCorrectNetwork = chainId === targetChain.id
      
      if (!isCorrectNetwork) {
        console.warn(`⚠️ Wrong network. Expected ${targetChain.id}, got ${chainId}`)
      }

      return isCorrectNetwork
    } catch (error) {
      console.error('❌ Network check failed:', error)
      return false
    }
  }

  /**
   * Switch to the correct network (browser only)
   */
  async switchNetwork(): Promise<boolean> {
    if (!this.walletClient || isFarcasterEnvironment()) {
      console.log('ℹ️ Network switching not available in this environment')
      return false
    }

    try {
      await this.walletClient.switchChain({ id: targetChain.id })
      console.log(`✅ Switched to ${targetChain.name}`)
      return true
    } catch (error) {
      console.error('❌ Network switch failed:', error)
      
      // Try to add the network if switch failed
      try {
        await this.walletClient.addChain({ chain: targetChain })
        console.log(`✅ Added and switched to ${targetChain.name}`)
        return true
      } catch (addError) {
        console.error('❌ Failed to add network:', addError)
        return false
      }
    }
  }
}

/**
 * Global UPool transaction helper instance
 */
export const uPoolTxHelper = new UPoolTransactionHelper()

/**
 * Environment-aware transaction hook for React components
 */
export function useUPoolTransactions() {
  const environment = detectEnvironment()
  const canTransact = uPoolTxHelper.canSendTransactions()

  return {
    environment,
    canTransact,
    helper: uPoolTxHelper,
    isReady: canTransact && typeof window !== 'undefined'
  }
}

/**
 * UPool smart contract addresses (to be populated with actual deployments)
 */
export const UPOOL_CONTRACTS = {
  // Pool Management Contract
  POOL_MANAGER: '0x' as Address, // To be deployed
  
  // Pool Factory Contract  
  POOL_FACTORY: '0x' as Address, // To be deployed
  
  // Token Contracts (if any)
  UPOOL_TOKEN: '0x' as Address, // To be deployed
  
  // Yield Strategy Contracts (Morpho integration)
  YIELD_STRATEGY: '0x' as Address, // To be deployed
} as const

/**
 * Check if smart contracts are deployed and available
 */
export function areContractsDeployed(): boolean {
  return Object.values(UPOOL_CONTRACTS).some(address => address !== '0x')
}