'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function SdkInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState('starting')

  useEffect(() => {
    let initTimeout: NodeJS.Timeout
    let stepTimeout: NodeJS.Timeout

    const logWithTimestamp = (message: string, data?: any) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] ${message}`, data || '')
    }

    const initializeSdk = async () => {
      try {
        logWithTimestamp("🚀 SDK INITIALIZATION: Starting process...")
        setStep('checking-environment')
        
        // Log environment details
        logWithTimestamp("🌍 SDK INITIALIZATION: Environment details", {
          userAgent: navigator.userAgent,
          url: window.location.href,
          parent: window.parent === window ? 'same' : 'different',
          referrer: document.referrer
        })

        // ALWAYS call ready() first to dismiss splash screen - this should be called ASAP
        // regardless of environment detection to prevent hanging splash screens
        logWithTimestamp("📱 SDK INITIALIZATION: Calling ready() IMMEDIATELY to dismiss splash...")
        try {
          await Promise.race([
            sdk.actions.ready(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Ready timeout')), 1000))
          ])
          logWithTimestamp("✅ SDK INITIALIZATION: Emergency ready() call succeeded!")
        } catch (readyError) {
          logWithTimestamp("⚠️ SDK INITIALIZATION: Emergency ready() failed, continuing...", readyError)
        }

        // Set a timeout to force initialization if it takes too long
        initTimeout = setTimeout(() => {
          logWithTimestamp("⚠️ SDK INITIALIZATION: TIMEOUT - Forcing completion after 2 seconds")
          setStep('timeout-fallback')
          setInitialized(true)
        }, 2000) // Reduced timeout

        // Step 1: Get context with detailed logging
        setStep('getting-context')
        logWithTimestamp("📱 SDK INITIALIZATION: Step 1 - Getting SDK context...")
        
        let context
        try {
          context = await Promise.race([
            sdk.context,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Context timeout')), 1500))
          ])
          logWithTimestamp("✅ SDK INITIALIZATION: Context retrieved successfully", context)
        } catch (contextError) {
          logWithTimestamp("❌ SDK INITIALIZATION: Context retrieval failed, using fallback", contextError)
          context = null
        }

        // Step 2: Check if we're in Farcaster environment using multiple methods
        setStep('validating-environment')
        const isInMiniApp = sdk.isInMiniApp
        const hasContext = !!(
          context?.client?.clientFid ||
          context?.isMinApp ||
          context?.miniApp
        )
        const userAgentCheck = navigator.userAgent.includes('FarcasterMobile') || 
                               navigator.userAgent.includes('Farcaster')
        const parentCheck = window.parent !== window // Iframe detection
        const referrerCheck = document.referrer.includes('farcaster')
        
        const isFarcasterEnv = isInMiniApp || hasContext || userAgentCheck || parentCheck || referrerCheck
        
        logWithTimestamp("🔍 SDK INITIALIZATION: Environment validation", {
          officialSDK_isInMiniApp: isInMiniApp,
          hasContext,
          clientFid: context?.client?.clientFid,
          isMinApp: context?.isMinApp,
          miniApp: context?.miniApp,
          userAgentCheck,
          parentCheck,
          referrerCheck,
          finalResult: isFarcasterEnv
        })

        // Step 3: Call ready() again if we detected Farcaster (redundant but safe)
        if (isFarcasterEnv) {
          setStep('calling-ready-final')
          logWithTimestamp("📞 SDK INITIALIZATION: Final ready() call for Farcaster environment...")
          
          try {
            await Promise.race([
              sdk.actions.ready(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Final ready timeout')), 1000))
            ])
            logWithTimestamp("✅ SDK INITIALIZATION: Final ready() call completed!")
          } catch (readyError) {
            logWithTimestamp("⚠️ SDK INITIALIZATION: Final ready() failed, but splash already dismissed", readyError)
          }
        }

        logWithTimestamp("🎉 SDK INITIALIZATION: Complete - Process finished")
        clearTimeout(initTimeout)
        setStep('complete')
        setInitialized(true)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logWithTimestamp("❌ SDK INITIALIZATION: FAILED", {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          step
        })
        setError(errorMessage)
        clearTimeout(initTimeout)
        
        // Still set as initialized to prevent blocking the app
        setStep('failed-continuing')
        setInitialized(true)
      }
    }

    // Add a minimal delay to ensure DOM is ready, then start initialization
    const timer = setTimeout(() => {
      logWithTimestamp("⏰ SDK INITIALIZATION: Starting after DOM ready delay")
      initializeSdk()
    }, 100) // Reduced delay to call ready() faster

    return () => {
      clearTimeout(timer)
      if (initTimeout) clearTimeout(initTimeout)
      if (stepTimeout) clearTimeout(stepTimeout)
    }
  }, [])

  // Only show initialization status in development mode
  if (process.env.NODE_ENV === 'development' && !initialized) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        background: error ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '8px 12px', 
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '90vw',
        lineHeight: '1.2'
      }}>
        <div>🔧 SDK Init: {step}</div>
        {error && <div>❌ Error: {error}</div>}
        {!initialized && <div>⏳ Waiting...</div>}
      </div>
    )
  }

  return null
}