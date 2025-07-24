"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Users, Scale, Clock } from "lucide-react"

interface VotingPanelProps {
  milestone: {
    id: number
    title: string
    votesFor: number
    votesAgainst: number
    totalVoters: number
    userVoted?: boolean
    userVote?: "for" | "against"
  }
  userVotingWeight: number
  onVote: (milestoneId: number, vote: "for" | "against") => void
}

export function VotingPanel({ milestone, userVotingWeight, onVote }: VotingPanelProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [selectedVote, setSelectedVote] = useState<"for" | "against" | null>(null)

  const handleVote = async (vote: "for" | "against") => {
    setSelectedVote(vote)
    setIsVoting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onVote(milestone.id, vote)
    setIsVoting(false)
  }

  const votePercentage = {
    for: (milestone.votesFor / milestone.totalVoters) * 100,
    against: (milestone.votesAgainst / milestone.totalVoters) * 100,
  }

  const requiredVotes = Math.ceil(milestone.totalVoters * 0.6) // 60% threshold

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scale className="w-5 h-5 text-blue-600" />
          <span>Community Vote</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vote Question */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-900">Do you approve the release of funds for "{milestone.title}"?</h3>
          <p className="text-sm text-gray-600">
            Pool creator has submitted proof of completion. Review and cast your vote.
          </p>
        </div>

        {/* Voting Buttons */}
        {!milestone.userVoted ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleVote("for")}
              disabled={isVoting}
              className="h-16 bg-emerald-600 hover:bg-emerald-700 flex flex-col items-center justify-center space-y-1"
            >
              {isVoting && selectedVote === "for" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Yes, Approve</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => handleVote("against")}
              disabled={isVoting}
              variant="outline"
              className="h-16 border-red-200 text-red-700 hover:bg-red-50 flex flex-col items-center justify-center space-y-1"
            >
              {isVoting && selectedVote === "against" ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  <span className="font-medium">No, Reject</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              {milestone.userVote === "for" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">You voted {milestone.userVote === "for" ? "Yes" : "No"}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Thank you for participating!</p>
          </div>
        )}

        {/* Vote Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Results</span>
            <span className="font-medium">
              {milestone.votesFor + milestone.votesAgainst} of {milestone.totalVoters} voted
            </span>
          </div>

          <div className="space-y-3">
            {/* For Votes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Approve</span>
                </div>
                <span className="text-emerald-700 font-medium">
                  {milestone.votesFor} ({votePercentage.for.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${votePercentage.for}%` }}
                ></div>
              </div>
            </div>

            {/* Against Votes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 font-medium">Reject</span>
                </div>
                <span className="text-red-700 font-medium">
                  {milestone.votesAgainst} ({votePercentage.against.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${votePercentage.against}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Threshold Indicator */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Required for approval:</span>
              <span className="font-medium text-blue-900">{requiredVotes} votes (60%)</span>
            </div>
          </div>
        </div>

        {/* User Voting Weight */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Your voting weight:</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {userVotingWeight}% of pool
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
