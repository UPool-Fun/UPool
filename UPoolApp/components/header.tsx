"use client"

import Link from "next/link"
import { ConnectMenuSimple } from "./connect-menu-simple"
import { useWallet } from "./providers/wallet-provider"
import Image from "next/image"

interface HeaderProps {
  showCreateButton?: boolean
  showExploreButton?: boolean
  backButton?: {
    href: string
    text: string
  }
  customButtons?: React.ReactNode
  stepProgress?: {
    current: number
    total: number
  }
}

export function Header({ showCreateButton = false, showExploreButton = false, backButton, customButtons, stepProgress }: HeaderProps) {
  // Safe wallet context usage with SSR protection
  let isConnected = false
  try {
    const walletContext = useWallet()
    isConnected = walletContext?.isConnected || false
  } catch (error) {
    // Handle SSR or provider not available
    isConnected = false
  }
  
  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div> */}
            <Image src="/upool.png" alt="UPool" width={120} height={86} />
            {/* <span className="text-xl font-bold text-gray-900">UPool</span> */}
          </Link>

          {/* Back button if provided */}
          {backButton && (
            <Link 
              href={backButton.href}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              ← {backButton.text}
            </Link>
          )}
        </div>

        <nav className="flex items-center space-x-4">
          {/* Navigation Links - Hidden on mobile for space */}
          {/* <div className="hidden md:flex items-center space-x-6">
            <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
              How it works
            </Link>
            <Link href="/explore" className="text-gray-600 hover:text-blue-600 transition-colors">
              Explore Pools
            </Link>
          </div> */}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {showExploreButton && (
              <Link href="/explore">
                <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  Explore Pools
                </button>
              </Link>
            )}
            
            {showCreateButton && isConnected && (
              <>
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Dashboard
                  </button>
                </Link>
                <Link href="/explore">
                  <button className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Explore
                  </button>
                </Link>
              </>
            )}
            
            {showCreateButton && (
              <Link href="/create">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Pool
                </button>
              </Link>
            )}

            {/* Custom Buttons */}
            {customButtons}
            
            {/* Step Progress */}
            {stepProgress && (
              <div className="text-sm text-gray-600">
                Step {stepProgress.current} of {stepProgress.total}
              </div>
            )}

            {/* Wallet Connection - Environment aware */}
            <ConnectMenuSimple />
          </div>
        </nav>
      </div>
    </header>
  )
}