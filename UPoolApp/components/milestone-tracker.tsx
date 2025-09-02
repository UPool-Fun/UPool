"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Lock, Upload, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Milestone {
  id: number
  title: string
  description: string
  percentage: number
  amount: number
  status: "completed" | "in-progress" | "pending-vote" | "locked"
  completedAt?: string
  proofSubmitted?: boolean
  votesFor?: number
  votesAgainst?: number
  totalVoters?: number
}

interface MilestoneTrackerProps {
  milestones: Milestone[]
  onSubmitProof: (milestoneId: number, proof: string, files?: File[]) => void
  userRole: "creator" | "member"
}

export function MilestoneTracker({ milestones, onSubmitProof, userRole }: MilestoneTrackerProps) {
  const [proofText, setProofText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localMilestones, setLocalMilestones] = useState(milestones)
  const { toast } = useToast()

  // Update local state when props change
  React.useEffect(() => {
    setLocalMilestones(milestones)
  }, [milestones])

  const handleSubmitProof = async (milestoneId: number) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onSubmitProof(milestoneId, proofText)
    setProofText("")
    setIsSubmitting(false)
  }

  const handleVote = async (milestoneId: number, vote: "for" | "against") => {
    // Find current milestone and next milestone
    const currentIndex = localMilestones.findIndex((m) => m.id === milestoneId)
    const currentMilestone = localMilestones[currentIndex]
    const nextMilestone = localMilestones[currentIndex + 1]

    // Update vote count
    const updatedVotesFor = vote === "for" ? (currentMilestone.votesFor || 0) + 1 : currentMilestone.votesFor || 0
    const updatedVotesAgainst =
      vote === "against" ? (currentMilestone.votesAgainst || 0) + 1 : currentMilestone.votesAgainst || 0
    const totalVotes = updatedVotesFor + updatedVotesAgainst
    const requiredVotes = Math.ceil((currentMilestone.totalVoters || 12) * 0.6) // 60% threshold

    // Check if voting is complete
    if (totalVotes >= (currentMilestone.totalVoters || 12) || updatedVotesFor >= requiredVotes) {
      const approved = updatedVotesFor >= requiredVotes

      setLocalMilestones((prev) =>
        prev.map((milestone, index) => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              status: approved ? "completed" : "locked",
              votesFor: updatedVotesFor,
              votesAgainst: updatedVotesAgainst,
              completedAt: approved
                ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : undefined,
            }
          }
          // Activate next milestone if current was approved
          if (approved && nextMilestone && milestone.id === nextMilestone.id) {
            return {
              ...milestone,
              status: "pending-vote",
              votesFor: 0,
              votesAgainst: 0,
              totalVoters: 12,
            }
          }
          return milestone
        }),
      )

      // Show toast notification
      toast({
        title: approved ? "🎉 Milestone Approved!" : "❌ Milestone Rejected",
        description: approved ? "Funds unlocked and next milestone activated!" : "Funds remain locked.",
        duration: 4000,
      })
    } else {
      // Just update vote count
      setLocalMilestones((prev) =>
        prev.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, votesFor: updatedVotesFor, votesAgainst: updatedVotesAgainst }
            : milestone,
        ),
      )
    }
  }

  const getMilestoneIcon = (milestone: Milestone) => {
    switch (milestone.status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-emerald-500" />
      case "in-progress":
        return <Clock className="w-6 h-6 text-amber-500" />
      case "pending-vote":
        return <Users className="w-6 h-6 text-blue-500" />
      case "locked":
        return <Lock className="w-6 h-6 text-red-500" />
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
    }
  }

  const getMilestoneStyles = (milestone: Milestone) => {
    switch (milestone.status) {
      case "completed":
        return "bg-emerald-50 border-emerald-200 shadow-emerald-200 shadow-lg animate-glow-green"
      case "in-progress":
        return "bg-amber-50 border-amber-200 shadow-amber-100 shadow-lg"
      case "pending-vote":
        return "bg-blue-50 border-blue-200 shadow-blue-200 shadow-lg animate-glow-blue"
      case "locked":
        return "bg-red-50 border-red-200 shadow-red-100 shadow-lg animate-shake opacity-75"
      default:
        return "bg-gray-50 border-gray-200 opacity-60"
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes glow-green {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
        }
        @keyframes glow-blue {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-glow-green {
          animation: glow-green 2s ease-in-out infinite;
        }
        .animate-glow-blue {
          animation: glow-blue 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out 3;
        }
      `}</style>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
            <span>Milestone Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {localMilestones && localMilestones.length > 0 ? (
            localMilestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Connecting Line */}
              {index < localMilestones.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-12 bg-gradient-to-b from-gray-300 to-gray-200"></div>
              )}

              {/* Milestone Card */}
              <Card className={`border-2 transition-all duration-500 ${getMilestoneStyles(milestone)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">{getMilestoneIcon(milestone)}</div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{milestone.title || 'Untitled Milestone'}</h3>
                          <p className="text-sm text-gray-600">{milestone.description || 'No description provided'}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">${milestone.amount?.toLocaleString() || '0'}</div>
                          <div className="text-sm text-gray-600">{milestone.percentage || 0}% of pool</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center space-x-2">
                        {milestone.status === "completed" && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed {milestone.completedAt}
                          </Badge>
                        )}
                        {milestone.status === "in-progress" && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                        {milestone.status === "pending-vote" && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            <Users className="w-3 h-3 mr-1" />
                            Pending Vote ({milestone.votesFor || 0}/{milestone.totalVoters || 0})
                          </Badge>
                        )}
                        {milestone.status === "locked" && (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <Lock className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </div>

                      {/* Submit Proof Section */}
                      {milestone.status === "in-progress" && userRole === "creator" && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                          <h4 className="font-medium text-amber-900 mb-3 flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Milestone Proof
                          </h4>
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Describe what you've completed and provide evidence..."
                              value={proofText}
                              onChange={(e) => setProofText(e.target.value)}
                              rows={3}
                              className="resize-none"
                            />
                            <div className="flex items-center justify-between">
                              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                <Upload className="w-3 h-3 mr-1" />
                                Upload Files
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSubmitProof(milestone.id)}
                                disabled={!proofText.trim() || isSubmitting}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit for Review"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pending Vote Status with Voting Buttons */}
                      {milestone.status === "pending-vote" && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-blue-900">Community Vote Active</span>
                              </div>
                              <div className="text-sm text-blue-700 font-medium">
                                {(milestone.votesFor || 0) + (milestone.votesAgainst || 0)} of{" "}
                                {milestone.totalVoters || 0} voted
                              </div>
                            </div>

                            {/* Voting Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                onClick={() => handleVote(milestone.id, "for")}
                                className="h-12 bg-emerald-600 hover:bg-emerald-700 flex flex-col items-center justify-center space-y-1"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Approve</span>
                              </Button>

                              <Button
                                onClick={() => handleVote(milestone.id, "against")}
                                variant="outline"
                                className="h-12 border-red-200 text-red-700 hover:bg-red-50 flex flex-col items-center justify-center space-y-1"
                              >
                                <Lock className="w-5 h-5" />
                                <span className="text-sm font-medium">Reject</span>
                              </Button>
                            </div>

                            {/* Vote Progress */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Approve: {milestone.votesFor || 0}</span>
                                <span>Reject: {milestone.votesAgainst || 0}</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${((milestone.votesFor || 0) / (milestone.totalVoters || 1)) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-center text-blue-600">
                                Need {Math.ceil((milestone.totalVoters || 12) * 0.6)} votes to approve
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Available</h3>
              <p className="text-gray-500">This pool doesn't have any milestones configured yet.</p>
            </div>
          )}}
        </CardContent>
      </Card>
    </>
  )
}
