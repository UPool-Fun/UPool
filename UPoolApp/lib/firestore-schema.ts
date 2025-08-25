import { Timestamp } from 'firebase/firestore'

// Pool milestone interface
export interface Milestone {
  id: string
  title: string
  description: string
  percentage: number
}

// Supported pool currencies
export type PoolCurrency = 'ETH' | 'USDC' | 'EURC'

// Pool data interface matching the create flow
export interface PoolData {
  title: string
  description: string
  fundingGoal: string
  currency: PoolCurrency
  milestones: Milestone[]
  visibility: 'private' | 'link' | 'public'
  approvalMethod: 'majority' | 'percentage' | 'number' | 'creator'
  approvalThreshold: string
  poolName: string
  vanityUrl: string
  riskStrategy: 'low' | 'medium' | 'high'
}

// Pool document interface for Firestore
export interface PoolDocument {
  id: string
  creatorAddress: string
  creatorFid?: string // Farcaster ID if available
  status: 'draft' | 'pending_payment' | 'payment_processing' | 'active' | 'completed' | 'cancelled'
  poolData: PoolData
  
  // Pool wallet information (CDP Server Wallet)
  poolWalletId?: string
  poolWalletAddress?: string
  poolWalletMnemonic?: string // Encrypted in production
  poolWalletSeed?: string // Encrypted in production
  
  // Payment tracking
  paymentId?: string
  paymentStatus?: string
  paymentAmount?: string
  transactionHash?: string
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  activatedAt?: Timestamp
  completedAt?: Timestamp
  
  // Statistics
  totalRaised?: string
  contributorCount?: number
  milestonesCompleted?: number
  
  // Metadata
  version: string // Schema version for migrations
  source: 'web' | 'farcaster' | 'mobile'
}

// Pool contributor interface
export interface PoolContributor {
  id: string
  poolId: string
  address: string
  fid?: string
  amount: string
  transactionHash: string
  contributedAt: Timestamp
  isActive: boolean
}

// Pool milestone completion interface
export interface MilestoneCompletion {
  id: string
  poolId: string
  milestoneId: string
  completedBy: string
  proofUrl?: string
  proofDescription?: string
  votesFor: number
  votesAgainst: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp
  approvedAt?: Timestamp
}

// Firestore collection names
export const COLLECTIONS = {
  POOLS: 'pools',
  CONTRIBUTORS: 'contributors', 
  MILESTONES: 'milestone_completions',
  USERS: 'users'
} as const

// Helper type for creating new pool documents
export type CreatePoolDocument = Omit<PoolDocument, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp
  updatedAt?: Timestamp
  creatorFid?: string // Make this truly optional for creation
}