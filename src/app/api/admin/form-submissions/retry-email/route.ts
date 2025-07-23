import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Get the submission with form details
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            title: true,
            emailNotification: true,
            emailRecipients: true,
            dynamicEmailRecipients: true,
            emailFieldRecipients: true,
            sendToSubmitterEmail: true,
            submitterEmailField: true,
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (!submission.form.emailNotification) {
      return NextResponse.json(
        { error: 'Email notifications are not enabled for this form' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = typeof submission.formData === 'string' 
      ? JSON.parse(submission.formData) 
      : submission.formData;

    // Collect all recipients
    const allRecipients: string[] = [];

    // Add static recipients
    if (submission.form.emailRecipients) {
      const staticRecipients = submission.form.emailRecipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      allRecipients.push(...staticRecipients);
    }

    // Add dynamic recipients from form fields
    if (submission.form.dynamicEmailRecipients && submission.form.emailFieldRecipients) {
      const fieldNames = submission.form.emailFieldRecipients
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      for (const fieldName of fieldNames) {
        if (formData[fieldName] && typeof formData[fieldName] === 'string') {
          const email = formData[fieldName].trim();
          if (email.includes('@')) {
            allRecipients.push(email);
          }
        }
      }
    }

    if (allRecipients.length === 0) {
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          emailStatus: 'failed',
          emailError: 'No valid email recipients configured',
          updatedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: false,
        error: 'No valid email recipients configured',
        emailDetails: {
          error: 'No valid email recipients configured'
        }
      });
    }

    try {
      // Send admin notification emails
      const emailResults = [];
      
      for (const recipient of allRecipients) {
        try {
          const result = await emailService.sendFormSubmissionNotification(
            formData,
            submission.form.title
          );
          emailResults.push({ recipient, success: result });
        } catch (error) {
          console.error(`Failed to send email to ${recipient}:`, error);
          emailResults.push({ 
            recipient, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Send submitter confirmation email if configured
      let submitterEmailResult = null;
      if (submission.form.sendToSubmitterEmail && submission.form.submitterEmailField) {
        const submitterEmail = formData[submission.form.submitterEmailField];
        if (submitterEmail && typeof submitterEmail === 'string' && submitterEmail.includes('@')) {
          try {
            const result = await emailService.sendWelcomeEmail(
              submitterEmail,
              formData.first_name || formData.name || 'there'
            );
            submitterEmailResult = { success: result };
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
      const allEmailsSucceeded = emailResults.every(r => r.success) && 
        (submitterEmailResult === null || submitterEmailResult.success);

      const emailStatus = allEmailsSucceeded ? 'sent' : 'failed';
      const failedEmails = emailResults.filter(r => !r.success);
      const errorMessage = failedEmails.length > 0 
        ? `Failed to send to: ${failedEmails.map(f => f.recipient).join(', ')}`
        : null;

      // Update submission status
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          emailStatus,
          emailRecipients: allRecipients.join(','),
          emailSubject: `New ${submission.form.title} Submission`,
          emailSentAt: allEmailsSucceeded ? new Date() : null,
          emailError: errorMessage,
          updatedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: allEmailsSucceeded,
        message: allEmailsSucceeded 
          ? 'Email sent successfully' 
          : 'Some emails failed to send',
        emailDetails: {
          recipients: allRecipients,
          subject: `New ${submission.form.title} Submission`,
          sentAt: allEmailsSucceeded ? new Date().toISOString() : undefined,
          error: errorMessage,
        },
        results: {
          adminEmails: emailResults,
          submitterEmail: submitterEmailResult,
        }
      });

    } catch (error) {
      console.error('Error sending emails:', error);
      
      // Update submission with error
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          emailStatus: 'failed',
          emailError: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        emailDetails: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

  } catch (error) {
    console.error('Error retrying email:', error);
    return NextResponse.json(
      { error: 'Failed to retry email' },
      { status: 500 }
    );
  }
}