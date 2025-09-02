'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Home, Search, Plus, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function MobileFooterNav() {
  const pathname = usePathname()
  const [clientMounted, setClientMounted] = useState(false)
  
  // Client-side mounting check
  useEffect(() => {
    setClientMounted(true)
  }, [])

  // Use standard Wagmi hooks for wallet state (same as Header, DualConnect, and Settings)
  const { isConnected } = useAccount()

  // Only use wallet state after client has mounted to prevent hydration mismatch
  const walletConnected = clientMounted ? isConnected : false

  // Don't show footer nav on certain pages
  if (pathname === '/create' || pathname === '/debug' || pathname === '/privacy' || pathname === '/terms' || pathname === '/support') {
    return null
  }

  // All navigation items - show them all but disable based on auth state
  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      isActive: pathname === '/dashboard' || pathname === '/',
      requiresAuth: true
    },
    {
      href: '/explore',
      icon: Search,
      label: 'Explore',
      isActive: pathname === '/explore' || pathname.startsWith('/pool/') || pathname.startsWith('/p/'),
      requiresAuth: false
    },
    {
      href: '/create',
      icon: Plus,
      label: 'Add Pool',
      isActive: pathname === '/create',
      requiresAuth: true
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      isActive: pathname === '/settings',
      requiresAuth: true
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden z-50 mobile-safe-area">
      <nav className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const isDisabled = item.requiresAuth && !walletConnected
          const isClickable = !isDisabled
          
          const buttonContent = (
            <button
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[64px] text-center relative",
                isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : item.isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
              disabled={isDisabled}
              title={isDisabled ? "Connect wallet to access" : undefined}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium leading-tight">{item.label}</span>
              {isDisabled && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full opacity-60"></div>
              )}
            </button>
          )

          return (
            <div key={item.href}>
              {isClickable ? (
                <Link href={item.href}>
                  {buttonContent}
                </Link>
              ) : (
                buttonContent
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}