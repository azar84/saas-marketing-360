import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactSectionId, formData, metadata } = body;

    // Validate required fields
    if (!contactSectionId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: contactSectionId, formData' },
        { status: 400 }
      );
    }

    // Check if contact section exists and is active
    const contactSection = await prisma.contactSection.findUnique({
      where: { id: contactSectionId },
      include: {
        fields: {
          where: { isRequired: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!contactSection) {
      return NextResponse.json({ error: 'Contact section not found' }, { status: 404 });
    }

    if (!contactSection.isActive) {
      return NextResponse.json({ error: 'Contact form is currently disabled' }, { status: 400 });
    }

    // Validate required fields
    const missingFields: string[] = [];
    contactSection.fields.forEach(field => {
      if (field.isRequired && (!formData[field.fieldName] || formData[field.fieldName].toString().trim() === '')) {
        missingFields.push(field.label);
      }
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the submission
    const submission = await prisma.contactSubmission.create({
      data: {
        contactSectionId,
        formData: JSON.stringify(formData),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        referrer: request.headers.get('referer') || undefined
      },
    });

    // Send email notification if email settings are configured
    try {
      const formName = contactSection.heading || 'Contact Form';
      await emailService.sendFormSubmissionNotification(formData, formName);
      
      // Send auto-responder email to user if they provided an email
      const userEmail = formData.email || formData.Email;
      if (userEmail) {
        await emailService.sendWelcomeEmail(userEmail, formData.name || formData.firstName);
      }
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
      // Don't fail the form submission if email fails
    }

    return NextResponse.json(
      { 
        message: 'Form submitted successfully',
        submissionId: submission.id
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
} 