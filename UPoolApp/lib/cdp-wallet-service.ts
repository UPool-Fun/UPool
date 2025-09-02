// Real CDP Server Wallet integration for UPool
// Server-side only - uses Coinbase CDP SDK for secure wallet management

import { Coinbase, Wallet } from '@coinbase/coinbase-sdk'

export interface PoolWalletInfo {
  walletId: string
  address: string
  mnemonic?: string
  seed?: string
}

export interface WalletBalance {
  amount: string
  currency: string
  network: string
}

export interface TransactionResult {
  transactionHash: string
  status: 'pending' | 'completed' | 'failed'
  blockNumber?: number
  gasUsed?: string
  timestamp?: Date
}

export class CDPWalletService {
  private static coinbase: Coinbase | null = null
  
  /**
   * Initialize CDP SDK with API credentials
   * Called automatically on first use
   */
  private static async initializeCDP(): Promise<void> {
    if (this.coinbase) return
    
    try {
      console.log('🔧 Initializing Coinbase CDP SDK...')
      
      // Initialize with credentials from environment
      this.coinbase = new Coinbase({
        apiKeyName: process.env.CDP_API_KEY_NAME || 'default',
        privateKey: process.env.CDP_API_KEY_PRIVATE_KEY || '',
        networkId: process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia',
        debugging: process.env.NODE_ENV === 'development'
      })
      
      console.log('✅ CDP SDK initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize CDP SDK:', error)
      throw new Error('CDP SDK initialization failed: ' + (error as Error).message)
    }
  }
  
  /**
   * Create a new server wallet for a pool
   * Each pool gets its own dedicated blockchain wallet
   */
  static async createPoolWallet(): Promise<PoolWalletInfo> {
    try {
      await this.initializeCDP()
      
      console.log('🔑 Creating real CDP server wallet...')
      
      // Create new wallet using CDP SDK
      const wallet = await Wallet.create({
        networkId: process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
      })
      
      // Get wallet details
      const address = await wallet.getDefaultAddress()
      const walletData = wallet.export()
      
      console.log('✅ Real CDP wallet created:', address.toString())
      
      return {
        walletId: wallet.getId(),
        address: address.toString(),
        mnemonic: walletData.mnemonic,
        seed: walletData.seed,
      }
      
    } catch (error) {
      console.error('❌ Error creating CDP wallet:', error)
      
      // Fallback to mock in development if CDP fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔄 Falling back to mock wallet for development')
        return this.createMockWallet()
      }
      
      throw new Error('Failed to create pool wallet: ' + (error as Error).message)
    }
  }
  
  /**
   * Import an existing wallet from stored credentials
   */
  static async importPoolWallet(walletData: { 
    walletId: string
    mnemonic?: string 
    seed?: string 
  }): Promise<Wallet> {
    try {
      await this.initializeCDP()
      
      console.log('📥 Importing CDP wallet:', walletData.walletId)
      
      if (!walletData.seed && !walletData.mnemonic) {
        throw new Error('Wallet seed or mnemonic required for import')
      }
      
      // Import wallet using stored credentials
      const wallet = await Wallet.import({
        seed: walletData.seed || walletData.mnemonic!,
        networkId: process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
      })
      
      console.log('✅ CDP wallet imported successfully')
      return wallet
      
    } catch (error) {
      console.error('❌ Error importing CDP wallet:', error)
      throw new Error('Failed to import pool wallet: ' + (error as Error).message)
    }
  }
  
  /**
   * Get wallet balance for a pool
   */
  static async getPoolWalletBalance(walletData: {
    walletId: string
    mnemonic?: string
    seed?: string
  }): Promise<WalletBalance[]> {
    try {
      const wallet = await this.importPoolWallet(walletData)
      const address = await wallet.getDefaultAddress()
      
      console.log('💰 Getting balance for CDP wallet:', address.toString())
      
      // Get ETH balance
      const ethBalance = await address.getBalance('ETH')
      
      const balances: WalletBalance[] = [
        {
          amount: ethBalance.toString(),
          currency: 'ETH',
          network: process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
        }
      ]
      
      // Try to get USDC balance if available
      try {
        const usdcBalance = await address.getBalance('USDC')
        balances.push({
          amount: usdcBalance.toString(),
          currency: 'USDC',
          network: process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? 'base-mainnet' : 'base-sepolia'
        })
      } catch {
        // USDC balance not available or zero
      }
      
      console.log('✅ Wallet balances retrieved:', balances)
      return balances
      
    } catch (error) {
      console.error('❌ Error getting wallet balance:', error)
      throw new Error('Failed to get wallet balance: ' + (error as Error).message)
    }
  }
  
  /**
   * Transfer funds from pool wallet to another address
   */
  static async transferFromPool(
    walletData: {
      walletId: string
      mnemonic?: string
      seed?: string
    },
    toAddress: string,
    amount: string,
    currency: 'ETH' | 'USDC' = 'ETH'
  ): Promise<TransactionResult> {
    try {
      const wallet = await this.importPoolWallet(walletData)
      const address = await wallet.getDefaultAddress()
      
      console.log('💸 Transferring', amount, currency, 'from pool wallet to:', toAddress)
      
      // Create and broadcast transfer
      const transfer = await address.createTransfer({
        amount,
        assetId: currency,
        destination: toAddress
      })
      
      await transfer.wait()
      
      console.log('✅ Transfer completed:', transfer.getTransactionHash())
      
      return {
        transactionHash: transfer.getTransactionHash() || '',
        status: 'completed',
        timestamp: new Date()
      }
      
    } catch (error) {
      console.error('❌ Error transferring funds:', error)
      throw new Error('Failed to transfer funds: ' + (error as Error).message)
    }
  }
  
  /**
   * Deploy a smart contract from pool wallet
   */
  static async deployContract(
    walletData: {
      walletId: string
      mnemonic?: string
      seed?: string
    },
    contractOptions: {
      abi: any[]
      bytecode: string
      constructorArgs?: any[]
    }
  ): Promise<{ contractAddress: string; transactionHash: string }> {
    try {
      const wallet = await this.importPoolWallet(walletData)
      const address = await wallet.getDefaultAddress()
      
      console.log('🚀 Deploying contract from pool wallet...')
      
      const deployment = await address.deployContract({
        abi: contractOptions.abi,
        bytecode: contractOptions.bytecode,
        constructorArgs: contractOptions.constructorArgs || []
      })
      
      await deployment.wait()
      
      const contractAddress = deployment.getContractAddress()
      const transactionHash = deployment.getTransactionHash()
      
      console.log('✅ Contract deployed:', { contractAddress, transactionHash })
      
      return {
        contractAddress: contractAddress || '',
        transactionHash: transactionHash || ''
      }
      
    } catch (error) {
      console.error('❌ Error deploying contract:', error)
      throw new Error('Failed to deploy contract: ' + (error as Error).message)
    }
  }
  
  /**
   * Execute a smart contract method from pool wallet
   */
  static async executeContract(
    walletData: {
      walletId: string
      mnemonic?: string
      seed?: string
    },
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = [],
    value: string = '0'
  ): Promise<TransactionResult> {
    try {
      const wallet = await this.importPoolWallet(walletData)
      const address = await wallet.getDefaultAddress()
      
      console.log('📞 Executing contract method:', { contractAddress, methodName, args })
      
      const invocation = await address.invokeContract({
        contractAddress,
        abi,
        method: methodName,
        args,
        amount: value
      })
      
      await invocation.wait()
      
      console.log('✅ Contract method executed:', invocation.getTransactionHash())
      
      return {
        transactionHash: invocation.getTransactionHash() || '',
        status: 'completed',
        timestamp: new Date()
      }
      
    } catch (error) {
      console.error('❌ Error executing contract:', error)
      throw new Error('Failed to execute contract: ' + (error as Error).message)
    }
  }
  
  /**
   * Development fallback - creates mock wallet when CDP is unavailable
   */
  private static async createMockWallet(): Promise<PoolWalletInfo> {
    const randomId = Math.random().toString(36).substring(2, 15)
    const mockAddress = `0x${randomId.padEnd(40, '0')}`
    
    console.log('🔄 Created mock wallet (development only):', mockAddress)
    
    return {
      walletId: `mock_${randomId}`,
      address: mockAddress,
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      seed: `seed_${randomId}`,
    }
  }
}