"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Info, Wallet, ArrowUpRight, ArrowDownLeft, Zap, Target, Shield } from "lucide-react"

interface DepositWithdrawWidgetProps {
  poolData: {
    currentAmount: number
    fundingGoal: number
    yieldRate: number
    protocol: string
    userBalance: number
    userContribution: number
  }
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  userRole: "creator" | "member"
}

export function DepositWithdrawWidget({ poolData, onDeposit, onWithdraw, userRole }: DepositWithdrawWidgetProps) {
  const [activeTab, setActiveTab] = useState("deposit")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const numericAmount = Number.parseFloat(amount) || 0
  const currentProgress = (poolData.currentAmount / poolData.fundingGoal) * 100

  // Calculate new progress after deposit/withdraw
  const newAmount =
    activeTab === "deposit" ? poolData.currentAmount + numericAmount : poolData.currentAmount - numericAmount
  const newProgress = Math.min((newAmount / poolData.fundingGoal) * 100, 100)

  // Calculate expected yield (annual)
  const expectedYield = (numericAmount * poolData.yieldRate) / 100

  // Check if deposit helps unlock next milestone
  const milestoneThresholds = [25, 50, 75, 100] // Example milestone percentages
  const nextMilestone = milestoneThresholds.find((threshold) => threshold > currentProgress)
  const helpsUnlockMilestone = nextMilestone && newProgress >= nextMilestone

  const handleTransaction = async () => {
    if (numericAmount <= 0) return

    setIsProcessing(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (activeTab === "deposit") {
      onDeposit(numericAmount)
    } else {
      onWithdraw(numericAmount)
    }

    setAmount("")
    setIsProcessing(false)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "text-emerald-600"
    if (progress >= 50) return "text-blue-600"
    return "text-orange-600"
  }

  const quickAmounts = activeTab === "deposit" ? ["0.1", "0.5", "1.0"] : ["0.1", "0.25", `${poolData.userContribution}`]

  return (
    <TooltipProvider>
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>Quick Actions</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Balance: {poolData.userBalance} ETH
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit" className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>Deposit</span>
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center space-x-2">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Withdraw</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg pr-16 text-center font-medium"
                    step="0.01"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600">
                    ETH
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex space-x-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount)}
                      className="flex-1 text-xs"
                    >
                      {quickAmount} ETH
                    </Button>
                  ))}
                </div>

                {/* Impact Preview */}
                {numericAmount > 0 && (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Progress Impact</span>
                      </div>
                      <span className={`font-medium ${getProgressColor(newProgress)}`}>
                        {currentProgress.toFixed(1)}% → {newProgress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">Expected yield (yearly)</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Funds earn passive yield via {poolData.protocol}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="font-medium text-emerald-600">+{expectedYield.toFixed(4)} ETH</span>
                    </div>

                    {helpsUnlockMilestone && (
                      <div className="flex items-center space-x-2 text-sm text-emerald-700 bg-emerald-100 rounded-md p-2">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">Nice! You're helping unlock the next milestone.</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleTransaction}
                  disabled={numericAmount <= 0 || numericAmount > poolData.userBalance || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Confirm Deposit
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4 mt-4">
              {userRole !== "creator" ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Withdrawal Restricted</h3>
                    <p className="text-sm text-gray-600">
                      Only the pool creator can withdraw funds after milestone approval.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg pr-16 text-center font-medium"
                      step="0.01"
                      min="0"
                      max={poolData.userContribution}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600">
                      ETH
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex space-x-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(quickAmount)}
                        className="flex-1 text-xs"
                        disabled={Number.parseFloat(quickAmount) > poolData.userContribution}
                      >
                        {quickAmount === `${poolData.userContribution}` ? "Max" : `${quickAmount} ETH`}
                      </Button>
                    ))}
                  </div>

                  {/* Impact Preview */}
                  {numericAmount > 0 && (
                    <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-orange-600" />
                          <span className="text-orange-800">Progress Impact</span>
                        </div>
                        <span className={`font-medium ${getProgressColor(newProgress)}`}>
                          {currentProgress.toFixed(1)}% → {newProgress.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">Yield reduction (yearly)</span>
                        </div>
                        <span className="font-medium text-red-600">-{expectedYield.toFixed(4)} ETH</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-100 rounded-md p-2">
                        <Info className="w-4 h-4" />
                        <span className="font-medium">Heads up! Withdrawals may affect your voting weight.</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleTransaction}
                    disabled={numericAmount <= 0 || numericAmount > poolData.userContribution || isProcessing}
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-4 h-4 mr-2" />
                        Confirm Withdraw
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
