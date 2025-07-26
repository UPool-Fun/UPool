"use client"

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ChevronDown, SwitchCamera } from "lucide-react"
import { cn } from "@/lib/utils"
import { truncateEthAddress } from "@/lib/utils"
import { sdk } from "@farcaster/frame-sdk"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { base, baseSepolia } from 'wagmi/chains'

export function ConnectMenuClient() {
  const [mounted, setMounted] = useState(false)
  const [isFarcaster, setIsFarcaster] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Don't render anything on server
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

  return <ConnectMenuContent />
}

function ConnectMenuContent() {
  const [mounted, setMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isFarcaster, setIsFarcaster] = useState(false)
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Privy hooks for browser environment (handle gracefully if not available)
  let privyAuth
  try {
    privyAuth = usePrivy()
  } catch (error) {
    privyAuth = { login: () => {}, logout: () => {}, authenticated: false, user: null }
  }
  const { login, logout, authenticated, user } = privyAuth

  // Get target chain from env
  const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532")
  const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia
  const NETWORK_NAME = targetChain.name

  useEffect(() => {
    const checkFarcasterContext = async () => {
      try {
        const context = await sdk.context
        setIsFarcaster(!!context?.client?.clientFid)
      } catch (error) {
        console.error('Failed to get Farcaster context:', error)
        setIsFarcaster(false)
      }
    }

    checkFarcasterContext()
    setMounted(true)
  }, [])

  // Check if we're on the wrong network
  useEffect(() => {
    if (isConnected || authenticated) {
      const wrongNetwork = chainId !== TARGET_CHAIN_ID
      setIsWrongNetwork(wrongNetwork)
      if (wrongNetwork) {
        setError(`Please switch to ${NETWORK_NAME}`)
      } else {
        setError(null)
      }
    } else {
      setIsWrongNetwork(false)
      setError(null)
    }
  }, [chainId, isConnected, authenticated, TARGET_CHAIN_ID, NETWORK_NAME])

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      setError(null)
      await switchChain({ chainId: TARGET_CHAIN_ID })
    } catch (error) {
      console.error('Failed to switch network:', error)
      setError(`Failed to switch to ${NETWORK_NAME}. Please try manually.`)
    }
  }

  // Get the correct connection state and address
  const walletConnected = isFarcaster ? isConnected : authenticated
  const walletAddress = isFarcaster ? address : user?.wallet?.address

  if (walletConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={isWrongNetwork ? "destructive" : "outline"}
              className={cn(
                isWrongNetwork ? "animate-pulse" : "bg-violet-600/10 text-violet-600 hover:bg-violet-600/20 hover:text-violet-700",
                "min-w-[160px] justify-between"
              )}
            >
              <div className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                {isWrongNetwork ? (
                  <>Wrong Network</>
                ) : (
                  walletAddress ? truncateEthAddress(walletAddress) : 'Connected'
                )}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {isWrongNetwork && (
              <DropdownMenuItem
                className="text-violet-600 focus:text-violet-700 cursor-pointer"
                onClick={handleSwitchNetwork}
                disabled={isSwitchPending}
              >
                <SwitchCamera className={cn("mr-2 h-4 w-4", isSwitchPending && "animate-spin")} />
                {isSwitchPending ? 'Switching...' : `Switch to ${NETWORK_NAME}`}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer"
              onClick={() => isFarcaster ? disconnect() : logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {error && (
          <p className="text-sm text-red-500 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }

  const handleConnect = async () => {
    try {
      setError(null)
      
      if (isFarcaster) {
        // For now, use injected connector in Farcaster environment
        const injectedConnector = connectors.find(c => c.id === 'injected')
        if (!injectedConnector) throw new Error('Injected connector not found')
        await connect({ connector: injectedConnector })
      } else {
        // Use Privy for browser environment
        await login()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setError('Failed to connect wallet. Please try again.')
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleConnect}
        className={cn(
          "bg-violet-600 hover:bg-violet-700",
          "text-white",
          "flex items-center gap-2"
        )}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet 5
      </Button>
      {error && (
        <p className="text-sm text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  )
}