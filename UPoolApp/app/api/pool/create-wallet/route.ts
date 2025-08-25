import { NextRequest, NextResponse } from 'next/server'
import { CDPWalletService } from '@/lib/cdp-wallet-service'
import { PoolService } from '@/lib/pool-service'

export async function POST(request: NextRequest) {
  try {
    const { poolId } = await request.json()
    
    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID is required' },
        { status: 400 }
      )
    }
    
    // Verify pool exists
    const pool = await PoolService.getPool(poolId)
    if (!pool) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      )
    }
    
    // Check if pool already has a wallet
    if (pool.poolWalletId) {
      return NextResponse.json(
        { 
          success: true, 
          walletAddress: pool.poolWalletAddress,
          message: 'Pool already has a wallet'
        },
        { status: 200 }
      )
    }
    
    console.log('🔑 Creating CDP wallet for pool:', poolId)
    
    // Create new CDP wallet for the pool
    const walletInfo = await CDPWalletService.createPoolWallet()
    
    console.log('✅ CDP wallet created:', walletInfo.address)
    
    // Update pool with wallet information
    await PoolService.updatePool(poolId, {
      poolWalletId: walletInfo.walletId,
      poolWalletAddress: walletInfo.address,
      poolWalletMnemonic: walletInfo.mnemonic, // TODO: Encrypt in production
      poolWalletSeed: walletInfo.seed, // TODO: Encrypt in production
    })
    
    console.log('✅ Pool updated with wallet information')
    
    return NextResponse.json({
      success: true,
      walletId: walletInfo.walletId,
      walletAddress: walletInfo.address,
    })
    
  } catch (error) {
    console.error('❌ Error creating pool wallet:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create pool wallet',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}