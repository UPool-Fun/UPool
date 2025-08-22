"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Target } from "lucide-react"

interface Milestone {
  id: string
  title: string
  description: string
  percentage: number
}

interface MilestoneManagerProps {
  milestones: Milestone[]
  onMilestonesChange: (milestones: Milestone[]) => void
  fundingGoal: string
}

export default function MilestoneManager({ milestones, onMilestonesChange, fundingGoal }: MilestoneManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    percentage: 0
  })

  // Calculate total percentage
  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0)
  const isValidTotal = totalPercentage === 100
  const remainingPercentage = 100 - totalPercentage

  // Calculate funding amounts
  const goalAmount = parseFloat(fundingGoal) || 0

  const openDialog = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone)
      setFormData({
        title: milestone.title,
        description: milestone.description,
        percentage: milestone.percentage
      })
    } else {
      setEditingMilestone(null)
      setFormData({
        title: "",
        description: "",
        percentage: remainingPercentage > 0 ? Math.min(remainingPercentage, 25) : 0
      })
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingMilestone(null)
    setFormData({ title: "", description: "", percentage: 0 })
  }

  const saveMilestone = () => {
    if (!formData.title.trim() || formData.percentage <= 0) return

    const newMilestone: Milestone = {
      id: editingMilestone?.id || Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      percentage: formData.percentage
    }

    if (editingMilestone) {
      // Update existing milestone
      const updatedMilestones = milestones.map(m => 
        m.id === editingMilestone.id ? newMilestone : m
      )
      onMilestonesChange(updatedMilestones)
    } else {
      // Add new milestone
      onMilestonesChange([...milestones, newMilestone])
    }

    closeDialog()
  }

  const removeMilestone = (id: string) => {
    const updatedMilestones = milestones.filter(m => m.id !== id)
    onMilestonesChange(updatedMilestones)
  }

  const getProgressColor = () => {
    if (totalPercentage === 100) return "bg-green-500"
    if (totalPercentage > 100) return "bg-red-500"
    return "bg-blue-500"
  }

  const canAddMilestone = remainingPercentage > 0

  return (
    <div className="space-y-6">
      {/* Header with validation status */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Milestones</h3>
          <p className="text-sm text-gray-600">Define funding unlock milestones for your pool</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              size="sm"
              disabled={!canAddMilestone}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Book flights and accommodation"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what needs to be accomplished for this milestone"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage">Unlock Percentage</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max={editingMilestone ? 
                      100 - totalPercentage + editingMilestone.percentage : 
                      remainingPercentage
                    }
                    placeholder="25"
                    value={formData.percentage || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      percentage: Math.max(0, parseInt(e.target.value) || 0)
                    }))}
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                {remainingPercentage > 0 && !editingMilestone && (
                  <p className="text-xs text-gray-600">
                    Remaining: {remainingPercentage}%
                  </p>
                )}
                {goalAmount > 0 && (
                  <p className="text-xs text-gray-600">
                    Amount: {((goalAmount * formData.percentage) / 100).toFixed(4)} ETH
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                onClick={saveMilestone}
                disabled={!formData.title.trim() || formData.percentage <= 0}
              >
                {editingMilestone ? 'Update' : 'Add'} Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress and validation status */}
      <Card className={`border-2 ${isValidTotal ? 'border-green-200 bg-green-50' : totalPercentage > 100 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Total Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-semibold ${
                isValidTotal ? 'text-green-600' : 
                totalPercentage > 100 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {totalPercentage}%
              </span>
              {isValidTotal && <CheckCircle className="w-4 h-4 text-green-600" />}
              {totalPercentage > 100 && <AlertTriangle className="w-4 h-4 text-red-600" />}
            </div>
          </div>
          <Progress 
            value={Math.min(totalPercentage, 100)} 
            className="h-2"
          />
          <div className={`mt-2 text-xs ${
            isValidTotal ? 'text-green-600' : 
            totalPercentage > 100 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {isValidTotal ? (
              "✓ Perfect! All milestones add up to 100%"
            ) : totalPercentage > 100 ? (
              `⚠ Over by ${totalPercentage - 100}% - please adjust milestones`
            ) : (
              `${remainingPercentage}% remaining to reach 100%`
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No milestones yet</h4>
            <p className="text-gray-500 mb-4">
              Add milestones to define how funds will be unlocked as your pool progresses.
            </p>
            <Button onClick={() => openDialog()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const milestoneAmount = ((goalAmount * milestone.percentage) / 100)
            
            return (
              <Card key={milestone.id} className="border border-gray-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          Milestone {index + 1}
                        </Badge>
                        <span className="text-sm font-semibold text-blue-600">
                          {milestone.percentage}%
                        </span>
                        {goalAmount > 0 && (
                          <span className="text-sm text-gray-600">
                            ({milestoneAmount.toFixed(4)} ETH)
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        onClick={() => openDialog(milestone)}
                        size="sm"
                        variant="ghost"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => removeMilestone(milestone.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Validation alerts */}
      {!isValidTotal && milestones.length > 0 && (
        <Alert className={totalPercentage > 100 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
          <AlertTriangle className={`h-4 w-4 ${totalPercentage > 100 ? "text-red-600" : "text-yellow-600"}`} />
          <AlertDescription className={totalPercentage > 100 ? "text-red-700" : "text-yellow-700"}>
            {totalPercentage > 100 ? (
              <>
                <strong>Milestone percentages exceed 100%</strong><br />
                Please adjust your milestones to total exactly 100%.
              </>
            ) : (
              <>
                <strong>Milestone percentages total {totalPercentage}%</strong><br />
                Add more milestones or adjust existing ones to reach exactly 100%.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}