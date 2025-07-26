"use client"

import Link from "next/link"
import { ConnectMenuSimple } from "./connect-menu-simple"

interface HeaderProps {
  showCreateButton?: boolean
  showExploreButton?: boolean
  backButton?: {
    href: string
    text: string
  }
}

export function Header({ showCreateButton = false, showExploreButton = false, backButton }: HeaderProps) {
  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UPool</span>
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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
              How it works
            </Link>
            <Link href="/explore" className="text-gray-600 hover:text-blue-600 transition-colors">
              Explore Pools
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {showExploreButton && (
              <Link href="/explore">
                <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  Explore Pools
                </button>
              </Link>
            )}
            
            {showCreateButton && (
              <Link href="/create">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Pool
                </button>
              </Link>
            )}

            {/* Wallet Connection - Environment aware */}
            <ConnectMenuSimple />
          </div>
        </nav>
      </div>
    </header>
  )
}