import { Badge } from "@/components/ui/badge"
import { Shield, Star, CheckCircle } from "lucide-react"

interface TrustBadgeProps {
  score: number
  type: "identity" | "builder" | "overall"
  size?: "sm" | "md" | "lg"
}

export function TrustBadge({ score, type, size = "md" }: TrustBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (score >= 60) return "bg-blue-100 text-blue-700 border-blue-200"
    return "bg-orange-100 text-orange-700 border-orange-200"
  }

  const getIcon = () => {
    if (type === "identity") return <Shield className="w-3 h-3" />
    if (type === "builder") return <Star className="w-3 h-3" />
    return <CheckCircle className="w-3 h-3" />
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  return (
    <Badge variant="outline" className={`${getColor(score)} ${sizeClasses[size]} flex items-center space-x-1`}>
      {getIcon()}
      <span className="capitalize">{type}</span>
      <span className="font-bold">{score}</span>
    </Badge>
  )
}
