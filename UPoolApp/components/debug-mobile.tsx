'use client'

import { useEffect } from 'react'

export function MobileDebugger() {
  useEffect(() => {
    // Only load Eruda in development or when debug mode is enabled
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isDebugMode = typeof window !== 'undefined' && 
      (window.location.search.includes('debug=true') || window.location.hash.includes('debug'))
    
    if (isDevelopment || isDebugMode) {
      // Dynamic import to avoid loading Eruda in production
      import('eruda').then((eruda) => {
        console.log('🔧 Initializing Eruda mobile debugger...')
        eruda.default.init()
        
        // Add custom console tab for Farcaster-specific logs
        eruda.default.add({
          name: 'farcaster',
          init: function($el: any) {
            $el.html('<div style="padding: 10px; font-family: monospace; background: #1a1a1a; color: #00ff00; font-size: 12px;">Farcaster Debug Logs will appear here...</div>')
          }
        })
        
        console.log('✅ Eruda mobile debugger initialized')
        console.log('📱 Debug mode active - check console tab')
      }).catch((error) => {
        console.error('❌ Failed to load Eruda:', error)
      })
    }
  }, [])

  return null // This component doesn't render anything visible
}