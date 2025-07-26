# Farcaster Manifest Setup for UPool

This guide explains how to configure the Farcaster manifest for UPool to enable Mini App functionality.

## Overview

The Farcaster manifest is located at `/.well-known/farcaster.json` and enables:
- App discovery in Farcaster
- User ability to save the app to their app list
- Webhook notifications
- Deep integration with Farcaster ecosystem

## Files Created

### 1. Static Manifest
- **Location**: `/public/.well-known/farcaster.json`
- **Purpose**: Static fallback with placeholder values

### 2. Dynamic Manifest API
- **Location**: `/app/api/manifest/route.ts`
- **Purpose**: Generates manifest dynamically using environment variables
- **Endpoint**: `GET /api/manifest`

### 3. Webhook Handler
- **Location**: `/app/api/webhook/route.ts`
- **Purpose**: Handles Farcaster webhook events
- **Endpoint**: `POST /api/webhook`

### 4. Brand Assets
- **Embed Image**: `/public/images/upool-embed-image.svg` (1200x630)
- **Splash Image**: `/public/images/upool-splash.svg` (400x600)
- **Logo**: `/public/Logo-beta.png` (existing)

## Required Environment Variables

Add these to your `.env.local` and deployment environment:

```bash
# Farcaster Domain Verification (from Farcaster Manifest Tool)
FARCASTER_HEADER="your_base64_encoded_header"
FARCASTER_PAYLOAD="your_base64_encoded_payload"
FARCASTER_SIGNATURE="your_signature_hash"

# App URLs
NEXT_PUBLIC_URL="https://upool.fun"
NEXT_PUBLIC_IMAGE_URL="https://upool.fun/images/upool-embed-image.png"
NEXT_PUBLIC_SPLASH_IMAGE_URL="https://upool.fun/images/upool-splash.png"
```

## Setup Process

### 1. Deploy Your App
Deploy UPool to a production domain (recommended: Vercel)

### 2. Generate Domain Verification
1. Go to [Farcaster Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Enter your domain: `https://upool.fun`
3. Connect with your Farcaster custody wallet
4. Generate the signature
5. Copy the three values (header, payload, signature)

### 3. Configure Environment Variables
Add the generated values to your deployment environment:
- In Vercel: Project Settings → Environment Variables
- Add each FARCASTER_* variable with the generated values

### 4. Update Image Assets (Optional)
Replace the SVG placeholder images with proper PNG/JPG assets:
- Convert SVGs to high-quality PNGs
- Upload to your CDN or public folder
- Update the URL references in environment variables

### 5. Test the Manifest
1. Visit `https://upool.fun/.well-known/farcaster.json`
2. Verify all fields are populated (no "REPLACE_WITH_*" values)
3. Test the webhook endpoint: `https://upool.fun/api/webhook`
4. Validate the manifest using Farcaster's validation tools

## Manifest Schema

```json
{
  "accountAssociation": {
    "header": "base64_encoded_header",
    "payload": "base64_encoded_payload",
    "signature": "signature_hash"
  },
  "frame": {
    "name": "UPool",
    "version": "1",
    "iconUrl": "https://upool.fun/Logo-beta.png",
    "homeUrl": "https://upool.fun", 
    "imageUrl": "https://upool.fun/images/upool-embed-image.png",
    "buttonTitle": "Create Pool",
    "splashImageUrl": "https://upool.fun/images/upool-splash.png",
    "splashBackgroundColor": "#1e40af",
    "webhookUrl": "https://upool.fun/api/webhook"
  }
}
```

## Webhook Events

The webhook handler processes these Farcaster events:
- `frame_added`: User adds UPool to their app list
- `frame_removed`: User removes UPool from their app list  
- `notifications_enabled`: User enables notifications
- `notifications_disabled`: User disables notifications

## Next Steps

1. **Custom Images**: Create professional brand assets for embed and splash images
2. **Webhook Logic**: Implement business logic for webhook events (user tracking, notifications)
3. **Analytics**: Track manifest usage and user engagement
4. **Testing**: Test the complete flow in Farcaster client

## Troubleshooting

### Common Issues:
1. **Invalid signature**: Regenerate using the correct Farcaster custody wallet
2. **Domain mismatch**: Ensure the domain in payload matches your deployed URL
3. **Image loading**: Verify all image URLs are publicly accessible
4. **CORS issues**: Ensure proper headers for cross-origin requests

### Validation:
- Use Farcaster's manifest validation tools
- Check console logs for webhook events
- Verify manifest loads correctly in Farcaster clients

## Resources

- [Farcaster Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
- [Base Mini App Documentation](https://docs.base.org/base-app/build-with-minikit/quickstart)
- [Farcaster Frame Specification](https://docs.farcaster.xyz/reference/frames/spec)