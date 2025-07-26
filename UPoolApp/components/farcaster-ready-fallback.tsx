'use client'

import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function FarcasterReadyFallback() {
  useEffect(() => {
    // Multiple fallback attempts to ensure ready() is called
    const attempts = [
      { delay: 1000, name: 'First fallback' },
      { delay: 3000, name: 'Second fallback' },
      { delay: 5000, name: 'Third fallback' },
      { delay: 10000, name: 'Final fallback' }
    ]

    const timeouts = attempts.map(({ delay, name }) => {
      return setTimeout(async () => {
        try {
          console.log(`🔄 ${name}: Attempting sdk.actions.ready()...`)
          await sdk.actions.ready()
          console.log(`✅ ${name}: Successfully called ready()`)
        } catch (error) {
          console.log(`❌ ${name}: Failed to call ready()`, error)
        }
      }, delay)
    })

    // Also try immediately on mount
    setTimeout(async () => {
      try {
        console.log('🚀 Immediate fallback: Attempting sdk.actions.ready()...')
        await sdk.actions.ready()
        console.log('✅ Immediate fallback: Successfully called ready()')
      } catch (error) {
        console.log('❌ Immediate fallback: Failed to call ready()', error)
      }
    }, 100)

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return null
}