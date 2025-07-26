# UPool Brand Assets

## Farcaster Manifest Images

This directory contains brand assets for the UPool Farcaster Mini App manifest.

### Files:

1. **upool-embed-image.svg** (1200x630)
   - Social sharing image used in Farcaster feeds
   - Should be converted to PNG for production use
   - Current: SVG placeholder with UPool branding

2. **upool-splash.svg** (400x600)
   - Splash screen shown when loading the Mini App
   - Should be converted to PNG for production use  
   - Current: SVG placeholder with UPool logo

### Production Notes:

For production deployment, consider:
1. Converting SVG files to high-quality PNG/JPG
2. Optimizing file sizes for fast loading
3. Using a CDN for serving images
4. Testing images in actual Farcaster clients

### Image Requirements:

- **Embed Image**: 1200x630px (OG image format)
- **Splash Image**: Recommended 400x600px (mobile portrait)
- **Icon**: 512x512px minimum (referenced from /Logo-beta.png)

### Usage:

These images are referenced in:
- `/public/.well-known/farcaster.json`
- `/app/api/manifest/route.ts`
- Environment variables: `NEXT_PUBLIC_IMAGE_URL`, `NEXT_PUBLIC_SPLASH_IMAGE_URL`