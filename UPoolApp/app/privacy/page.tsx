import { Metadata } from 'next'
// Header removed for static rendering
// import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'UPool Privacy Policy - How we collect, use, and protect your information on our social funding platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header removed for static rendering */}
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">
              <strong>Last updated:</strong> January 26, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to UPool ("we," "our," or "us"). This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our social funding platform, 
                including our website, mobile application, and Farcaster Mini App (collectively, the "Service").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Wallet addresses and blockchain transaction data</li>
                <li>Farcaster profile information (FID, username, bio, profile picture)</li>
                <li>Email address (when provided for notifications)</li>
                <li>Pool creation and participation data</li>
                <li>Communication records (support messages, comments)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-2">Technical Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage analytics and interaction patterns</li>
                <li>Cookie and session data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Facilitate pool creation, management, and milestone tracking</li>
                <li>Process transactions and yield farming operations</li>
                <li>Verify identity and prevent fraud</li>
                <li>Send notifications about pool activities and milestones</li>
                <li>Improve our Service and develop new features</li>
                <li>Comply with legal obligations and regulatory requirements</li>
                <li>Provide customer support and resolve disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Blockchain and DeFi Considerations</h2>
              <p>
                UPool operates on the Base blockchain and integrates with DeFi protocols like Morpho. 
                Please note that:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Blockchain transactions are public and immutable</li>
                <li>Smart contract interactions are recorded permanently</li>
                <li>Yield farming activities are visible on-chain</li>
                <li>Pool participation and milestone data may be publicly accessible</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing</h2>
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Service Providers:</strong> Third-party services that support our operations</li>
                <li><strong>Blockchain Networks:</strong> Base network and integrated DeFi protocols</li>
                <li><strong>Legal Compliance:</strong> When required by law or legal process</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                <li><strong>With Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure infrastructure and monitoring systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Delete your personal information (subject to legal requirements)</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, 
                and provide personalized content. You can manage cookie preferences through your 
                browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your 
                country of residence. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p>
                Our Service is not intended for individuals under the age of 18. We do not knowingly 
                collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, 
                please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> privacy@upool.fun</p>
                <p><strong>Support:</strong> <a href="/support" className="text-blue-600 hover:text-blue-800">Contact Form</a></p>
                <p><strong>Address:</strong> UPool Team, [Address to be provided]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}