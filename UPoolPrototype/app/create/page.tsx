"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Plus, Trash2, Link2, Globe, Shield, TrendingUp, Zap, Wallet, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account'
import { SignInWithBaseButton, BasePayButton } from '@base-org/account-ui/react'


interface Milestone {
  id: string
  title: string
  description: string
  percentage: number
}

export default function CreatePool() {
  const [currentStep, setCurrentStep] = useState(1)
  const [poolData, setPoolData] = useState({
    title: "",
    description: "",
    fundingGoal: "",
    milestones: [] as Milestone[],
    visibility: "private",
    approvalMethod: "majority",
    approvalThreshold: "50",
    poolName: "",
    vanityUrl: "",
    riskStrategy: "low",
  })
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [paymentId, setPaymentId] = useState<string>('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('')

  // Initialize Base Account SDK - using empty object as fallback
  const sdk = createBaseAccountSDK({} as any)

  const totalSteps = 7
  const progress = (currentStep / totalSteps) * 100

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: "",
      description: "",
      percentage: 0,
    }
    setPoolData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }))
  }

  const removeMilestone = (id: string) => {
    setPoolData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }))
  }

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setPoolData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }))
  }

  // Optional sign-in step – not required for `pay()`, but useful to get the user address
  const handleSignIn = async () => {
    try {
      await sdk.getProvider().request({ method: 'wallet_connect' });
      setIsSignedIn(true);
      setPaymentStatusMessage('✅ Connected to Base Account');
    } catch (error) {
      console.error('Sign in failed:', error);
      setPaymentStatusMessage('❌ Sign in failed');
    }
  };

  // Real Base Pay payment using the pay() function
  const handleBasePayDeposit = async () => {
    try {
      setPaymentStatus('processing')
      setPaymentStatusMessage('Initiating payment...')
      
      // Create a real payment using Base Pay
      const { id } = await pay({
        amount: '0.01', // USD – SDK quotes equivalent USDC
        to: '0x1234567890123456789012345678901234567890', // Dummy recipient address for demo
        testnet: true // Use Base Sepolia testnet
      });

      setPaymentId(id);
      setPaymentStatus('success')
      setPaymentStatusMessage('Payment initiated! Click "Check Status" to see the result.')
      
      console.log('Base Pay payment completed:', {
        paymentId: id,
        amount: '0.01 USD',
        poolTitle: poolData.title,
        recipient: '0x1234567890123456789012345678901234567890'
      })
    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentStatus('error')
      setPaymentStatusMessage('Payment failed: ' + (error as Error).message)
    }
  }

  // Check payment status using stored payment ID
  const handleCheckStatus = async () => {
    if (!paymentId) {
      setPaymentStatusMessage('No payment ID found. Please make a payment first.');
      return;
    }

    try {
      const { status } = await getPaymentStatus({ id: paymentId });
      setPaymentStatusMessage(`Payment status: ${status}`);
      
      if (status === 'completed') {
        setPaymentStatus('success');
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setPaymentStatusMessage('Status check failed: ' + (error as Error).message);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
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
            <div className="space-y-2">
              <Label htmlFor="goal">Funding Goal (ETH)</Label>
              <Input
                id="goal"
                type="number"
                placeholder="10.0"
                value={poolData.fundingGoal}
                onChange={(e) => setPoolData((prev) => ({ ...prev, fundingGoal: e.target.value }))}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Milestones</h3>
              <Button onClick={addMilestone} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {poolData.milestones.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No milestones added yet. Add your first milestone to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {poolData.milestones.map((milestone, index) => (
                  <Card key={milestone.id} className="border border-gray-200">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Milestone {index + 1}</Badge>
                        <Button
                          onClick={() => removeMilestone(milestone.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            placeholder="e.g., Book flights"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unlock Percentage</Label>
                          <Input
                            type="number"
                            placeholder="25"
                            value={milestone.percentage}
                            onChange={(e) =>
                              updateMilestone(milestone.id, "percentage", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe what needs to be completed..."
                          value={milestone.description}
                          onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 3:
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

      case 4:
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

      case 5:
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
                  <span className="text-sm text-gray-500">upool.cc/p/</span>
                  <Input
                    placeholder="skytrip"
                    value={poolData.vanityUrl}
                    onChange={(e) => setPoolData((prev) => ({ ...prev, vanityUrl: e.target.value }))}
                  />
                </div>
                {poolData.vanityUrl && (
                  <p className="text-sm text-gray-600">
                    Your pool will be available at: <span className="font-mono">upool.cc/p/{poolData.vanityUrl}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case 6:
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

      case 7:
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

                    {/* Base Account Sign In */}
                    {!isSignedIn && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 text-center">Connect your Base Account first:</p>
                        <div className="flex justify-center">
                          <SignInWithBaseButton 
                            align="center"
                            variant="solid"
                            colorScheme="light"
                            onClick={handleSignIn}
                          />
                        </div>
                      </div>
                    )}

                    {/* Payment Status */}
                    {isSignedIn && (
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm text-green-600">Connected to Base Account</span>
                          </div>
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
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-bold text-gray-900">UPool</span>
            </div>
          </Link>
          <div className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Create Pool</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {currentStep === 1 && "Pool Details"}
                {currentStep === 2 && "Add Milestones"}
                {currentStep === 3 && "Visibility Settings"}
                {currentStep === 4 && "Approval Method"}
                {currentStep === 5 && "Pool Identity"}
                {currentStep === 6 && "Risk Strategy"}
                {currentStep === 7 && "Initial Deposit"}
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
                  asChild
                >
                  <Link href="/pool/summary">
                    Create Pool
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button disabled>
                  Complete Deposit First
                </Button>
              )
            ) : (
              <Button onClick={nextStep}>
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
