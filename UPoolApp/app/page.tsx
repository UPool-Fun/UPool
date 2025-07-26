import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { StructuredData } from "@/components/structured-data"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'UPool - Social Funding Platform | Pool Funds, Earn Yield Together',
  description: 'Create funding pools with friends and communities on Base blockchain. Pool funds together, earn DeFi yield through Morpho Protocol, and unlock money based on milestone achievements. Native Farcaster Mini App.',
  keywords: 'social funding, cryptocurrency pool, DeFi yield, Base blockchain, Farcaster Mini App, community funding, milestone funding, crypto savings, group savings, collaborative finance',
  openGraph: {
    title: 'UPool - Pool Funds, Earn Yield, Achieve Goals Together',
    description: 'Join the social funding revolution. Create pools with friends, earn DeFi yield, and unlock funds through milestone achievements.',
    type: 'website',
    url: 'https://upool.fun',
  },
  twitter: {
    title: 'UPool - Social Funding Platform | Pool Funds, Earn Yield',
    description: 'Create funding pools with friends and communities. Pool funds, earn DeFi yield, and unlock money based on milestone achievements.',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <StructuredData type="webapp" />
      <Header showCreateButton={true} showExploreButton={false} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Built on Base
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Fund together.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                  Grow together.
                </span>{" "}
                Go further.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Pool funds with your community, earn yield on idle capital, and unlock funds based on milestones.
                Perfect for group trips, startup funding, or community projects.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8"
              >
                <Link href="/create">
                  Create a Pool
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explore">Explore Active Pools</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-3xl blur-3xl"></div>
            <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Sky Trip Fund</h3>
                    <span className="text-sm text-emerald-600 font-medium">+2.4% APY</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">$8,400 / $12,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">12</div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-xs text-gray-600">Milestones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">$201</div>
                      <div className="text-xs text-gray-600">Yield Earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why choose UPool?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The smart way to pool funds, earn yield, and achieve goals together
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Pool Together</h3>
              <p className="text-gray-600">
                Create shared funding pools with friends, family, or community members for any goal
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Earn Yield</h3>
              <p className="text-gray-600">
                Your pooled funds automatically earn yield through DeFi protocols while waiting for milestones
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Milestone Based</h3>
              <p className="text-gray-600">
                Funds are released gradually based on verified milestones, ensuring accountability
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to start pooling?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Create your first pool in minutes and start earning yield on your shared funds
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/create">
                Create Your Pool
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">U</span>
              </div>
              <span className="font-semibold text-gray-900">UPool</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-blue-600 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
