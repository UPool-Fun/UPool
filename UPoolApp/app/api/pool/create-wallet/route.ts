import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // This endpoint is deprecated - we now use user wallets instead of individual pool wallets
  console.warn('⚠️ DEPRECATED: /api/pool/create-wallet endpoint called. Use /api/user/create-wallet instead.')
  
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. UPool now uses user-specific wallets instead of individual pool wallets.',
      migration: 'Use /api/user/create-wallet endpoint instead',
      deprecatedSince: '2025-01-02'
    },
    { status: 410 } // 410 Gone - resource permanently removed
  )
}