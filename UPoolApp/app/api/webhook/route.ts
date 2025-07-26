import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the webhook payload for debugging
    console.log('Farcaster webhook received:', body)
    
    // Handle different webhook event types
    switch (body.type) {
      case 'frame_added':
        console.log('Frame added to user app list:', body.data)
        // Handle when user adds UPool to their app list
        break
        
      case 'frame_removed':
        console.log('Frame removed from user app list:', body.data) 
        // Handle when user removes UPool from their app list
        break
        
      case 'notifications_enabled':
        console.log('Notifications enabled:', body.data)
        // Handle when user enables notifications for UPool
        break
        
      case 'notifications_disabled':
        console.log('Notifications disabled:', body.data)
        // Handle when user disables notifications for UPool
        break
        
      default:
        console.log('Unknown webhook type:', body.type)
    }
    
    // Always return success to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'UPool Farcaster Webhook Endpoint',
    status: 'active'
  })
}