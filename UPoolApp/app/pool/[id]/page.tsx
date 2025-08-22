"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, Share2, QrCode, Copy, UserPlus, Shield } from "lucide-react"
import Link from "next/link"
import { TrustBadge } from "@/components/trust-badge"
import { DepositWithdrawWidget } from "@/components/deposit-withdraw-widget"
import { MilestoneTracker } from "@/components/milestone-tracker"

// Mock data - in real app this would come from props/API
const poolData = {
  id: "skytrip",
  title: "Sky Trip to Japan",
  description: "Our group trip to Japan in spring 2024. Pooling funds for flights, accommodation, and activities.",
  fundingGoal: 12000,
  currentAmount: 8400,
  yieldEarned: 201,
  yieldRate: 2.4,
  protocol: "Aave",
  members: 12,
  creator: "alice.eth",
  vanityUrl: "upool.fun/p/skytrip",
  milestones: [
    {
      id: 1,
      title: "Book Flights",
      description: "Book round-trip flights for all members",
      percentage: 40,
      amount: 4800,
      status: "completed" as const,
      completedAt: "Jan 15, 2024",
    },
    {
      id: 2,
      title: "Reserve Accommodation",
      description: "Book hotels and Airbnb for the entire trip",
      percentage: 35,
      amount: 4200,
      status: "pending-vote" as const,
      votesFor: 7,
      votesAgainst: 2,
      totalVoters: 12,
    },
    {
      id: 3,
      title: "Activities & Food",
      description: "Budget for activities, dining, and miscellaneous expenses",
      percentage: 25,
      amount: 3000,
      status: "locked" as const,
    },
  ],
  membersList: [
    { name: "Alice", address: "alice.eth", role: "creator", contributed: 1200 },
    { name: "Bob", address: "bob.eth", role: "member", contributed: 800 },
    { name: "Carol", address: "carol.eth", role: "member", contributed: 950 },
    { name: "Dave", address: "dave.eth", role: "member", contributed: 600 },
    { name: "Eve", address: "eve.eth", role: "member", contributed: 750 },
  ],
}

export default function PoolDashboard() {
  const [showQR, setShowQR] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const inviteLink = `upool.fun/p/${poolData.id}/join`
  const [userBalance] = useState(2.5) // Mock user wallet balance
  const [userContribution, setUserContribution] = useState(1.2) // Mock user contribution to this pool
  const [userRole] = useState<"creator" | "member">("member") // Mock user role
  const [milestones, setMilestones] = useState(poolData.milestones)

  const handleDeposit = (amount: number) => {
    console.log(`Depositing ${amount} ETH`)
    setUserContribution((prev) => prev + amount)
  }

  const handleWithdraw = (amount: number) => {
    console.log(`Withdrawing ${amount} ETH`)
    setUserContribution((prev) => Math.max(0, prev - amount))
  }

  const handleSubmitProof = (milestoneId: number, proof: string) => {
    console.log(`Submitting proof for milestone ${milestoneId}:`, proof)
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, status: "pending-vote" as const, votesFor: 0, votesAgainst: 0, totalVoters: 12 }
          : m,
      ),
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const pendingVoteMilestone = milestones.find((m) => m.status === "pending-vote")
  const userVotingWeight = (userContribution / poolData.currentAmount) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UPool</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(poolData.vanityUrl)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Pool Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{poolData.title}</h1>
              <p className="text-gray-600">{poolData.description}</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4 mr-1" />+{poolData.yieldRate}% APY
            </Badge>
          </div>

          {/* Unified Pool Stats Bar */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${poolData.currentAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">${poolData.yieldEarned}</div>
                  <div className="text-sm text-gray-600">Yield Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{poolData.members}</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((poolData.currentAmount / poolData.fundingGoal) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Funding Progress</span>
                  <span className="font-medium text-gray-900">
                    ${poolData.currentAmount.toLocaleString()} / ${poolData.fundingGoal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-in-out"
                    style={{
                      width: `${Math.min((poolData.currentAmount / poolData.fundingGoal) * 100, 100)}%`,
                      animation: "slideIn 1.5s ease-in-out",
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <style jsx>{`
            @keyframes slideIn {
              from {
                width: 0%;
              }
              to {
                width: ${Math.min((poolData.currentAmount / poolData.fundingGoal) * 100, 100)}%;
              }
            }
          `}</style>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Milestone Tracker */}
          <div className="lg:col-span-2 space-y-6">
            <MilestoneTracker milestones={milestones} onSubmitProof={handleSubmitProof} userRole={userRole} />

            {/* Activity Feed */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Milestone "Reserve Accommodation" is pending community vote</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Alice completed milestone "Book Flights"</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Pool earned $12 in yield</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            {/* Deposit/Withdraw Widget */}
            <DepositWithdrawWidget
              poolData={{
                currentAmount: poolData.currentAmount,
                fundingGoal: poolData.fundingGoal,
                yieldRate: poolData.yieldRate,
                protocol: poolData.protocol,
                userBalance: userBalance,
                userContribution: userContribution,
              }}
              userRole={userRole}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />

            {/* Invite Members Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5" />
                  <span>Invite Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Share Link</label>
                  <div className="flex items-center space-x-2">
                    <Input value={poolData.vanityUrl} readOnly className="text-sm" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(poolData.vanityUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  onClick={() => setShowInviteModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Invite Link
                </Button>
              </CardContent>
            </Card>

            {/* Yield Strategy Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Yield Strategy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Protocol</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Shield className="w-3 h-3 mr-1" />
                    {poolData.protocol}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current APY</span>
                  <span className="font-semibold text-emerald-600">+{poolData.yieldRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Earned</span>
                  <span className="font-semibold text-gray-900">${poolData.yieldEarned}</span>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Members ({poolData.membersList.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {poolData.membersList.slice(0, 5).map((member, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${member.contributed}</p>
                        {member.role === "creator" && (
                          <Badge variant="secondary" className="text-xs">
                            Creator
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-11">
                      <TrustBadge score={85} type="identity" size="sm" />
                      <TrustBadge score={72} type="builder" size="sm" />
                    </div>
                  </div>
                ))}
                {poolData.membersList.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all {poolData.membersList.length} members
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invite New Members</span>
                <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)} className="h-6 w-6 p-0">
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-xs text-gray-500">QR Code</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Invite Link</label>
                  <div className="flex items-center space-x-2">
                    <Input value={inviteLink} readOnly className="text-sm" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(inviteLink)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Share this link with friends to invite them to join your pool</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
