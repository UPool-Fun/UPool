import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "REPLACE_WITH_FARCASTER_HEADER",
      payload: process.env.FARCASTER_PAYLOAD || "REPLACE_WITH_FARCASTER_PAYLOAD",
      signature: process.env.FARCASTER_SIGNATURE || "REPLACE_WITH_FARCASTER_SIGNATURE"
    },
    frame: {
      name: "UPool",
      version: "1", 
      iconUrl: `${process.env.NEXT_PUBLIC_URL || 'https://upool.fun'}/Logo-beta.png`,
      homeUrl: process.env.NEXT_PUBLIC_URL || 'https://upool.fun',
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || `${process.env.NEXT_PUBLIC_URL || 'https://upool.fun'}/images/upool-embed-image.png`,
      buttonTitle: "Create Pool",
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || `${process.env.NEXT_PUBLIC_URL || 'https://upool.fun'}/images/upool-splash.png`,
      splashBackgroundColor: "#1e40af",
      webhookUrl: `${process.env.NEXT_PUBLIC_URL || 'https://upool.fun'}/api/webhook`
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}