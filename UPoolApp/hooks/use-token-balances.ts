import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { formatEther, formatUnits, Address } from 'viem'

// Token contract addresses on Base Sepolia
export const TOKEN_ADDRESSES = {
  ETH: 'Native' as const, // ETH is native, no contract address
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address, // Base Sepolia USDC
  EURC: '0x808456652fdb597867f38412077A9182bf77359F' as Address, // Base Sepolia EURC
} as const

// ERC20 ABI for balance queries
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const

export interface TokenBalances {
  ethBalance?: string
  usdcBalance?: string
  eurcBalance?: string
  isLoading: boolean
  error?: string
  refetch: () => Promise<void>
}

export function useTokenBalances(address?: string): TokenBalances {
  const [ethBalance, setEthBalance] = useState<string>()
  const [usdcBalance, setUsdcBalance] = useState<string>()
  const [eurcBalance, setEurcBalance] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const publicClient = usePublicClient()

  const fetchBalances = async () => {
    if (!address || !publicClient) {
      setError('No address or client available')
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      const walletAddress = address as Address

      // Fetch ETH balance
      const ethBalanceWei = await publicClient.getBalance({
        address: walletAddress,
      })
      setEthBalance(formatEther(ethBalanceWei))

      // Fetch USDC balance
      try {
        const usdcBalanceRaw = await publicClient.readContract({
          address: TOKEN_ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletAddress],
        })
        // USDC has 6 decimals
        setUsdcBalance(formatUnits(usdcBalanceRaw, 6))
      } catch (usdcError) {
        console.warn('Failed to fetch USDC balance:', usdcError)
        setUsdcBalance('0')
      }

      // Fetch EURC balance
      try {
        const eurcBalanceRaw = await publicClient.readContract({
          address: TOKEN_ADDRESSES.EURC,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletAddress],
        })
        // EURC has 6 decimals
        setEurcBalance(formatUnits(eurcBalanceRaw, 6))
      } catch (eurcError) {
        console.warn('Failed to fetch EURC balance:', eurcError)
        setEurcBalance('0')
      }
    } catch (err) {
      console.error('Error fetching token balances:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch balances')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch balances when address changes
  useEffect(() => {
    if (address && publicClient) {
      fetchBalances()
    } else {
      // Clear balances when no address
      setEthBalance(undefined)
      setUsdcBalance(undefined)
      setEurcBalance(undefined)
    }
  }, [address, publicClient])

  return {
    ethBalance,
    usdcBalance,
    eurcBalance,
    isLoading,
    error,
    refetch: fetchBalances,
  }
}