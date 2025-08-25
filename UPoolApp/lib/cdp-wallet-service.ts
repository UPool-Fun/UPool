import { Coinbase, Wallet } from '@coinbase/coinbase-sdk'

// Initialize CDP SDK - only on server side
let isConfigured = false

function configureCDP() {
  if (isConfigured || typeof window !== 'undefined') return
  
  const apiKeyName = process.env.CDP_API_KEY_NAME
  const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY
  
  if (!apiKeyName || !apiKeyPrivateKey) {
    throw new Error('CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY must be set')
  }
  
  try {
    Coinbase.configure({
      apiKeyName,
      privateKey: apiKeyPrivateKey,
    })
    isConfigured = true
    console.log('✅ CDP SDK configured successfully')
  } catch (error) {
    console.error('❌ Failed to configure CDP SDK:', error)
    throw error
  }
}

export interface PoolWalletInfo {
  walletId: string
  address: string
  mnemonic?: string
  seed?: string
}

export class CDPWalletService {
  /**
   * Create a new server wallet for a pool
   */
  static async createPoolWallet(): Promise<PoolWalletInfo> {
    try {
      configureCDP()
      
      console.log('🔑 Creating new CDP wallet for pool...')
      
      // Create a new developer-managed wallet
      const wallet = await Wallet.create()
      const address = await wallet.getDefaultAddress()
      
      console.log('✅ Pool wallet created successfully:', address.toString())
      
      // Export wallet data for storage
      const walletData = wallet.export()
      
      return {
        walletId: wallet.getId(),
        address: address.toString(),
        mnemonic: walletData.mnemonic,
        seed: walletData.seed,
      }
    } catch (error) {
      console.error('❌ Error creating pool wallet:', error)
      throw new Error('Failed to create pool wallet: ' + (error as Error).message)
    }
  }
  
  /**
   * Import an existing wallet from stored data
   */
  static async importPoolWallet(walletData: { 
    walletId: string
    mnemonic?: string 
    seed?: string 
  }): Promise<Wallet> {
    try {
      configureCDP()
      
      if (!walletData.mnemonic && !walletData.seed) {
        throw new Error('Either mnemonic or seed is required to import wallet')
      }
      
      // Import wallet using mnemonic
      if (walletData.mnemonic) {
        const wallet = await Wallet.import({
          walletId: walletData.walletId,
          mnemonic: walletData.mnemonic,
        })
        return wallet
      }
      
      // Import wallet using seed (if available)
      if (walletData.seed) {
        const wallet = await Wallet.import({
          walletId: walletData.walletId,
          seed: walletData.seed,
        })
        return wallet
      }
      
      throw new Error('No valid import method available')
    } catch (error) {
      console.error('❌ Error importing pool wallet:', error)
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
  }): Promise<string> {
    try {
      const wallet = await this.importPoolWallet(walletData)
      const address = await wallet.getDefaultAddress()
      const balance = await address.getBalance('eth')
      
      return balance.toString()
    } catch (error) {
      console.error('❌ Error getting pool wallet balance:', error)
      throw new Error('Failed to get pool wallet balance: ' + (error as Error).message)
    }
  }
  
  /**
   * Transfer funds from pool wallet
   */
  static async transferFromPool(
    walletData: {
      walletId: string
      mnemonic?: string
      seed?: string
    },
    toAddress: string,
    amount: string
  ): Promise<string> {
    try {
      const wallet = await this.importPoolWallet(walletData)
      const address = await wallet.getDefaultAddress()
      
      // Create transfer transaction
      const transfer = await address.createTransfer({
        amount: parseFloat(amount),
        assetId: 'eth',
        destination: toAddress,
      })
      
      // Wait for confirmation
      await transfer.wait()
      
      return transfer.getTransactionHash() || 'unknown'
    } catch (error) {
      console.error('❌ Error transferring from pool wallet:', error)
      throw new Error('Failed to transfer from pool wallet: ' + (error as Error).message)
    }
  }
}