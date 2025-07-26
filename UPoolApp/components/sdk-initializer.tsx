'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function SdkInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let initTimeout: NodeJS.Timeout

    const initializeSdk = async () => {
      try {
        console.log("🚀 Starting Farcaster SDK initialization...")
        
        // Set a timeout to force initialization if it takes too long (shorter for mobile)
        initTimeout = setTimeout(() => {
          console.warn("⚠️ SDK initialization timeout - forcing ready state")
          setInitialized(true)
          
          // Try to call ready one more time in case it helps
          try {
            sdk.actions.ready().catch(() => {
              console.log("📱 Final ready() call failed, continuing anyway")
            })
          } catch (e) {
            console.log("📱 Final ready() call errored, continuing anyway")
          }
        }, 3000) // 3 second timeout for better mobile experience

        // Check if we're in a Farcaster environment first
        const context = await sdk.context
        console.log("📱 Farcaster context:", context)

        if (context) {
          // Initialize the SDK and hide the loading screen
          await sdk.actions.ready()
          console.log("✅ Farcaster SDK initialized successfully")
          clearTimeout(initTimeout)
          setInitialized(true)
        } else {
          console.log("📍 Not in Farcaster environment, skipping SDK initialization")
          clearTimeout(initTimeout)
          setInitialized(true)
        }
      } catch (error) {
        console.error("❌ Failed to initialize Farcaster SDK:", error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        clearTimeout(initTimeout)
        
        // Still set as initialized to prevent blocking the app
        setInitialized(true)
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeSdk, 100)

    return () => {
      clearTimeout(timer)
      if (initTimeout) clearTimeout(initTimeout)
    }
  }, [])

  // Optional: Show initialization status in development
  if (process.env.NODE_ENV === 'development' && !initialized) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '4px 8px', 
        fontSize: '12px',
        zIndex: 9999 
      }}>
        {error ? `SDK Error: ${error}` : 'Initializing Farcaster SDK...'}
      </div>
    )
  }

  return null // This component doesn't render anything
}