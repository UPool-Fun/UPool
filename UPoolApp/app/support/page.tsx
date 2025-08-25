'use client'

import { useState } from 'react'
import { Metadata } from 'next'
// Remove header temporarily for static rendering
// import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, MessageCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FormData {
  name: string
  email: string
  category: string
  subject: string
  message: string
}

export default function SupportPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const categories = [
    'General Question',
    'Technical Issue',
    'Pool Management',
    'Wallet Connection',
    'Yield Farming',
    'Farcaster Integration',
    'Account Support',
    'Feature Request',
    'Bug Report',
    'Partnership Inquiry'
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        toast.success('Support request submitted successfully!')
        // Reset form
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to submit support request')
      }
    } catch (error) {
      console.error('Support form error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        {/* Header removed for static rendering */}
        
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Your support request has been submitted successfully. We'll get back to you within 24 hours.
              </p>
              
              <div className="space-y-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Check your email for a confirmation message</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Expected response time: 2-24 hours</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="mr-4"
              >
                Submit Another Request
              </Button>
              
              <Button asChild>
                <a href="/">Back to Home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header removed for static rendering */}
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Contact Support
                </CardTitle>
                <p className="text-gray-600">
                  Need help with UPool? Send us a message and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide as much detail as possible about your issue or question..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>General:</strong> 2-24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span><strong>Technical:</strong> 4-48 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span><strong>Urgent:</strong> 1-4 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Common Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Common Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900">Wallet Connection</h4>
                    <p className="text-gray-600">Issues connecting MetaMask or other wallets</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Pool Management</h4>
                    <p className="text-gray-600">Creating, joining, or managing funding pools</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Farcaster Integration</h4>
                    <p className="text-gray-600">Mini App functionality and social features</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Yield Farming</h4>
                    <p className="text-gray-600">Questions about DeFi yield and Morpho Protocol</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                  Direct Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>General Support:</strong><br />
                  <a href="mailto:contact@upool.fun" className="text-blue-600 hover:text-blue-800">
                    contact@upool.fun
                  </a>
                </div>
                <div>
                  <strong>Technical Issues:</strong><br />
                  <a href="mailto:tech@upool.fun" className="text-blue-600 hover:text-blue-800">
                    tech@upool.fun
                  </a>
                </div>
                <div>
                  <strong>Business Inquiries:</strong><br />
                  <a href="mailto:business@upool.fun" className="text-blue-600 hover:text-blue-800">
                    business@upool.fun
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}