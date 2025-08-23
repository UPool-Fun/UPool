import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, Search } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

const mockPools = [
  {
    id: "skytrip",
    title: "Sky Trip to Japan",
    description: "Group trip to Japan in spring 2024",
    fundingGoal: 12000,
    currentAmount: 8400,
    yieldRate: 2.4,
    members: 12,
    category: "Travel",
    daysLeft: 45,
  },
  {
    id: "startup-fund",
    title: "Tech Startup Seed Fund",
    description: "Pooling resources to launch our SaaS platform",
    fundingGoal: 50000,
    currentAmount: 32000,
    yieldRate: 3.1,
    members: 8,
    category: "Business",
    daysLeft: 120,
  },
  {
    id: "community-garden",
    title: "Community Garden Project",
    description: "Creating a shared garden space for our neighborhood",
    fundingGoal: 5000,
    currentAmount: 3200,
    yieldRate: 2.8,
    members: 24,
    category: "Community",
    daysLeft: 30,
  },
  {
    id: "music-festival",
    title: "Local Music Festival",
    description: "Organizing a weekend music festival for local artists",
    fundingGoal: 25000,
    currentAmount: 18500,
    yieldRate: 2.2,
    members: 156,
    category: "Events",
    daysLeft: 60,
  },
]

export default function ExplorePools() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Header showCreateButton={true} showExploreButton={false} />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Active Pools</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and join funding pools from communities around the world
          </p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search pools..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="funding">Most Funded</SelectItem>
                  <SelectItem value="yield">Highest Yield</SelectItem>
                  <SelectItem value="members">Most Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pool Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPools.map((pool) => {
            const progressPercentage = (pool.currentAmount / pool.fundingGoal) * 100

            return (
              <Card
                key={pool.id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{pool.category}</Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      <TrendingUp className="w-3 h-3 mr-1" />+{pool.yieldRate}%
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{pool.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{pool.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        ${pool.currentAmount.toLocaleString()} / ${pool.fundingGoal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="text-xs text-gray-500">{Math.round(progressPercentage)}% funded</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{pool.members}</span>
                      </div>
                      <div>{pool.daysLeft} days left</div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="group-hover:bg-blue-50 group-hover:border-blue-200 bg-transparent"
                    >
                      <Link href={`/pool/${pool.id}`}>View Pool</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Pools
          </Button>
        </div>
      </div>
    </div>
  )
}
