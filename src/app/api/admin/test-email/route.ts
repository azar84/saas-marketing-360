import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

// Helper function to check DNS records (basic implementation)
async function checkDomainAuthentication(domain: string) {
  try {
    // This is a basic implementation - in production, you'd use a proper DNS library
    const checks = {
      spf: false,
      dmarc: false,
      domain: domain,
      suggestions: [] as string[]
    };

    // Basic domain validation
    if (domain.includes('@gmail.com') || domain.includes('@googlemail.com')) {
      checks.suggestions.push('✅ Using Gmail - generally good deliverability');
    } else if (domain.includes('@outlook.com') || domain.includes('@hotmail.com') || domain.includes('@live.com')) {
      checks.suggestions.push('✅ Using Outlook - generally good deliverability');
    } else if (domain.includes('@yahoo.com')) {
      checks.suggestions.push('✅ Using Yahoo - generally good deliverability');
    } else {
      checks.suggestions.push('⚠️ Custom domain detected - ensure DNS authentication records are configured');
      checks.suggestions.push('💡 Consider using your email provider\'s domain for better deliverability');
    }

    return checks;
  } catch (error) {
    return {
      spf: false,
      dmarc: false,
      domain: domain,
      suggestions: ['❌ Unable to check domain authentication'],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Test the email configuration
    const result = await emailService.testEmailConfiguration();

    if (result.success) {
      // Get email settings to check domain
      const emailSettings = await emailService.getEmailSettings();
      const fromEmail = emailSettings?.smtpFromEmail || '';
      const domain = fromEmail.split('@')[1] || '';

      // Check domain authentication
      const domainCheck = await checkDomainAuthentication(fromEmail);

      // Send test email
      const testSent = await emailService.sendEmail({
        to: testEmail,
        subject: 'Email Configuration Test',
        html: `
          <h2>Email Configuration Test</h2>
          <p>Congratulations! Your email configuration is working correctly.</p>
          <p>This test email was sent to verify that your SMTP settings are properly configured.</p>
          
          <h3>Test Details:</h3>
          <ul>
            <li><strong>Test performed at:</strong> ${new Date().toISOString()}</li>
            <li><strong>Recipient:</strong> ${testEmail}</li>
            <li><strong>From Email:</strong> ${fromEmail}</li>
            <li><strong>Domain:</strong> ${domain}</li>
          </ul>
          
          <h3>Deliverability Notes:</h3>
          <ul>
            ${domainCheck.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
          
          <p>You can now use email functionality throughout your website!</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            If you see an "unverified" badge in Outlook, it means your domain needs DNS authentication records (SPF, DKIM, DMARC). 
            Check your admin panel for detailed setup instructions.
          </p>
        `,
      });

      if (testSent) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          domainCheck: domainCheck,
          deliverabilityTips: [
            'Email sent successfully through SMTP server',
            'Check recipient\'s spam folder if not received',
            domain.includes('gmail.com') || domain.includes('outlook.com') || domain.includes('yahoo.com') 
              ? 'Using major email provider - good deliverability expected'
              : 'Custom domain detected - consider adding DNS authentication records',
            'Monitor email reputation and delivery rates'
          ]
        });
      } else {
        return NextResponse.json(
          { 
            error: 'Email configuration test passed, but failed to send test email',
            domainCheck: domainCheck
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Email configuration test failed',
          details: result.details,
          suggestion: result.details?.suggestion
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return NextResponse.json(
      { error: 'Failed to test email configuration' },
      { status: 500 }
    );
  }
} 