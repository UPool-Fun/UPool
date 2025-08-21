import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  PoolDocument, 
  CreatePoolDocument, 
  PoolData, 
  COLLECTIONS 
} from './firestore-schema'

export class PoolService {
  /**
   * Create a new pool document in Firestore
   */
  static async createPool(poolData: {
    creatorAddress: string
    creatorFid?: string
    poolData: PoolData
    source?: 'web' | 'farcaster' | 'mobile'
  }): Promise<string> {
    try {
      // Create base document without undefined fields
      const newPool: any = {
        creatorAddress: poolData.creatorAddress,
        status: 'draft',
        poolData: poolData.poolData,
        version: '1.0.0',
        source: poolData.source || 'web',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Only add creatorFid if it has a value
      if (poolData.creatorFid !== undefined && poolData.creatorFid !== null && poolData.creatorFid !== '') {
        newPool.creatorFid = poolData.creatorFid
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.POOLS), newPool)
      return docRef.id
    } catch (error) {
      console.error('Error creating pool:', error)
      throw new Error('Failed to create pool')
    }
  }

  /**
   * Update an existing pool document
   */
  static async updatePool(poolId: string, updates: Partial<PoolDocument>): Promise<void> {
    try {
      const poolRef = doc(db, COLLECTIONS.POOLS, poolId)
      
      // Filter out undefined values from updates
      const cleanUpdates: any = {
        updatedAt: serverTimestamp()
      }
      
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key]
        if (value !== undefined && value !== null) {
          cleanUpdates[key] = value
        }
      })

      await updateDoc(poolRef, cleanUpdates)
    } catch (error) {
      console.error('Error updating pool:', error)
      throw new Error('Failed to update pool')
    }
  }

  /**
   * Get a pool by ID
   */
  static async getPool(poolId: string): Promise<PoolDocument | null> {
    try {
      const poolRef = doc(db, COLLECTIONS.POOLS, poolId)
      const poolSnap = await getDoc(poolRef)
      
      if (poolSnap.exists()) {
        return {
          id: poolSnap.id,
          ...poolSnap.data()
        } as PoolDocument
      }
      return null
    } catch (error) {
      console.error('Error getting pool:', error)
      throw new Error('Failed to get pool')
    }
  }

  /**
   * Get pools by creator address
   */
  static async getPoolsByCreator(creatorAddress: string): Promise<PoolDocument[]> {
    try {
      const poolsQuery = query(
        collection(db, COLLECTIONS.POOLS),
        where('creatorAddress', '==', creatorAddress),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(poolsQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PoolDocument))
    } catch (error) {
      console.error('Error getting pools by creator:', error)
      throw new Error('Failed to get creator pools')
    }
  }

  /**
   * Get draft pools by creator (for resuming)
   */
  static async getDraftPools(creatorAddress: string): Promise<PoolDocument[]> {
    try {
      const draftsQuery = query(
        collection(db, COLLECTIONS.POOLS),
        where('creatorAddress', '==', creatorAddress),
        where('status', '==', 'draft'),
        orderBy('updatedAt', 'desc'),
        limit(5)
      )
      
      const querySnapshot = await getDocs(draftsQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PoolDocument))
    } catch (error) {
      console.error('Error getting draft pools:', error)
      throw new Error('Failed to get draft pools')
    }
  }

  /**
   * Save pool as draft (for step-by-step saving)
   */
  static async saveDraft(poolId: string, poolData: PoolData): Promise<void> {
    try {
      await this.updatePool(poolId, {
        poolData,
        status: 'draft'
      })
    } catch (error) {
      console.error('Error saving draft:', error)
      throw new Error('Failed to save draft')
    }
  }

  /**
   * Mark pool as payment processing
   */
  static async markPaymentProcessing(poolId: string, paymentId: string): Promise<void> {
    try {
      await this.updatePool(poolId, {
        status: 'payment_processing',
        paymentId,
        paymentStatus: 'processing'
      })
    } catch (error) {
      console.error('Error marking payment processing:', error)
      throw new Error('Failed to update payment status')
    }
  }

  /**
   * Mark pool as active after successful payment
   */
  static async activatePool(poolId: string, transactionHash?: string): Promise<void> {
    try {
      await this.updatePool(poolId, {
        status: 'active',
        paymentStatus: 'completed',
        transactionHash,
        activatedAt: serverTimestamp() as Timestamp
      })
    } catch (error) {
      console.error('Error activating pool:', error)
      throw new Error('Failed to activate pool')
    }
  }

  /**
   * Get public pools for discovery
   */
  static async getPublicPools(limitCount: number = 20): Promise<PoolDocument[]> {
    try {
      const publicQuery = query(
        collection(db, COLLECTIONS.POOLS),
        where('poolData.visibility', '==', 'public'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(publicQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PoolDocument))
    } catch (error) {
      console.error('Error getting public pools:', error)
      throw new Error('Failed to get public pools')
    }
  }

  /**
   * Check if vanity URL is available
   */
  static async isVanityUrlAvailable(vanityUrl: string, excludePoolId?: string): Promise<boolean> {
    try {
      const urlQuery = query(
        collection(db, COLLECTIONS.POOLS),
        where('poolData.vanityUrl', '==', vanityUrl)
      )
      
      const querySnapshot = await getDocs(urlQuery)
      
      // If excluding a specific pool ID (for updates), filter it out
      if (excludePoolId) {
        return querySnapshot.docs.filter(doc => doc.id !== excludePoolId).length === 0
      }
      
      return querySnapshot.empty
    } catch (error) {
      console.error('Error checking vanity URL:', error)
      throw new Error('Failed to check vanity URL availability')
    }
  }
}