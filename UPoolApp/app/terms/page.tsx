import { Metadata } from 'next'
// Header removed for static rendering
// import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'UPool Terms of Service - Legal terms and conditions for using our social funding platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header removed for static rendering */}
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">
              <strong>Last updated:</strong> January 26, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using UPool ("Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these terms, you may not access the Service. 
                UPool is a decentralized social funding platform built on the Base blockchain that enables 
                users to create funding pools, earn yield, and achieve goals through milestone-based unlocking.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p>UPool provides:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Social funding pool creation and management</li>
                <li>DeFi yield farming through Morpho Protocol integration</li>
                <li>Milestone-based fund unlocking mechanisms</li>
                <li>Farcaster Mini App integration for social discovery</li>
                <li>Base blockchain smart contract interactions</li>
                <li>Community governance and trust scoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Eligibility</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2">Eligibility Requirements</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>You must be at least 18 years old</li>
                <li>You must have legal capacity to enter into contracts</li>
                <li>You must not be located in a restricted jurisdiction</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-2">Account Security</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>You are responsible for securing your wallet and private keys</li>
                <li>Never share your wallet credentials or recovery phrases</li>
                <li>Report suspicious activity immediately</li>
                <li>Use strong authentication methods when available</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Pool Creation and Participation</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2">Pool Creators</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Must provide accurate and truthful information about pool purposes</li>
                <li>Are responsible for setting realistic milestones and timelines</li>
                <li>Must manage pools in good faith and in participants' best interests</li>
                <li>Cannot use pools for illegal activities or fraud</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-2">Pool Participants</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Must conduct due diligence before joining pools</li>
                <li>Understand that contributions may be subject to smart contract risks</li>
                <li>Agree to milestone validation processes</li>
                <li>Accept yield farming risks and potential losses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Financial Risks and Disclaimers</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2">DeFi and Blockchain Risks</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li><strong>Smart Contract Risk:</strong> Smart contracts may contain bugs or vulnerabilities</li>
                <li><strong>Market Risk:</strong> Cryptocurrency values can fluctuate significantly</li>
                <li><strong>Yield Risk:</strong> DeFi protocols may experience losses or reduced returns</li>
                <li><strong>Liquidity Risk:</strong> Funds may become temporarily inaccessible</li>
                <li><strong>Regulatory Risk:</strong> Laws may change affecting service availability</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-2">No Investment Advice</h3>
              <p>
                UPool does not provide investment, financial, or legal advice. All decisions to participate 
                in pools or yield farming activities are made at your own risk and discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
              <p>You may not use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Engage in illegal activities or money laundering</li>
                <li>Create fraudulent or misleading pools</li>
                <li>Manipulate milestone validation processes</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Interfere with the Service's operation or security</li>
                <li>Violate intellectual property rights</li>
                <li>Attempt to circumvent access controls or restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Fees and Payments</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>UPool may charge fees for certain services</li>
                <li>Blockchain transaction fees (gas) are paid separately</li>
                <li>DeFi protocol fees may apply to yield farming activities</li>
                <li>Fee structures will be clearly disclosed before transactions</li>
                <li>Fees are generally non-refundable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by UPool 
                and are protected by international copyright, trademark, patent, trade secret, and 
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy and Data</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of the Service, to understand our practices regarding your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Service Availability</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Service availability is not guaranteed and may be interrupted</li>
                <li>We may modify, suspend, or discontinue features at any time</li>
                <li>Maintenance and updates may cause temporary unavailability</li>
                <li>Blockchain network issues may affect service functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers and Limitation of Liability</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2">Disclaimers</h3>
              <p className="mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-2">Limitation of Liability</h3>
              <p>
                IN NO EVENT SHALL UPOOL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR 
                INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless UPool and its officers, directors, 
                employees, and agents from and against any claims, damages, obligations, losses, 
                liabilities, costs, or debt arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Most disputes can be resolved through our support system</li>
                <li>Disputes may be subject to binding arbitration</li>
                <li>Class action lawsuits are waived where legally permissible</li>
                <li>Governing law depends on your jurisdiction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service immediately, without prior 
                notice or liability, for any reason, including breach of these Terms. Upon termination, 
                your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is 
                material, we will try to provide at least 30 days' notice prior to any new terms taking 
                effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> legal@upool.fun</p>
                <p><strong>Support:</strong> <a href="/support" className="text-blue-600 hover:text-blue-800">Contact Form</a></p>
                <p><strong>Address:</strong> UPool Team, [Address to be provided]</p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500 italic">
                By using UPool, you acknowledge that you have read, understood, and agree to be bound 
                by these Terms of Service and our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}