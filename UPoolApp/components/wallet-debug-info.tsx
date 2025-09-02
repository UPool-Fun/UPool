"use client"

import { useWallet } from '@/components/providers/dual-wallet-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export function WalletDebugInfo() {
  const { isConnected, address, isFarcaster, isValidEthAddress, environmentReady } = useWallet()

  const getAddressType = () => {
    if (!address) return 'None'
    if (address.startsWith('farcaster:')) return 'FID'
    if (address.startsWith('0x') && address.length === 42) return 'Ethereum Address'
    return 'Unknown'
  }

  const getStatusIcon = () => {
    if (!isConnected) return <XCircle className="w-4 h-4 text-red-500" />
    if (isValidEthAddress) return <CheckCircle className="w-4 h-4 text-green-500" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  const getStatusText = () => {
    if (!isConnected) return 'Not Connected'
    if (isValidEthAddress) return 'Connected with Valid Address'
    return 'Connected but Invalid Address'
  }

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-100 text-red-700 border-red-200'
    if (isValidEthAddress) return 'bg-green-100 text-green-700 border-green-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Wallet Debug Info</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Environment:</span>
          </div>
          <div>
            <Badge variant={isFarcaster ? "default" : "secondary"}>
              {isFarcaster ? 'Farcaster' : 'Browser'}
            </Badge>
          </div>

          <div>
            <span className="font-medium">Status:</span>
          </div>
          <div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          <div>
            <span className="font-medium">Address Type:</span>
          </div>
          <div>
            <Badge variant="outline">
              {getAddressType()}
            </Badge>
          </div>

          <div>
            <span className="font-medium">RPC Compatible:</span>
          </div>
          <div>
            <Badge variant={isValidEthAddress ? "default" : "destructive"}>
              {isValidEthAddress ? 'Yes' : 'No'}
            </Badge>
          </div>

          <div>
            <span className="font-medium">Environment Ready:</span>
          </div>
          <div>
            <Badge variant={environmentReady ? "default" : "secondary"}>
              {environmentReady ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {address && (
          <div className="mt-4">
            <span className="font-medium text-sm">Address:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded border text-xs font-mono break-all">
              {address}
            </div>
          </div>
        )}

        {isConnected && !isValidEthAddress && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Address Not RPC Compatible</p>
                <p className="text-xs">This address format cannot be used for blockchain transactions. Some features may be limited.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}