import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const timestamp = new Date().toISOString()
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Enhanced logging with timestamp and metadata
    console.log(`🔔 [${timestamp}] Farcaster webhook received:`, {
      type: body.type,
      data: body.data,
      userAgent,
      body: JSON.stringify(body, null, 2)
    })
    
    // Handle different webhook event types
    switch (body.type) {
      case 'frame_added':
        console.log(`✅ [${timestamp}] User added UPool to their app list:`, {
          fid: body.data?.fid,
          username: body.data?.username,
          displayName: body.data?.displayName,
          appId: body.data?.appId
        })
        // TODO: Store user preference, analytics, onboarding flows
        break
        
      case 'frame_removed':
        console.log(`❌ [${timestamp}] User removed UPool from their app list:`, {
          fid: body.data?.fid,
          username: body.data?.username,
          appId: body.data?.appId
        })
        // TODO: Clean up user data, feedback collection
        break
        
      case 'notifications_enabled':
        console.log(`🔔 [${timestamp}] User enabled notifications:`, {
          fid: body.data?.fid,
          username: body.data?.username,
          notificationToken: body.data?.notificationToken ? 'present' : 'missing'
        })
        // TODO: Store notification token, set up notification preferences
        break
        
      case 'notifications_disabled':
        console.log(`🔕 [${timestamp}] User disabled notifications:`, {
          fid: body.data?.fid,
          username: body.data?.username
        })
        // TODO: Remove notification token, update preferences
        break
        
      default:
        console.log(`❓ [${timestamp}] Unknown webhook event type:`, {
          type: body.type,
          data: body.data
        })
    }
    
    // Log successful processing
    console.log(`✅ [${timestamp}] Webhook processed successfully for type: ${body.type}`)
    
    // Always return success to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      timestamp,
      processed: body.type 
    }, { status: 200 })
    
  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error(`❌ [${timestamp}] Webhook processing error:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: await request.text().catch(() => 'Failed to read body')
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        timestamp 
      },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing and health checks)
export async function GET() {
  const timestamp = new Date().toISOString()
  
  console.log(`🏥 [${timestamp}] Webhook health check accessed`)
  
  return NextResponse.json({
    message: 'UPool Farcaster Webhook Endpoint',
    status: 'active',
    timestamp,
    supportedEvents: [
      'frame_added',
      'frame_removed', 
      'notifications_enabled',
      'notifications_disabled'
    ],
    environment: process.env.NODE_ENV || 'unknown'
  })
}