"use client"

import { useNetwork } from 'wagmi'
import { baseSepolia, base } from 'viem/chains'

export function NetworkDisplay() {
  const { chain } = useNetwork()

  if (!chain) return null

  const getNetworkInfo = () => {
    switch (chain.id) {
      case baseSepolia.id:
        return {
          name: 'Base Sepolia',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🧪'
        }
      case base.id:
        return {
          name: 'Base Mainnet',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🔵'
        }
      default:
        return {
          name: chain.name,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚠️'
        }
    }
  }

  const networkInfo = getNetworkInfo()

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${networkInfo.color}`}>
      <span className="mr-1">{networkInfo.icon}</span>
      {networkInfo.name}
    </div>
  )
}