"use client"

import { useState, useEffect } from "react"
import { useAccount } from 'wagmi'
import { useWallet } from '@/components/providers/dual-wallet-provider'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Plus, Trash2, Link2, Globe, Shield, TrendingUp, Zap, Wallet, CheckCircle, Save } from "lucide-react"
import Link from "next/link"
import { pay, getPaymentStatus } from '@base-org/account'
import { BasePayButton } from '@base-org/account-ui/react'
import { PoolService } from '@/lib/pool-service'
import { PoolData } from '@/lib/firestore-schema'
import { toast } from 'sonner'
import MilestoneManager from '@/components/milestone-manager'
import { Header } from '@/components/header'
import { WalletAddressCard } from '@/components/wallet-address-card'
import { CurrencySelector } from '@/components/currency-selector'
import { PoolCurrency } from '@/lib/firestore-schema'

interface Milestone {
  id: string
  title: string
  description: string
  percentage: number
}

export default function CreatePool() {
  // Wallet integration - with safe client-side check
  const [clientMounted, setClientMounted] = useState(false)
  
  // Safe wallet context usage
  let walletContext
  let wagmiAccount
  
  try {
    walletContext = useWallet()
    wagmiAccount = useAccount()
  } catch (error) {
    // Handle case where provider is not available during SSR
    walletContext = { address: undefined, isConnected: false, isFarcaster: false }
    wagmiAccount = { address: undefined }
  }
  
  const { address, isConnected, isFarcaster } = walletContext
  const { address: wagmiAddress } = wagmiAccount
  
  // Use wagmi address as fallback if wallet provider doesn't have it
  const walletAddress = address || wagmiAddress
  
  const [currentStep, setCurrentStep] = useState(1)
  const [poolId, setPoolId] = useState<string | null>(null)
  const [poolData, setPoolData] = useState<PoolData>({
    title: "",
    description: "",
    fundingGoal: "",
    currency: "USDC" as const, // Default to USDC
    milestones: [] as Milestone[],
    visibility: "private" as const,
    approvalMethod: "majority" as const,
    approvalThreshold: "50",
    poolName: "",
    vanityUrl: "",
    riskStrategy: "low" as const,
  })
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [paymentId, setPaymentId] = useState<string>('')
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    setMounted(true)
    setClientMounted(true)
  }, [])

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (!walletAddress || !poolData.title || !clientMounted) return
    
    const interval = setInterval(() => {
      saveDraft()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [walletAddress, poolData, clientMounted])

  // Load existing draft on mount - only after client is ready
  useEffect(() => {
    if (walletAddress && mounted && clientMounted) {
      loadExistingDraft()
    }
  }, [walletAddress, mounted, clientMounted])

  const totalSteps = 8
  const progress = (currentStep / totalSteps) * 100

  // Load existing draft from Firebase
  const loadExistingDraft = async () => {
    if (!walletAddress) return
    
    try {
      const drafts = await PoolService.getDraftPools(walletAddress)
      if (drafts.length > 0) {
        const latestDraft = drafts[0]
        setPoolId(latestDraft.id)
        setPoolData(latestDraft.poolData)
        toast.success(`Loaded draft: ${latestDraft.poolData.title}`)
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  // Save current state as draft
  const saveDraft = async () => {
    if (!walletAddress || !poolData.title || isSaving) return
    
    setIsSaving(true)
    try {
      if (poolId) {
        // Update existing draft
        await PoolService.saveDraft(poolId, poolData)
      } else {
        // Create new draft
        const newPoolId = await PoolService.createPool({
          creatorAddress: walletAddress,
          creatorFid: isFarcaster ? address?.replace('farcaster:', '') : undefined,
          poolData,
          source: isFarcaster ? 'farcaster' : 'web'
        })
        setPoolId(newPoolId)
      }
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  // Manual save function
  const handleSaveDraft = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }
    await saveDraft()
    toast.success('Draft saved successfully!')
  }



  // Base Pay payment - works with or without Wagmi connection
  const handleBasePayDeposit = async () => {
    if (!poolId || !walletAddress) {
      toast.error('Please complete previous steps first')
      return
    }

    try {
      setPaymentStatus('processing')
      setPaymentStatusMessage('Creating pool wallet...')
      
      // Step 1: Create CDP Server Wallet for the pool
      console.log('🔑 Creating pool wallet via CDP...')
      const walletResponse = await fetch('/api/pool/create-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      })
      
      if (!walletResponse.ok) {
        const errorData = await walletResponse.json()
        throw new Error(errorData.error || 'Failed to create pool wallet')
      }
      
      const walletData = await walletResponse.json()
      console.log('✅ Pool wallet created:', walletData.walletAddress)
      
      setPaymentStatusMessage('Pool wallet created! Initiating payment...')
      
      // Step 2: Update pool status to payment processing
      await PoolService.markPaymentProcessing(poolId, 'pending')
      
      // Log wallet context for debugging
      console.log('Base Pay Context:', {
        poolId,
        poolWalletAddress: walletData.walletAddress,
        walletAddress,
        wagmiAddress,
        isFarcaster,
        isConnected,
        userType: isFarcaster ? 'Farcaster' : 'Browser/Wagmi'
      })
      
      // Step 3: Base Pay to the pool wallet (not dummy address)
      const { id } = await pay({
        amount: '0.01', // USD – SDK automatically converts to USDC
        to: walletData.walletAddress, // Send to actual pool wallet
        testnet: true // Use Base Sepolia testnet
      });

      setPaymentId(id);
      
      // Step 4: Update pool with payment ID
      await PoolService.markPaymentProcessing(poolId, id)
      
      setPaymentStatus('success')
      setPaymentStatusMessage('✅ Payment initiated successfully! Pool wallet funded.')
      
      toast.success('Payment initiated successfully! Pool wallet created and funded.')
      
      console.log('Base Pay payment completed:', {
        paymentId: id,
        amount: '0.01 USD → USDC',
        poolTitle: poolData.title,
        poolId,
        poolWalletAddress: walletData.walletAddress,
        userWallet: walletAddress,
        wagmiWallet: wagmiAddress,
        userType: isFarcaster ? 'Farcaster' : 'Browser/Wagmi'
      })
    } catch (error) {
      console.error('Base Pay error:', error)
      setPaymentStatus('error')
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown payment error'
      setPaymentStatusMessage(`❌ Payment failed: ${errorMessage}`)
      
      // Provide helpful error messages based on error type
      if (errorMessage.toLowerCase().includes('user rejected')) {
        toast.error('Payment cancelled by user')
      } else if (errorMessage.toLowerCase().includes('insufficient')) {
        toast.error('Insufficient funds. Please add funds to your account.')
      } else if (errorMessage.toLowerCase().includes('network')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (errorMessage.toLowerCase().includes('wallet')) {
        toast.error('Failed to create pool wallet. Please try again.')
      } else {
        toast.error(`Payment failed: ${errorMessage}`)
      }
    }
  }

  // Check payment status using stored payment ID
  const handleCheckStatus = async () => {
    if (!paymentId || !poolId) {
      setPaymentStatusMessage('No payment ID found. Please make a payment first.');
      return;
    }

    try {
      const { status } = await getPaymentStatus({ id: paymentId });
      setPaymentStatusMessage(`Payment status: ${status}`);
      
      if (status === 'completed') {
        setPaymentStatus('success');
        // Activate the pool in Firebase
        await PoolService.activatePool(poolId, paymentId)
        toast.success('Pool activated successfully!')
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setPaymentStatusMessage('Status check failed: ' + (error as Error).message);
    }
  };

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      // Validate current step before proceeding
      if (currentStep === 3) {
        // Validate milestones
        const totalPercentage = poolData.milestones.reduce((sum, m) => sum + m.percentage, 0)
        if (totalPercentage !== 100) {
          toast.error('Milestones must add up to exactly 100% before proceeding')
          return
        }
        if (poolData.milestones.length === 0) {
          toast.error('Please add at least one milestone before proceeding')
          return
        }
      }
      
      // Auto-save when moving to next step
      if (walletAddress && poolData.title) {
        await saveDraft()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Pool Title</Label>
              <Input
                id="title"
                placeholder="e.g., Sky Trip to Japan"
                value={poolData.title}
                onChange={(e) => setPoolData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your pool's purpose and goals..."
                value={poolData.description}
                onChange={(e) => setPoolData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <CurrencySelector
            fundingGoal={poolData.fundingGoal}
            currency={poolData.currency}
            onCurrencyChange={(currency: PoolCurrency) => 
              setPoolData((prev) => ({ ...prev, currency }))}
            onFundingGoalChange={(amount: string) => 
              setPoolData((prev) => ({ ...prev, fundingGoal: amount }))}
          />
        )

      case 3:
        return (
          <MilestoneManager
            milestones={poolData.milestones}
            onMilestonesChange={(milestones) => setPoolData((prev) => ({ ...prev, milestones }))}
            fundingGoal={poolData.fundingGoal}
          />
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Pool Visibility</h3>
            <div className="space-y-4">
              <div className="grid gap-4">
                <Card
                  className={`cursor-pointer border-2 ${poolData.visibility === "private" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                  onClick={() => setPoolData((prev) => ({ ...prev, visibility: "private" }))}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">Private</h4>
                      <p className="text-sm text-gray-600">Only invited members can see and join</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${poolData.visibility === "link" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                  onClick={() => setPoolData((prev) => ({ ...prev, visibility: "link" }))}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <Link2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">Link Only</h4>
                      <p className="text-sm text-gray-600">Anyone with the link can view and join</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${poolData.visibility === "public" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                  onClick={() => setPoolData((prev) => ({ ...prev, visibility: "public" }))}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">Public</h4>
                      <p className="text-sm text-gray-600">Discoverable in public pool directory</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Join Approval Method</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Approval Type</Label>
                <Select
                  value={poolData.approvalMethod}
                  onValueChange={(value) => setPoolData((prev) => ({ ...prev, approvalMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="majority">Majority Vote</SelectItem>
                    <SelectItem value="percentage">Percentage Threshold</SelectItem>
                    <SelectItem value="number">Minimum Number</SelectItem>
                    <SelectItem value="creator">Creator Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(poolData.approvalMethod === "percentage" || poolData.approvalMethod === "number") && (
                <div className="space-y-2">
                  <Label>
                    {poolData.approvalMethod === "percentage" ? "Percentage Required" : "Minimum Approvals"}
                  </Label>
                  <Input
                    type="number"
                    placeholder={poolData.approvalMethod === "percentage" ? "75" : "3"}
                    value={poolData.approvalThreshold}
                    onChange={(e) => setPoolData((prev) => ({ ...prev, approvalThreshold: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Pool Identity</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poolName">Custom Pool Name</Label>
                <Input
                  id="poolName"
                  placeholder="skytrip"
                  value={poolData.poolName}
                  onChange={(e) => setPoolData((prev) => ({ ...prev, poolName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Vanity URL</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">upool.fun/p/</span>
                  <Input
                    placeholder="skytrip"
                    value={poolData.vanityUrl}
                    onChange={(e) => setPoolData((prev) => ({ ...prev, vanityUrl: e.target.value }))}
                  />
                </div>
                {poolData.vanityUrl && (
                  <p className="text-sm text-gray-600">
                    Your pool will be available at: <span className="font-mono">upool.fun/p/{poolData.vanityUrl}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Risk Strategy</h3>
            <div className="space-y-4">
              <Card
                className={`cursor-pointer border-2 ${poolData.riskStrategy === "low" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                onClick={() => setPoolData((prev) => ({ ...prev, riskStrategy: "low" }))}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Low Risk</h4>
                      <p className="text-sm text-gray-600">Aave lending (~2-4% APY)</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Recommended
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 ${poolData.riskStrategy === "medium" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                onClick={() => setPoolData((prev) => ({ ...prev, riskStrategy: "medium" }))}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Medium Risk</h4>
                    <p className="text-sm text-gray-600">Moonwell lending (~4-8% APY)</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 ${poolData.riskStrategy === "high" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}
                onClick={() => setPoolData((prev) => ({ ...prev, riskStrategy: "high" }))}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">High Risk</h4>
                    <p className="text-sm text-gray-600">DeFi strategies (~8-15% APY)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Initial Pool Deposit</h3>
            <div className="space-y-4">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Wallet className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Base Account Integration</h4>
                      <p className="text-sm text-gray-600">Make your first deposit using Base Pay on Base Sepolia</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Pool Title</span>
                        <span className="text-sm text-gray-600">{poolData.title || 'Untitled Pool'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Funding Goal</span>
                        <span className="text-sm text-gray-600">{poolData.fundingGoal || '0'} ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Initial Deposit</span>
                        <span className="text-sm font-semibold text-blue-600">0.01 USD (USDC)</span>
                      </div>
                    </div>

                    {/* Payment Section - Simplified */}
                    {clientMounted && walletAddress && !walletAddress.startsWith('fid:') && (
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm text-green-600">
                              {isFarcaster ? 'Farcaster Account' : 'Wallet'} Connected
                            </span>
                          </div>
                          {/* Show connected wallet info for context */}
                          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-md inline-block">
                            {isFarcaster ? 'Farcaster' : 'Wagmi'} Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                          </div>
                        </div>

                        {/* Wallet Address Card for sharing */}
                        <div className="my-6">
                          <WalletAddressCard
                            address={walletAddress}
                            title="Your Pool Wallet"
                            description="Share this address so others can contribute directly to your pool"
                            isFarcaster={isFarcaster}
                          />
                        </div>

                        {paymentStatus === 'idle' && (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 text-center">Ready to make your first deposit:</p>
                            <div className="flex justify-center">
                              <BasePayButton 
                                colorScheme="light"
                                onClick={handleBasePayDeposit}
                              />
                            </div>
                          </div>
                        )}

                        {paymentStatus === 'processing' && (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Processing payment...</p>
                          </div>
                        )}

                        {paymentStatus === 'success' && (
                          <div className="text-center py-4 space-y-3">
                            <div className="flex items-center justify-center mb-2">
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-green-600">Payment Initiated!</p>
                            <p className="text-xs text-gray-600">Payment ID: {paymentId}</p>
                            
                            {paymentId && (
                              <Button 
                                onClick={handleCheckStatus}
                                variant="outline"
                                size="sm"
                              >
                                Check Payment Status
                              </Button>
                            )}
                          </div>
                        )}

                        {paymentStatus === 'error' && (
                          <div className="text-center py-4">
                            <p className="text-sm text-red-600 mb-2">Payment failed. Please try again.</p>
                            <Button 
                              onClick={handleBasePayDeposit}
                              variant="outline"
                              size="sm"
                            >
                              Retry Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Farcaster User - Need Wallet for Payment */}
                    {clientMounted && walletAddress && walletAddress.startsWith('fid:') && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Wallet className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet for Payment</h3>
                        <p className="text-gray-600 mb-4">
                          You're signed in with Farcaster! To make payments with Base Pay, you'll also need to connect a wallet.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">✅ Farcaster Identity: Connected</p>
                            <p className="text-xs text-gray-500">{walletAddress}</p>
                            <p className="font-medium mt-2 text-blue-700">⚠️ Wallet: Required for Base Pay</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Use the "Connect" button in the header to add your wallet for payments.
                        </p>
                      </div>
                    )}

                    {/* Wallet Connection Required */}
                    {clientMounted && !walletAddress && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                        <p className="text-gray-600 mb-6">
                          You need to connect your wallet to make the initial deposit and create your pool.
                        </p>
                        <p className="text-sm text-gray-500">
                          Use the "Connect" button in the header to connect your wallet or Base Account.
                        </p>
                      </div>
                    )}

                    {/* Status Messages */}
                    {paymentStatusMessage && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">{paymentStatusMessage}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium mb-1">About Base Account Integration</p>
                <p>This integrates with real Base Pay to process actual deposits on Base Sepolia testnet. The payment will be converted to USDC and sent to the pool address.</p>
                <p className="mt-2 text-xs">Note: This is a testnet transaction. No real funds will be transferred.</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Header 
        backButton={{
          href: "/",
          text: "Home"
        }}
        customButtons={
          <div className="flex items-center space-x-3">
            {clientMounted && walletAddress && (
              <Button 
                onClick={handleSaveDraft} 
                variant="outline" 
                size="sm"
                disabled={isSaving || !poolData.title}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </Button>
            )}
            {clientMounted && walletAddress && (
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        }
        stepProgress={{
          current: currentStep,
          total: totalSteps
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Create Pool</span>
              <div className="flex items-center space-x-4">
                {lastSaved && (
                  <span className="text-xs text-green-600">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Wallet Connection Status */}
            {clientMounted && !walletAddress && currentStep === 1 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  💡 Connect your wallet to save your progress and continue later
                </p>
              </div>
            )}
            
            {clientMounted && walletAddress && poolId && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} • Auto-saving enabled
                </p>
              </div>
            )}
          </div>

          {/* Step Content */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {currentStep === 1 && "Pool Details"}
                {currentStep === 2 && "Currency & Amount"}
                {currentStep === 3 && "Add Milestones"}
                {currentStep === 4 && "Visibility Settings"}
                {currentStep === 5 && "Approval Method"}
                {currentStep === 6 && "Pool Identity"}
                {currentStep === 7 && "Risk Strategy"}
                {currentStep === 8 && "Initial Deposit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">{renderStep()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button onClick={prevStep} variant="outline" disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              paymentStatus === 'success' ? (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  onClick={() => {
                    if (poolId) {
                      window.location.href = `/pool/${poolId}`
                    } else {
                      toast.error('Pool ID not found')
                    }
                  }}
                >
                  View Your Pool
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button disabled>
                  Complete Deposit First
                </Button>
              )
            ) : (
              <Button 
                onClick={nextStep}
                disabled={
                  currentStep === 3 && (
                    poolData.milestones.length === 0 || 
                    poolData.milestones.reduce((sum, m) => sum + m.percentage, 0) !== 100
                  )
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
