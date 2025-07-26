import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, category } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send email to UPool support team
    const supportEmailData = {
      from: 'UPool Support <noreply@upool.fun>',
      to: ['contact@upool.fun'],
      subject: `[UPool Support] ${category ? `[${category}] ` : ''}${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2998d0 0%, #10b981 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">UPool Support Request</h1>
          </div>
          
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #374151; margin-top: 0;">Contact Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category || 'General'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            
            <h2 style="color: #374151;">Message</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2998d0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e5f3ff; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Submitted:</strong> ${new Date().toLocaleString('en-US', {
                  timeZone: 'UTC',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </p>
            </div>
          </div>
          
          <div style="padding: 20px; background: #374151; text-align: center;">
            <p style="color: #d1d5db; margin: 0; font-size: 14px;">
              UPool - Social Funding Platform | 
              <a href="https://upool.fun" style="color: #60a5fa;">upool.fun</a>
            </p>
          </div>
        </div>
      `,
    }

    // Send auto-response to user
    const autoResponseData = {
      from: 'UPool Support <noreply@upool.fun>',
      to: [email],
      subject: 'We received your message - UPool Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2998d0 0%, #10b981 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">
              We've received your support request
            </p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for contacting UPool support! We've received your message about 
              "<strong>${subject}</strong>" and our team will review it shortly.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2998d0; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What happens next?</h3>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>Our support team will review your request within 24 hours</li>
                <li>You'll receive a detailed response via email</li>
                <li>For urgent issues, we typically respond within 2-4 hours</li>
                <li>Complex technical issues may require additional investigation time</li>
              </ul>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46; margin-top: 0;">📋 Your Request Summary</h3>
              <p style="color: #065f46; margin: 5px 0;"><strong>Category:</strong> ${category || 'General'}</p>
              <p style="color: #065f46; margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="color: #065f46; margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">💡 Quick Help</h3>
              <p style="color: #92400e; margin-bottom: 10px;">While you wait, you might find these helpful:</p>
              <ul style="color: #92400e;">
                <li><a href="https://upool.fun/privacy" style="color: #2563eb;">Privacy Policy</a> - Learn how we protect your data</li>
                <li><a href="https://upool.fun/terms" style="color: #2563eb;">Terms of Service</a> - Understand our platform rules</li>
                <li><a href="https://upool.fun" style="color: #2563eb;">UPool Platform</a> - Create and explore funding pools</li>
              </ul>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              If you have any additional information or questions, feel free to reply to this email.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>The UPool Support Team</strong>
            </p>
          </div>
          
          <div style="padding: 20px; background: #374151; text-align: center;">
            <p style="color: #d1d5db; margin: 0 0 10px 0;">
              <strong>UPool - Social Funding Platform</strong>
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              Pool funds, earn yield, achieve goals together | 
              <a href="https://upool.fun" style="color: #60a5fa;">upool.fun</a>
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated response. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    }

    // Send both emails concurrently
    const [supportEmail, autoResponseEmail] = await Promise.all([
      resend.emails.send(supportEmailData),
      resend.emails.send(autoResponseData),
    ])

    console.log('Support email sent:', supportEmail)
    console.log('Auto-response email sent:', autoResponseEmail)

    return NextResponse.json(
      { 
        message: 'Support request submitted successfully',
        supportEmailId: supportEmail.data?.id,
        autoResponseEmailId: autoResponseEmail.data?.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Support API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit support request' },
      { status: 500 }
    )
  }
}