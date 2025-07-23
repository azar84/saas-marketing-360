import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/forms - Get all forms or a single form by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single form by ID
      const form = await prisma.form.findUnique({
        where: { id: parseInt(id) },
        include: {
          fields: {
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: { submissions: true }
          }
        }
      });

      if (!form) {
        return NextResponse.json(
          { error: 'Form not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(form);
    } else {
      // Fetch all forms
      const forms = await prisma.form.findMany({
        include: {
          fields: {
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(forms);
    }
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST /api/admin/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, title, subheading, successMessage, errorMessage, fields,
      ctaText, ctaIcon, ctaStyle, ctaSize, ctaWidth, ctaLoadingText, ctaPosition,
      ctaBackgroundColor, ctaTextColor, ctaBorderColor, ctaHoverBackgroundColor, ctaHoverTextColor,
      redirectUrl, emailNotification, emailRecipients, 
      dynamicEmailRecipients, emailFieldRecipients, sendToSubmitterEmail, submitterEmailField,
      adminEmailSubject, adminEmailTemplate, submitterEmailSubject, submitterEmailTemplate,
      webhookUrl, newsletterAction, newsletterEmailField,
      enableCaptcha, captchaType, captchaDifficulty,
      showContactInfo, contactPosition, contactPhone, contactEmail, contactAddress,
      socialFacebook, socialTwitter, socialLinkedin, socialInstagram, socialYoutube,
      contactHeading, contactSubheading, contactPhoneLabel, contactEmailLabel, contactAddressLabel, contactSocialLabel,
      formBackgroundColor, formBorderColor, formTextColor,
      fieldBackgroundColor, fieldBorderColor, fieldTextColor, sectionBackgroundColor
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create form
    const form = await prisma.form.create({
      data: {
        name,
        title,
        subheading,
        successMessage: successMessage || "Thank you! Your message has been sent successfully.",
        errorMessage: errorMessage || "Sorry, there was an error. Please try again.",
        ctaText: ctaText || "Send Message",
        ctaIcon: ctaIcon || null,
        ctaStyle: ctaStyle || "primary",
        ctaSize: ctaSize || "large",
        ctaWidth: ctaWidth || "auto",
        ctaLoadingText: ctaLoadingText || "Sending...",
        ctaBackgroundColor: ctaBackgroundColor || null,
        ctaTextColor: ctaTextColor || null,
        ctaBorderColor: ctaBorderColor || null,
        ctaHoverBackgroundColor: ctaHoverBackgroundColor || null,
        ctaHoverTextColor: ctaHoverTextColor || null,
        redirectUrl: redirectUrl || null,
        emailNotification: emailNotification || false,
        emailRecipients: emailRecipients || null,
        dynamicEmailRecipients: dynamicEmailRecipients || false,
        emailFieldRecipients: emailFieldRecipients || null,
        sendToSubmitterEmail: sendToSubmitterEmail || false,
        submitterEmailField: submitterEmailField || null,
        adminEmailSubject: adminEmailSubject || "New Form Submission",
        adminEmailTemplate: adminEmailTemplate || "You have received a new form submission.\n\n{{FORM_DATA}}\n\nSubmitted at: {{SUBMITTED_AT}}",
        submitterEmailSubject: submitterEmailSubject || "Thank you for your submission",
        submitterEmailTemplate: submitterEmailTemplate || "Dear {{SUBMITTER_NAME}},\n\nThank you for contacting us! We have received your message and will get back to you soon.\n\nBest regards,\nThe Team",
        webhookUrl: webhookUrl || null,
        newsletterAction: newsletterAction || false,
        newsletterEmailField: newsletterEmailField || null,
        enableCaptcha: enableCaptcha !== undefined ? enableCaptcha : true,
        captchaType: captchaType || "math",
        captchaDifficulty: captchaDifficulty || "medium",
        showContactInfo: showContactInfo || false,
        contactPosition: contactPosition || "right",
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        contactAddress: contactAddress || null,
        socialFacebook: socialFacebook || null,
        socialTwitter: socialTwitter || null,
        socialLinkedin: socialLinkedin || null,
        socialInstagram: socialInstagram || null,
        socialYoutube: socialYoutube || null,
        contactHeading: contactHeading || "Get in Touch",
        contactSubheading: contactSubheading || "We'd love to hear from you. Here's how you can reach us.",
        contactPhoneLabel: contactPhoneLabel || "Phone",
        contactEmailLabel: contactEmailLabel || "Email",
        contactAddressLabel: contactAddressLabel || "Address",
        contactSocialLabel: contactSocialLabel || "Follow Us",
        formBackgroundColor: formBackgroundColor || null,
        formBorderColor: formBorderColor || null,
        formTextColor: formTextColor || null,
        fieldBackgroundColor: fieldBackgroundColor || null,
        fieldBorderColor: fieldBorderColor || null,
        fieldTextColor: fieldTextColor || null,
        sectionBackgroundColor: sectionBackgroundColor || null,
        fields: {
          create: fields?.map((field: any, index: number) => ({
            fieldType: field.fieldType,
            fieldName: field.fieldName,
            label: field.label,
            placeholder: field.placeholder,
            helpText: field.helpText,
            isRequired: field.isRequired || false,
            fieldWidth: field.fieldWidth || 'full',
            fieldOptions: field.fieldOptions ? 
              (typeof field.fieldOptions === 'string' ? field.fieldOptions : JSON.stringify(field.fieldOptions)) : null,
            sortOrder: index
          })) || []
        }
      },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/forms - Update a form
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, name, title, subheading, successMessage, errorMessage, fields,
      ctaText, ctaIcon, ctaStyle, ctaSize, ctaWidth, ctaLoadingText, ctaPosition,
      ctaBackgroundColor, ctaTextColor, ctaBorderColor, ctaHoverBackgroundColor, ctaHoverTextColor,
      redirectUrl, emailNotification, emailRecipients,
      dynamicEmailRecipients, emailFieldRecipients, sendToSubmitterEmail, submitterEmailField,
      adminEmailSubject, adminEmailTemplate, submitterEmailSubject, submitterEmailTemplate,
      webhookUrl, newsletterAction, newsletterEmailField,
      enableCaptcha, captchaType, captchaDifficulty,
      showContactInfo, contactPosition, contactPhone, contactEmail, contactAddress,
      socialFacebook, socialTwitter, socialLinkedin, socialInstagram, socialYoutube,
      contactHeading, contactSubheading, contactPhoneLabel, contactEmailLabel, contactAddressLabel, contactSocialLabel,
      formBackgroundColor, formBorderColor, formTextColor,
      fieldBackgroundColor, fieldBorderColor, fieldTextColor, sectionBackgroundColor
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Update form
    const form = await prisma.form.update({
      where: { id: parseInt(id) },
      data: {
        name,
        title,
        subheading,
        successMessage,
        errorMessage,
        ctaText,
        ctaIcon,
        ctaStyle,
        ctaSize,
        ctaWidth,
        ctaLoadingText,
        ctaBackgroundColor,
        ctaTextColor,
        ctaBorderColor,
        ctaHoverBackgroundColor,
        ctaHoverTextColor,
        redirectUrl,
        emailNotification,
        emailRecipients,
        dynamicEmailRecipients,
        emailFieldRecipients,
        sendToSubmitterEmail,
        submitterEmailField,
        adminEmailSubject,
        adminEmailTemplate,
        submitterEmailSubject,
        submitterEmailTemplate,
        webhookUrl,
        newsletterAction,
        newsletterEmailField,
        enableCaptcha,
        captchaType,
        captchaDifficulty,
        showContactInfo,
        contactPosition,
        contactPhone,
        contactEmail,
        contactAddress,
        socialFacebook,
        socialTwitter,
        socialLinkedin,
        socialInstagram,
        socialYoutube,
        contactHeading,
        contactSubheading,
        contactPhoneLabel,
        contactEmailLabel,
        contactAddressLabel,
        contactSocialLabel,
        formBackgroundColor,
        formBorderColor,
        formTextColor,
        fieldBackgroundColor,
        fieldBorderColor,
        fieldTextColor,
        sectionBackgroundColor,
        fields: {
          deleteMany: {},
          create: fields?.map((field: any, index: number) => ({
            fieldType: field.fieldType,
            fieldName: field.fieldName,
            label: field.label,
            placeholder: field.placeholder,
            helpText: field.helpText,
            isRequired: field.isRequired || false,
            fieldWidth: field.fieldWidth || 'full',
            fieldOptions: field.fieldOptions ? 
              (typeof field.fieldOptions === 'string' ? field.fieldOptions : JSON.stringify(field.fieldOptions)) : null,
            sortOrder: index
          })) || []
        }
      },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/forms - Delete a form
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    await prisma.form.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
} 