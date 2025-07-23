import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, formData, metadata } = body;

    // Validate required fields
    if (!formId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: formId, formData' },
        { status: 400 }
      );
    }

    // Check if form exists and is active
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Handle newsletter subscription if enabled
    if (form.newsletterAction && form.newsletterEmailField) {
      const newsletterEmail = formData[form.newsletterEmailField];
      if (newsletterEmail && typeof newsletterEmail === 'string' && newsletterEmail.includes('@')) {
        try {
          const email = newsletterEmail.trim().toLowerCase();
          
          // Check if subscriber already exists
          const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
          });

          if (existingSubscriber) {
            // Update existing subscriber to subscribed if they were unsubscribed
            if (!existingSubscriber.subscribed) {
              await prisma.newsletterSubscriber.update({
                where: { id: existingSubscriber.id },
                data: { subscribed: true, updatedAt: new Date() }
              });
            }
          } else {
            // Create new subscriber
            await prisma.newsletterSubscriber.create({
              data: {
                email,
                subscribed: true
              }
            });
          }
        } catch (error) {
          console.error('Error handling newsletter subscription:', error);
          // Don't fail the form submission if newsletter subscription fails
        }
      }
    }

    // Store the form submission first
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        formData: JSON.stringify(formData),
        ipAddress: metadata?.ipAddress || null,
        userAgent: metadata?.userAgent || null,
        referrer: metadata?.url || null,
        emailStatus: form.emailNotification ? 'pending' : 'not_configured',
      }
    });

    // Handle email notifications if enabled
    let emailResults = {
      success: true,
      details: null as any,
      error: null as string | null
    };

    if (form.emailNotification) {
      try {
        // Collect all recipients
        const allRecipients: string[] = [];

        // Add static recipients
        if (form.emailRecipients) {
          const staticRecipients = form.emailRecipients
            .split(',')
            .map((email: string) => email.trim())
            .filter((email: string) => email.length > 0);
          allRecipients.push(...staticRecipients);
        }

        // Add dynamic recipients from form fields
        if (form.dynamicEmailRecipients && form.emailFieldRecipients) {
          try {
            const fieldNames = JSON.parse(form.emailFieldRecipients);
            
            for (const fieldName of fieldNames) {
              if (formData[fieldName] && typeof formData[fieldName] === 'string') {
                const email = formData[fieldName].trim();
                if (email.includes('@')) {
                  allRecipients.push(email);
                }
              }
            }
          } catch (error) {
            console.error('Error parsing dynamic email recipients:', error);
            // Fallback: treat as comma-separated string for backward compatibility
            const fieldNames = form.emailFieldRecipients
              .split(',')
              .map((name: string) => name.trim())
              .filter((name: string) => name.length > 0);
            
            for (const fieldName of fieldNames) {
              if (formData[fieldName] && typeof formData[fieldName] === 'string') {
                const email = formData[fieldName].trim();
                if (email.includes('@')) {
                  allRecipients.push(email);
                }
              }
            }
          }
        }

        // Get submitter email to exclude from admin notifications
        let submitterEmail = null;
        if (form.sendToSubmitterEmail && form.submitterEmailField) {
          submitterEmail = formData[form.submitterEmailField];
          if (submitterEmail && typeof submitterEmail === 'string' && submitterEmail.includes('@')) {
            submitterEmail = submitterEmail.trim().toLowerCase();
          } else {
            submitterEmail = null;
          }
        }

        // Filter out submitter email from admin recipients to avoid duplicate emails
        const adminRecipients = allRecipients.filter(email => {
          if (!submitterEmail) return true; // No submitter email to exclude
          return email.trim().toLowerCase() !== submitterEmail;
        });

        if (adminRecipients.length > 0) {
          // Send admin notification emails
          const adminEmailResults = [];
          
          for (const recipient of adminRecipients) {
            try {
              const result = await emailService.sendFormSubmissionNotificationWithTemplate(
                recipient,
                formData,
                form,
                {
                  submissionId: submission.id,
                  submittedAt: submission.createdAt.toISOString(),
                  formName: form.name,
                }
              );
              adminEmailResults.push({ 
                recipient, 
                success: result.success, 
                messageId: result.messageId 
              });
            } catch (error) {
              console.error(`Failed to send email to ${recipient}:`, error);
              adminEmailResults.push({ 
                recipient, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              });
            }
          }

          // Send submitter confirmation email if configured
          let submitterEmailResult = null;
          if (form.sendToSubmitterEmail && form.submitterEmailField) {
            const submitterEmail = formData[form.submitterEmailField];
            if (submitterEmail && typeof submitterEmail === 'string' && submitterEmail.includes('@')) {
              try {
                const result = await emailService.sendSubmitterConfirmationWithTemplate(
                  submitterEmail,
                  formData,
                  form
                );
                submitterEmailResult = { 
                  success: result.success, 
                  messageId: result.messageId 
                };
              } catch (error) {
                console.error(`Failed to send confirmation email to ${submitterEmail}:`, error);
                submitterEmailResult = { 
                  success: false, 
                  error: error instanceof Error ? error.message : 'Unknown error' 
                };
              }
            }
          }

          // Determine overall success
          const allEmailsSucceeded = adminEmailResults.every(r => r.success) && 
            (submitterEmailResult === null || submitterEmailResult.success);

          const emailStatus = allEmailsSucceeded ? 'sent' : 'failed';
          const failedEmails = adminEmailResults.filter(r => !r.success);
          const errorMessage = failedEmails.length > 0 
            ? `Failed to send to: ${failedEmails.map(f => f.recipient).join(', ')}`
            : null;

          // Update submission with email results
          await prisma.formSubmission.update({
            where: { id: submission.id },
            data: {
              emailStatus,
              emailMessageId: adminEmailResults.find(r => r.success)?.messageId || null,
              emailRecipients: adminRecipients.join(','),
              emailSubject: `New ${form.title} Submission`,
              emailSentAt: allEmailsSucceeded ? new Date() : null,
              emailError: errorMessage,
            }
          });

          emailResults = {
            success: allEmailsSucceeded,
            details: {
              messageId: adminEmailResults.find(r => r.success)?.messageId,
              recipients: adminRecipients,
              subject: `New ${form.title} Submission`,
              sentAt: allEmailsSucceeded ? new Date().toISOString() : undefined,
              error: errorMessage,
            },
            error: errorMessage
          };

          // Log email results for debugging
          console.log('Email sent successfully:', {
            messageId: adminEmailResults.find(r => r.success)?.messageId,
            to: adminRecipients.join(', '),
            subject: `New ${form.title} Submission`,
            timestamp: new Date().toISOString()
          });

        } else {
          // No recipients configured
          await prisma.formSubmission.update({
            where: { id: submission.id },
            data: {
              emailStatus: 'failed',
              emailError: 'No valid email recipients configured',
            }
          });

          emailResults = {
            success: false,
            details: null,
            error: 'No valid email recipients configured'
          };
        }

      } catch (error) {
        console.error('Error sending form submission emails:', error);
        
        // Update submission with error
        await prisma.formSubmission.update({
          where: { id: submission.id },
          data: {
            emailStatus: 'failed',
            emailError: error instanceof Error ? error.message : 'Unknown error',
          }
        });

        emailResults = {
          success: false,
          details: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: form.successMessage,
      redirectUrl: form.redirectUrl,
      email: emailResults
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process form submission',
        message: 'Sorry, there was an error processing your submission. Please try again.'
      },
      { status: 500 }
    );
  }
}

/**
 * Send form notifications based on form configuration
 */
async function sendFormNotifications(form: any, formData: any, submissionId: number) {
  const emailRecipients: string[] = [];
  
  // Add static email recipients
  if (form.emailRecipients) {
    const staticRecipients = form.emailRecipients.split(',').map((email: string) => email.trim()).filter(Boolean);
    emailRecipients.push(...staticRecipients);
  }
  
  // Add dynamic email recipients from form fields
  if (form.dynamicEmailRecipients && form.emailFieldRecipients) {
    try {
      const fieldNames = JSON.parse(form.emailFieldRecipients);
      fieldNames.forEach((fieldName: string) => {
        const emailValue = formData[fieldName];
        if (emailValue && isValidEmail(emailValue)) {
          emailRecipients.push(emailValue);
        }
      });
    } catch (error) {
      console.error('Error parsing dynamic email recipients:', error);
    }
  }
  
  // Remove duplicates
  const uniqueRecipients = [...new Set(emailRecipients)];
  
  // Send notification emails to all recipients
  if (uniqueRecipients.length > 0) {
    const formName = form.title || form.name || 'Form';
    
    // Create the email content
    const fieldsHtml = Object.entries(formData)
      .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 500;">${key}</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${value}</td></tr>`)
      .join('');

    const html = `
      <h2>New Form Submission: ${formName}</h2>
      <p>You have received a new form submission from your website.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Field</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${fieldsHtml}
        </tbody>
      </table>
      
      <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
        Submitted on: ${new Date().toLocaleString()}<br/>
        Submission ID: ${submissionId}
      </p>
    `;

    // Send to all recipients
    for (const recipient of uniqueRecipients) {
      try {
        await emailService.sendEmail({
          to: recipient,
          subject: `New ${formName} Submission`,
          html,
        });
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
      }
    }
  }
  
  // Send confirmation email to form submitter if enabled
  if (form.sendToSubmitterEmail && form.submitterEmailField) {
    const submitterEmail = formData[form.submitterEmailField];
    if (submitterEmail && isValidEmail(submitterEmail)) {
      try {
        const submitterName = formData.name || formData.firstName || formData.fullName || 'there';
        await emailService.sendWelcomeEmail(submitterEmail, submitterName);
      } catch (error) {
        console.error('Failed to send confirmation email to submitter:', error);
      }
    }
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 