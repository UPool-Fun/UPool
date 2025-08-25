"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Wallet, Shield, TrendingUp, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock pool data - in real app this would come from API
const poolData = {
  id: "skytrip",
  title: "Sky Trip to Japan",
  description: "Our group trip to Japan in spring 2024. Pooling funds for flights, accommodation, and activities.",
  fundingGoal: 12000,
  currentAmount: 8400,
  yieldRate: 2.4,
  members: 12,
  creator: "alice.eth",
}

// Mock user data after wallet connection
const mockUserData = {
  address: "0x1234...5678",
  ensName: "john.eth",
  talentScore: {
    identity: 85,
    builder: 72,
    overall: 78,
  },
}

export default function JoinPool({ params }: { params: { poolId: string } }) {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Connect, 2: Profile, 3: Deposit
  const [isConnecting, setIsConnecting] = useState(false)
  const [userData, setUserData] = useState<typeof mockUserData | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const progressPercentage = (poolData.currentAmount / poolData.fundingGoal) * 100

  const connectWallet = async () => {
    setIsConnecting(true)
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setUserData(mockUserData)
    setIsConnecting(false)
    setStep(2)
  }

  const joinPool = async () => {
    setIsJoining(true)
    // Simulate joining pool
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsJoining(false)
    // Redirect to pool dashboard
    router.push(`/pool/${params.poolId}`)
  }

  const getTrustColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-100"
    if (score >= 60) return "text-blue-600 bg-blue-100"
    return "text-orange-600 bg-orange-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UPool</span>
          </Link>
          <div className="text-sm text-gray-600">Join Pool</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                  </div>
                  {stepNum < 3 && <div className={`w-12 h-1 mx-2 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              {step === 1 && "Connect your wallet"}
              {step === 2 && "Verify your identity"}
              {step === 3 && "Choose deposit amount"}
            </div>
          </div>

          {/* Pool Preview */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{poolData.title}</h1>
                  <p className="text-gray-600">{poolData.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">${poolData.currentAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">+{poolData.yieldRate}%</div>
                    <div className="text-sm text-gray-600">APY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{poolData.members}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-sm text-gray-600">
                    {Math.round(progressPercentage)}% of ${poolData.fundingGoal.toLocaleString()} goal
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">
                {step === 1 && "Connect Your Wallet"}
                {step === 2 && "Verify Your Identity"}
                {step === 3 && "Join the Pool"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {step === 1 && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect to get started</h3>
                    <p className="text-gray-600">
                      We'll verify your identity and show your trust score to other pool members
                    </p>
                  </div>
                  <Button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Join
                      </>
                    )}
                  </Button>
                </div>
              )}

              {step === 2 && userData && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold">
                      {userData.ensName ? userData.ensName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{userData.ensName || "Anonymous User"}</h3>
                      <p className="text-sm text-gray-600 font-mono">{userData.address}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Trust Scores
                    </h4>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg border border-gray-200">
                        <div className={`text-lg font-bold ${getTrustColor(userData.talentScore.identity)}`}>
                          {userData.talentScore.identity}
                        </div>
                        <div className="text-xs text-gray-600">Identity</div>
                      </div>
                      <div className="text-center p-3 rounded-lg border border-gray-200">
                        <div className={`text-lg font-bold ${getTrustColor(userData.talentScore.builder)}`}>
                          {userData.talentScore.builder}
                        </div>
                        <div className="text-xs text-gray-600">Builder</div>
                      </div>
                      <div className="text-center p-3 rounded-lg border border-gray-200">
                        <div className={`text-lg font-bold ${getTrustColor(userData.talentScore.overall)}`}>
                          {userData.talentScore.overall}
                        </div>
                        <div className="text-xs text-gray-600">Overall</div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center text-emerald-700 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Great! Your trust score qualifies you to join this pool
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  >
                    Continue to Deposit
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How much would you like to deposit?</h3>
                    <p className="text-gray-600">Your funds will start earning {poolData.yieldRate}% APY immediately</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit">Deposit Amount (ETH)</Label>
                      <Input
                        id="deposit"
                        type="number"
                        placeholder="0.5"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="text-lg text-center"
                      />
                    </div>

                    {depositAmount && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Your deposit:</span>
                          <span className="font-medium">{depositAmount} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estimated yearly yield:</span>
                          <span className="font-medium text-emerald-600">
                            +{(Number.parseFloat(depositAmount || "0") * (poolData.yieldRate / 100)).toFixed(4)} ETH
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {["0.1", "0.5", "1.0"].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositAmount(amount)}
                          className="text-sm"
                        >
                          {amount} ETH
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={joinPool}
                    disabled={!depositAmount || Number.parseFloat(depositAmount) <= 0 || isJoining}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Joining Pool...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Join Pool & Deposit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust Info */}
          {step > 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                <Shield className="w-4 h-4 inline mr-1" />
                Your identity is verified via ENS and Talent Protocol
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
