"use client"

import { useWallet } from "@/components/providers/wallet-provider-simple"
import { IdentityConnect } from "@/components/identity-connect-simple"
import { WalletDebug } from "@/components/wallet-debug"
import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export default function DebugPage() {
  const [farcasterContext, setFarcasterContext] = useState<any>(null)
  const [sdkLogs, setSdkLogs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const addLog = (message: string) => {
      const timestamp = new Date().toISOString()
      setSdkLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }

    const testFarcasterSDK = async () => {
      try {
        addLog("🔍 Getting Farcaster context...")
        const context = await sdk.context
        setFarcasterContext(context)
        addLog(`✅ Context retrieved: ${JSON.stringify(context)}`)
        
        addLog("📞 Testing sdk.actions.ready()...")
        await sdk.actions.ready()
        addLog("✅ sdk.actions.ready() completed successfully!")
        
      } catch (error) {
        addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    testFarcasterSDK()
  }, [])

  if (!mounted) {
    return <div className="p-8">Loading debug page...</div>
  }

  try {
    const wallet = useWallet()
    
    return (
      <div className="p-4 space-y-4 max-w-4xl mx-auto text-sm">
        <h1 className="text-xl font-bold">🔧 UPool Mobile Debug Console</h1>
        
        <div className="bg-purple-50 p-4 rounded border">
          <h2 className="font-semibold text-purple-800">📱 Environment Detection:</h2>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify({
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
            href: typeof window !== 'undefined' ? window.location.href : 'SSR',
            windowParent: typeof window !== 'undefined' ? (window.parent === window ? 'same' : 'different') : 'SSR',
            referrer: typeof window !== 'undefined' ? document.referrer : 'SSR',
            isFarcasterMobile: typeof window !== 'undefined' ? navigator.userAgent.includes('FarcasterMobile') : false
          }, null, 2)}</pre>
        </div>

        <div className="bg-blue-50 p-4 rounded border">
          <h2 className="font-semibold text-blue-800">🎯 Farcaster SDK Context:</h2>
          <pre className="text-xs mt-2 whitespace-pre-wrap">
            {farcasterContext ? JSON.stringify(farcasterContext, null, 2) : 'Loading...'}
          </pre>
        </div>

        <div className="bg-green-50 p-4 rounded border">
          <h2 className="font-semibold text-green-800">📋 SDK Logs:</h2>
          <div className="text-xs mt-2 space-y-1 max-h-40 overflow-y-auto">
            {sdkLogs.map((log, index) => (
              <div key={index} className="font-mono">{log}</div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded border">
          <h2 className="font-semibold">💰 Wallet State:</h2>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(wallet, null, 2)}</pre>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded border">
          <h2 className="font-semibold text-yellow-800">⚙️ Environment Variables:</h2>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify({
            PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
            CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
            WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            URL: process.env.NEXT_PUBLIC_URL,
            NODE_ENV: process.env.NODE_ENV
          }, null, 2)}</pre>
        </div>
        
        <div className="bg-orange-50 p-4 rounded border">
          <h2 className="font-semibold text-orange-800">🔧 Wallet Context Debug:</h2>
          <WalletDebug />
        </div>
        
        <div className="bg-emerald-50 p-4 rounded border">
          <h2 className="font-semibold text-emerald-800">🔗 Identity Connect Test:</h2>
          <IdentityConnect />
        </div>
        
        <div className="bg-red-50 p-4 rounded border">
          <h2 className="font-semibold text-red-800">🔄 Manual SDK Test:</h2>
          <div className="mt-2 space-y-2">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded text-xs"
              onClick={async () => {
                try {
                  setSdkLogs(prev => [...prev, `[${new Date().toISOString()}] 🔄 Manual ready() test...`])
                  await sdk.actions.ready()
                  setSdkLogs(prev => [...prev, `[${new Date().toISOString()}] ✅ Manual ready() succeeded!`])
                } catch (error) {
                  setSdkLogs(prev => [...prev, `[${new Date().toISOString()}] ❌ Manual ready() failed: ${error}`])
                }
              }}
            >
              Test sdk.actions.ready()
            </button>
            
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded text-xs ml-2"
              onClick={async () => {
                try {
                  setSdkLogs(prev => [...prev, `[${new Date().toISOString()}] 🔍 Getting fresh context...`])
                  const context = await sdk.context
                  setFarcasterContext(context)
                  setSdkLogs(prev => [...prev, `[${new Date().toISOString()}] ✅ Fresh context: ${JSON.stringify(context)}`])
                } catch (error) {
                  setSdkLogs(prev => [...prev, `[${new Date().toISOString()}] ❌ Context failed: ${error}`])
                }
              }}
            >
              Refresh Context
            </button>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <pre className="bg-red-50 p-4 rounded mt-4">{error.toString()}</pre>
      </div>
    )
  }
}