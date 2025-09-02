import { NextRequest, NextResponse } from 'next/server'
import { CDPWalletService } from '@/lib/cdp-wallet-service'
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// User wallet document interface
interface UserWalletDocument {
  id: string
  creatorAddress: string
  creatorFid?: string
  cdpWalletId: string
  cdpWalletAddress: string
  cdpWalletMnemonic: string
  cdpWalletSeed: string
  poolIds: string[]
  totalPools: number
  totalFundsManaged: string
  status: 'active' | 'suspended' | 'migrated'
  version: string
  createdAt: Timestamp
  updatedAt: Timestamp
  lastUsedAt: Timestamp
}

// Helper functions (moved from UserWalletService to avoid circular dependency)
function generateUserId(walletAddress: string): string {
  if (walletAddress.startsWith('farcaster:')) {
    return walletAddress
  }
  return `wallet_${walletAddress.toLowerCase().slice(2, 12)}`
}

async function getUserWallet(walletAddress: string): Promise<UserWalletDocument | null> {
  try {
    const userId = generateUserId(walletAddress)
    const userWalletRef = doc(db, 'user_wallets', userId)
    const userWalletSnap = await getDoc(userWalletRef)
    
    if (userWalletSnap.exists()) {
      return userWalletSnap.data() as UserWalletDocument
    }
    return null
  } catch (error) {
    console.error('Error getting user wallet:', error)
    throw new Error('Failed to get user wallet')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { creatorAddress, creatorFid, source, poolId } = await request.json()
    
    if (!creatorAddress) {
      return NextResponse.json(
        { error: 'Creator address is required' },
        { status: 400 }
      )
    }
    
    console.log('🔑 Creating or getting user wallet for:', creatorAddress)
    
    const userId = generateUserId(creatorAddress)
    
    // Check if user wallet already exists
    let userWallet = await getUserWallet(creatorAddress)
    
    if (userWallet) {
      console.log('✅ User wallet already exists, returning existing')
      
      // If poolId is provided, associate it
      if (poolId) {
        const userWalletRef = doc(db, 'user_wallets', userId)
        await updateDoc(userWalletRef, {
          poolIds: arrayUnion(poolId),
          updatedAt: serverTimestamp(),
          lastUsedAt: serverTimestamp()
        })
      }
      
      return NextResponse.json({
        success: true,
        walletId: userWallet.cdpWalletId,
        address: userWallet.cdpWalletAddress,
        totalPools: userWallet.totalPools,
        status: userWallet.status
      })
    }
    
    // Create new CDP server wallet
    console.log('🔨 Creating new CDP server wallet...')
    const cdpWallet = await CDPWalletService.createPoolWallet()
    
    // Create user wallet document
    const userWalletData: Omit<UserWalletDocument, 'id'> = {
      creatorAddress,
      ...(creatorFid && { creatorFid }),
      cdpWalletId: cdpWallet.walletId,
      cdpWalletAddress: cdpWallet.address,
      cdpWalletMnemonic: cdpWallet.mnemonic || '',
      cdpWalletSeed: cdpWallet.seed || '',
      poolIds: poolId ? [poolId] : [],
      totalPools: poolId ? 1 : 0,
      totalFundsManaged: '0',
      status: 'active',
      version: '1.0.0',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      lastUsedAt: serverTimestamp() as Timestamp
    }
    
    // Save to Firestore
    const userWalletRef = doc(db, 'user_wallets', userId)
    await setDoc(userWalletRef, userWalletData)
    
    console.log('✅ User wallet created successfully:', cdpWallet.address)
    
    return NextResponse.json({
      success: true,
      walletId: cdpWallet.walletId,
      address: cdpWallet.address,
      mnemonic: cdpWallet.mnemonic,
      seed: cdpWallet.seed
    })
    
  } catch (error) {
    console.error('❌ Error creating user wallet:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create user wallet',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorAddress = searchParams.get('address')
    
    if (!creatorAddress) {
      return NextResponse.json(
        { error: 'Creator address is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Getting user wallet for:', creatorAddress)
    
    const userWallet = await getUserWallet(creatorAddress)
    
    if (!userWallet) {
      return NextResponse.json(
        { error: 'User wallet not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      userWalletId: userWallet.cdpWalletId,
      userWalletAddress: userWallet.cdpWalletAddress,
      totalPools: userWallet.totalPools,
      status: userWallet.status,
      lastUsedAt: userWallet.lastUsedAt
    })
    
  } catch (error) {
    console.error('❌ Error getting user wallet:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get user wallet',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}