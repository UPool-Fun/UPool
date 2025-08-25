'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Wallet, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface WalletAddressCardProps {
  address: string
  title?: string
  description?: string
  showQR?: boolean
  isFarcaster?: boolean
  className?: string
}

export function WalletAddressCard({ 
  address, 
  title = "Wallet Address", 
  description = "Share this address to receive funds",
  showQR = false,
  isFarcaster = false,
  className = ""
}: WalletAddressCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy address')
    }
  }

  const openInExplorer = () => {
    if (address.startsWith('0x')) {
      // Open in Base Sepolia explorer
      window.open(`https://sepolia.basescan.org/address/${address}`, '_blank')
    } else if (address.startsWith('farcaster:')) {
      // Open in Warpcast
      const fid = address.replace('farcaster:', '')
      window.open(`https://warpcast.com/~/profile/${fid}`, '_blank')
    }
  }

  const formatAddress = (addr: string) => {
    if (addr.startsWith('farcaster:')) {
      return `FID ${addr.replace('farcaster:', '')}`
    }
    if (addr.length > 20) {
      return `${addr.slice(0, 8)}...${addr.slice(-8)}`
    }
    return addr
  }

  return (
    <Card className={`border-2 border-dashed border-blue-200 bg-blue-50/50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          {address.startsWith('0x') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openInExplorer}
              className="text-gray-500 hover:text-blue-600"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">
                {isFarcaster ? 'Farcaster ID' : 'Ethereum Address'}
              </p>
              <div className="font-mono text-sm break-all">
                {formatAddress(address)}
              </div>
              <p className="text-xs text-gray-400 mt-1 break-all">
                {address}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="ml-3 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">💡 How to use this address:</p>
          <ul className="space-y-1">
            <li>• Copy and share with friends who want to contribute</li>
            <li>• Others can send funds directly to this address</li>
            <li>• All contributions will automatically appear in your pool</li>
            {isFarcaster && <li>• Farcaster users can also find you by FID</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}