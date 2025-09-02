'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUnifiedWallet } from '@/hooks/use-unified-wallet'
import { useUPoolTransactions } from '@/lib/viem-utils'

/**
 * Test component to demonstrate multi-environment wallet functionality
 * Works across browser, Farcaster web, and Farcaster mobile environments
 */
export function WalletTestComponent() {
  const [mounted, setMounted] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  
  // Use unified wallet hook (works across all environments)
  const wallet = useUnifiedWallet()
  
  // Use UPool transaction utilities
  const { environment, canTransact, helper: txHelper, isReady } = useUPoolTransactions()

  useEffect(() => {
    setMounted(true)
  }, [])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runEnvironmentTests = async () => {
    addTestResult('🧪 Starting environment detection tests...')
    
    // Test 1: Environment detection
    addTestResult(`📱 Environment detected: ${wallet.environment}`)
    addTestResult(`🎯 Is Farcaster: ${wallet.isFarcaster}`)
    
    // Test 2: Wallet connection status
    addTestResult(`🔌 Wallet connected: ${wallet.isConnected}`)
    addTestResult(`📍 Wallet address: ${wallet.address || 'Not connected'}`)
    
    // Test 3: Network status
    addTestResult(`🌐 Chain ID: ${wallet.chainId || 'Unknown'}`)
    addTestResult(`✅ Correct network: ${wallet.isCorrectNetwork}`)
    
    // Test 4: Transaction capabilities
    addTestResult(`💸 Can transact: ${wallet.canTransact}`)
    addTestResult(`🔄 Can switch network: ${wallet.canSwitchNetwork}`)
    
    // Test 5: Farcaster-specific features (if available)
    if (wallet.isFarcaster) {
      try {
        const userInfo = await wallet.getFarcasterUserInfo()
        addTestResult(`👤 Farcaster user: ${userInfo?.displayName || 'Not available'}`)
        addTestResult(`🆔 Farcaster FID: ${wallet.fid || 'Not available'}`)
      } catch (error) {
        addTestResult(`❌ Farcaster user info error: ${error}`)
      }
    }
    
    // Test 6: Transaction helper status
    addTestResult(`🛠️ Transaction helper ready: ${isReady}`)
    addTestResult(`📡 Public client available: ${txHelper.canSendTransactions()}`)
    
    if (wallet.isConnected) {
      try {
        const walletAddress = await txHelper.getWalletAddress()
        addTestResult(`📍 Viem wallet address: ${walletAddress || 'Not available'}`)
        
        const networkCheck = await txHelper.checkNetwork()
        addTestResult(`🌐 Network check passed: ${networkCheck}`)
      } catch (error) {
        addTestResult(`❌ Transaction helper test error: ${error}`)
      }
    }
    
    addTestResult('✅ Environment tests completed!')
  }

  const testConnection = async () => {
    if (wallet.isConnected) {
      addTestResult('🔌 Already connected, testing disconnection...')
      try {
        await wallet.disconnect()
        addTestResult('✅ Disconnection successful')
      } catch (error) {
        addTestResult(`❌ Disconnection failed: ${error}`)
      }
    } else {
      addTestResult('🔌 Testing connection...')
      try {
        await wallet.connect()
        addTestResult('✅ Connection successful')
      } catch (error) {
        addTestResult(`❌ Connection failed: ${error}`)
      }
    }
  }

  const testNetworkSwitch = async () => {
    if (!wallet.canSwitchNetwork) {
      addTestResult('⚠️ Network switching not available in this environment')
      return
    }
    
    addTestResult('🔄 Testing network switch...')
    try {
      const success = await wallet.switchToCorrectNetwork()
      addTestResult(`${success ? '✅' : '❌'} Network switch ${success ? 'successful' : 'failed'}`)
    } catch (error) {
      addTestResult(`❌ Network switch error: ${error}`)
    }
  }

  const testFarcasterFeatures = async () => {
    if (!wallet.isFarcaster) {
      addTestResult('⚠️ Farcaster features not available in browser environment')
      return
    }
    
    addTestResult('🎯 Testing Farcaster features...')
    
    // Test sharing functionality
    try {
      const shareResult = await wallet.shareFarcasterContent({
        text: '🏦 Testing UPool multi-environment wallet system!',
        url: 'https://upool.fun'
      })
      addTestResult(`📤 Farcaster share test: ${shareResult ? 'Available' : 'Not available'}`)
    } catch (error) {
      addTestResult(`❌ Farcaster share error: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading wallet test component...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Multi-Environment Wallet Status</CardTitle>
          <CardDescription>
            Testing UPool's enhanced wallet system based on exampleApp patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Environment</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={wallet.environment === 'browser' ? 'default' : 'secondary'}>
                  {wallet.environment}
                </Badge>
                {wallet.isFarcaster && <Badge variant="outline">Farcaster</Badge>}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Connection Status</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={wallet.isConnected ? 'default' : 'secondary'}>
                  {wallet.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                {wallet.isConnecting && <Badge variant="outline">Connecting...</Badge>}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Network</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={wallet.isCorrectNetwork ? 'default' : 'destructive'}>
                  {wallet.chainId || 'Unknown'}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Capabilities</label>
              <div className="flex items-center gap-2 mt-1">
                {wallet.canTransact && <Badge variant="outline">Transact</Badge>}
                {wallet.canSwitchNetwork && <Badge variant="outline">Switch Network</Badge>}
                {wallet.fid && <Badge variant="outline">FID: {wallet.fid}</Badge>}
              </div>
            </div>
          </div>
          
          {wallet.address && (
            <div>
              <label className="text-sm font-medium">Wallet Address</label>
              <code className="block mt-1 p-2 bg-gray-100 rounded text-sm font-mono">
                {wallet.address}
              </code>
            </div>
          )}
          
          {wallet.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">Error: {wallet.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Controls</CardTitle>
          <CardDescription>
            Test wallet functionality across different environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={runEnvironmentTests} variant="default">
              Run Environment Tests
            </Button>
            
            <Button onClick={testConnection} variant="outline">
              {wallet.isConnected ? 'Test Disconnect' : 'Test Connect'}
            </Button>
            
            {wallet.canSwitchNetwork && (
              <Button onClick={testNetworkSwitch} variant="outline">
                Test Network Switch
              </Button>
            )}
            
            {wallet.isFarcaster && (
              <Button onClick={testFarcasterFeatures} variant="outline">
                Test Farcaster Features
              </Button>
            )}
            
            <Button onClick={clearResults} variant="ghost">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Results</CardTitle>
            <CardDescription>
              Live testing output and diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-950 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}