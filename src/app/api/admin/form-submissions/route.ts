import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/form-submissions - Get all form submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const whereClause = formId ? { formId: parseInt(formId) } : {};

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where: whereClause,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.formSubmission.count({ where: whereClause })
    ]);

    // Transform submissions to match our interface
    const transformedSubmissions = submissions.map(submission => ({
      id: submission.id,
      formId: submission.formId,
      formData: typeof submission.formData === 'string' 
        ? JSON.parse(submission.formData) 
        : submission.formData,
      metadata: {
        userAgent: submission.userAgent || undefined,
        timestamp: submission.createdAt.toISOString(),
        url: submission.referrer || undefined,
        ipAddress: submission.ipAddress || undefined,
      },
      emailStatus: submission.emailStatus || 'not_configured',
      emailDetails: {
        messageId: submission.emailMessageId || undefined,
        recipients: submission.emailRecipients ? submission.emailRecipients.split(',') : [],
        subject: submission.emailSubject || undefined,
        sentAt: submission.emailSentAt?.toISOString() || undefined,
        error: submission.emailError || undefined,
      },
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      form: submission.form,
    }));

    return NextResponse.json(transformedSubmissions);
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/form-submissions - Update submission status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, emailStatus, emailDetails } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (emailStatus) {
      updateData.emailStatus = emailStatus;
    }
    
    if (emailDetails) {
      if (emailDetails.messageId) updateData.emailMessageId = emailDetails.messageId;
      if (emailDetails.recipients) updateData.emailRecipients = emailDetails.recipients.join(',');
      if (emailDetails.subject) updateData.emailSubject = emailDetails.subject;
      if (emailDetails.sentAt) updateData.emailSentAt = new Date(emailDetails.sentAt);
      if (emailDetails.error) updateData.emailError = emailDetails.error;
    }

    const updatedSubmission = await prisma.formSubmission.update({
      where: { id: parseInt(id) },
      data: updateData,
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

    return NextResponse.json({
      id: updatedSubmission.id,
      emailStatus: updatedSubmission.emailStatus,
      emailDetails: {
        messageId: updatedSubmission.emailMessageId,
        recipients: updatedSubmission.emailRecipients?.split(',') || [],
        subject: updatedSubmission.emailSubject,
        sentAt: updatedSubmission.emailSentAt?.toISOString(),
        error: updatedSubmission.emailError,
      }
    });
  } catch (error) {
    console.error('Error updating form submission:', error);
    return NextResponse.json(
      { error: 'Failed to update form submission' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/form-submissions - Delete a submission
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    await prisma.formSubmission.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete form submission' },
      { status: 500 }
    );
  }
} 