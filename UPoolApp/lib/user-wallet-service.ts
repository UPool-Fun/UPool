import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
// Note: CDP SDK usage moved to API routes for server-side only
// import { CDPWalletService, PoolWalletInfo } from './cdp-wallet-service'

// CDP Wallet interface for type safety without importing server-only SDK
interface PoolWalletInfo {
  walletId: string
  address: string
  mnemonic?: string
  seed?: string
}

// User wallet document interface for Firestore
export interface UserWalletDocument {
  id: string                // wallet_0x123abc... or farcaster:12345
  creatorAddress: string    // Original connected wallet address
  creatorFid?: string       // Farcaster ID if applicable
  
  // CDP Server Wallet information
  cdpWalletId: string       
  cdpWalletAddress: string  
  cdpWalletMnemonic: string // Should be encrypted in production
  cdpWalletSeed: string     // Should be encrypted in production
  
  // Pool associations
  poolIds: string[]         // All pools owned by this user
  totalPools: number
  totalFundsManaged: string // Total funds across all pools
  
  // Status and metadata
  status: 'active' | 'suspended' | 'migrated'
  version: string           // Schema version for migrations
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  lastUsedAt: Timestamp
}

export interface CreateUserWalletData {
  creatorAddress: string
  creatorFid?: string
  source?: 'web' | 'farcaster' | 'mobile'
}

export class UserWalletService {
  private static readonly COLLECTION_NAME = 'user_wallets'
  
  /**
   * Generate consistent user ID from wallet address or Farcaster ID
   * Following exampleApp pattern for wallet-based user identification
   */
  static generateUserId(walletAddress: string): string {
    if (walletAddress.startsWith('farcaster:')) {
      return walletAddress // Keep Farcaster ID as-is: "farcaster:12345"
    }
    
    // Web3 wallet pattern: "wallet_0x123abc..."
    return `wallet_${walletAddress.toLowerCase().slice(2, 12)}`
  }
  
  /**
   * Get user wallet by wallet address or Farcaster ID
   */
  static async getUserWallet(walletAddress: string): Promise<UserWalletDocument | null> {
    try {
      const userId = this.generateUserId(walletAddress)
      console.log('🔍 Getting user wallet for ID:', userId)
      
      const userWalletRef = doc(db, this.COLLECTION_NAME, userId)
      const userWalletSnap = await getDoc(userWalletRef)
      
      if (userWalletSnap.exists()) {
        const data = userWalletSnap.data() as UserWalletDocument
        console.log('✅ User wallet found:', data.cdpWalletAddress)
        return data
      }
      
      console.log('📭 No user wallet found for:', userId)
      return null
      
    } catch (error) {
      console.error('❌ Error getting user wallet:', error)
      throw new Error('Failed to get user wallet')
    }
  }
  
  /**
   * Create new user wallet with CDP server wallet
   * Each user gets one server wallet that manages all their pools
   */
  static async createUserWallet(data: CreateUserWalletData): Promise<UserWalletDocument> {
    try {
      const userId = this.generateUserId(data.creatorAddress)
      console.log('🔑 Creating user wallet for ID:', userId)
      
      // Check if user wallet already exists
      const existingWallet = await this.getUserWallet(data.creatorAddress)
      if (existingWallet) {
        console.log('✅ User wallet already exists, returning existing')
        return existingWallet
      }
      
      // Create CDP server wallet for this user via API call
      console.log('🔨 Creating CDP server wallet via API...')
      const response = await fetch('/api/user/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorAddress: data.creatorAddress,
          creatorFid: data.creatorFid,
          source: data.source || 'web'
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create user wallet: ${response.statusText}`)
      }
      
      const cdpWallet: PoolWalletInfo = await response.json()
      
      // Create user wallet document
      const userWalletData: Omit<UserWalletDocument, 'id'> = {
        creatorAddress: data.creatorAddress,
        ...(data.creatorFid && { creatorFid: data.creatorFid }),
        
        // CDP Server Wallet
        cdpWalletId: cdpWallet.walletId,
        cdpWalletAddress: cdpWallet.address,
        cdpWalletMnemonic: cdpWallet.mnemonic || '',
        cdpWalletSeed: cdpWallet.seed || '',
        
        // Pool management
        poolIds: [],
        totalPools: 0,
        totalFundsManaged: '0',
        
        // Metadata
        status: 'active',
        version: '1.0.0',
        
        // Timestamps
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastUsedAt: serverTimestamp() as Timestamp
      }
      
      // Save to Firestore
      const userWalletRef = doc(db, this.COLLECTION_NAME, userId)
      await setDoc(userWalletRef, userWalletData)
      
      const result = { id: userId, ...userWalletData } as UserWalletDocument
      console.log('✅ User wallet created successfully:', result.cdpWalletAddress)
      
      return result
      
    } catch (error) {
      console.error('❌ Error creating user wallet:', error)
      throw new Error('Failed to create user wallet: ' + (error as Error).message)
    }
  }
  
  /**
   * Associate a pool with a user wallet
   */
  static async addPoolToUserWallet(walletAddress: string, poolId: string): Promise<void> {
    try {
      const userId = this.generateUserId(walletAddress)
      console.log('🔗 Adding pool to user wallet:', { userId, poolId })
      
      const userWalletRef = doc(db, this.COLLECTION_NAME, userId)
      
      // Update user wallet with new pool
      await updateDoc(userWalletRef, {
        poolIds: arrayUnion(poolId),
        totalPools: arrayUnion(poolId).length, // This will be calculated properly in a transaction
        updatedAt: serverTimestamp(),
        lastUsedAt: serverTimestamp()
      })
      
      console.log('✅ Pool added to user wallet successfully')
      
    } catch (error) {
      console.error('❌ Error adding pool to user wallet:', error)
      throw new Error('Failed to associate pool with user wallet')
    }
  }
  
  /**
   * Remove a pool from user wallet (for deletions)
   */
  static async removePoolFromUserWallet(walletAddress: string, poolId: string): Promise<void> {
    try {
      const userId = this.generateUserId(walletAddress)
      console.log('🗑️ Removing pool from user wallet:', { userId, poolId })
      
      const userWalletRef = doc(db, this.COLLECTION_NAME, userId)
      
      await updateDoc(userWalletRef, {
        poolIds: arrayRemove(poolId),
        updatedAt: serverTimestamp(),
        lastUsedAt: serverTimestamp()
      })
      
      console.log('✅ Pool removed from user wallet successfully')
      
    } catch (error) {
      console.error('❌ Error removing pool from user wallet:', error)
      throw new Error('Failed to remove pool from user wallet')
    }
  }
  
  /**
   * Update user wallet last used timestamp
   */
  static async updateLastUsed(walletAddress: string): Promise<void> {
    try {
      const userId = this.generateUserId(walletAddress)
      const userWalletRef = doc(db, this.COLLECTION_NAME, userId)
      
      await updateDoc(userWalletRef, {
        lastUsedAt: serverTimestamp()
      })
      
    } catch (error) {
      console.error('❌ Error updating last used:', error)
      // Don't throw - this is not critical
    }
  }
  
  /**
   * Get or create user wallet - main entry point
   * This ensures every user has a server wallet when they create their first pool
   */
  static async getOrCreateUserWallet(data: CreateUserWalletData): Promise<UserWalletDocument> {
    try {
      console.log('🔄 Getting or creating user wallet for:', data.creatorAddress)
      
      // Try to get existing wallet first
      let userWallet = await this.getUserWallet(data.creatorAddress)
      
      if (userWallet) {
        console.log('✅ Found existing user wallet')
        // Update last used timestamp
        await this.updateLastUsed(data.creatorAddress)
        return userWallet
      }
      
      // Create new user wallet if none exists
      console.log('🔨 Creating new user wallet...')
      userWallet = await this.createUserWallet(data)
      
      return userWallet
      
    } catch (error) {
      console.error('❌ Error in getOrCreateUserWallet:', error)
      throw error
    }
  }
}