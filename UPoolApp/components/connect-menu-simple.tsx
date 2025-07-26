"use client"

import { useEffect, useState } from 'react'
import { useWallet } from './providers/wallet-provider'
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { truncateEthAddress } from "@/lib/utils"

function ConnectMenuContent() {
  // Use the unified wallet context
  const { connect, disconnect, isConnected, address, isConnecting, isFarcaster } = useWallet()

  console.log('🚀 ConnectMenuContent (NEW COMPONENT) rendering with state:', {
    isConnected,
    address,
    isConnecting,
    isFarcaster,
    connectType: typeof connect,
    componentId: 'ConnectMenuSimple-v2'
  })

  // If user is connected, show connected state
  if (isConnected && address) {
    console.log('Rendering connected state for address:', address)
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {truncateEthAddress(address)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="text-red-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Show connect button
  const handleConnect = () => {
    console.log('=== CONNECT BUTTON CLICKED ===')
    console.log('Connect function type:', typeof connect)
    console.log('Connect function:', connect)
    console.log('isConnecting:', isConnecting)
    console.log('isConnected:', isConnected)
    
    if (typeof connect === 'function') {
      console.log('Calling connect function...')
      try {
        const result = connect()
        console.log('Connect function returned:', result)
      } catch (error) {
        console.error('Error calling connect function:', error)
      }
    } else {
      console.error('Connect is not a function! Value:', connect)
    }
  }

  console.log('Rendering connect button with isConnecting:', isConnecting)

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : (isFarcaster ? 'Join' : 'Login')}
    </Button>
  )
}

export function ConnectMenuSimple() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on the server
  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        className="bg-violet-600/10 text-violet-600 hover:bg-violet-600/20 hover:text-violet-700"
        disabled
      >
        <Wallet className="h-4 w-4" />
      </Button>
    )
  }

  // Render the actual content only after mounted
  try {
    return <ConnectMenuContent />
  } catch (error) {
    console.error('Wallet provider error:', error)
    return (
      <Button 
        variant="outline" 
        className="bg-red-600/10 text-red-600 hover:bg-red-600/20"
        disabled
      >
        <Wallet className="h-4 w-4" />
      </Button>
    )
  }
}