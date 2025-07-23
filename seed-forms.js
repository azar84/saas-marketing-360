const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedForms() {
  try {
    console.log('🌱 Seeding forms...');

    // Create a contact form
    const contactForm = await prisma.form.create({
      data: {
        name: 'Contact Form',
        title: 'Get In Touch',
        subheading: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
        successMessage: 'Thank you for your message! We\'ll get back to you within 24 hours.',
        errorMessage: 'Sorry, there was an error sending your message. Please try again.',
        ctaText: 'Send Message',
        ctaIcon: 'send',
        ctaStyle: 'primary',
        ctaSize: 'large',
        ctaWidth: 'auto',
        ctaLoadingText: 'Sending...',
        enableCaptcha: true,
        captchaType: 'math',
        captchaDifficulty: 'medium',
        fields: {
          create: [
            {
              fieldType: 'first_name',
              fieldName: 'first_name',
              label: 'First Name',
              placeholder: 'Enter your first name...',
              isRequired: true,
              fieldWidth: 'half',
              sortOrder: 0
            },
            {
              fieldType: 'last_name',
              fieldName: 'last_name',
              label: 'Last Name',
              placeholder: 'Enter your last name...',
              isRequired: true,
              fieldWidth: 'half',
              sortOrder: 1
            },
            {
              fieldType: 'email',
              fieldName: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address...',
              isRequired: true,
              fieldWidth: 'full',
              sortOrder: 2
            },
            {
              fieldType: 'company',
              fieldName: 'company',
              label: 'Company',
              placeholder: 'Enter your company name...',
              isRequired: false,
              fieldWidth: 'full',
              sortOrder: 3
            },
            {
              fieldType: 'tel',
              fieldName: 'phone',
              label: 'Phone Number',
              placeholder: 'Enter your phone number...',
              isRequired: false,
              fieldWidth: 'full',
              sortOrder: 4
            },
            {
              fieldType: 'textarea',
              fieldName: 'message',
              label: 'Message',
              placeholder: 'Tell us about your project or inquiry...',
              helpText: 'Please provide as much detail as possible.',
              isRequired: true,
              fieldWidth: 'full',
              sortOrder: 5
            }
          ]
        }
      }
    });

    // Create a lead capture form
    const leadForm = await prisma.form.create({
      data: {
        name: 'Lead Capture',
        title: 'Get Started Today',
        subheading: 'Join thousands of satisfied customers. Start your free trial now.',
        successMessage: 'Thank you for signing up! Check your email for next steps.',
        errorMessage: 'Sorry, there was an error processing your request. Please try again.',
        ctaText: 'Start Free Trial',
        ctaIcon: 'rocket',
        ctaStyle: 'primary',
        ctaSize: 'large',
        ctaWidth: 'full',
        ctaLoadingText: 'Creating Account...',
        enableCaptcha: true,
        captchaType: 'puzzle',
        captchaDifficulty: 'easy',
        fields: {
          create: [
            {
              fieldType: 'first_name',
              fieldName: 'first_name',
              label: 'First Name',
              placeholder: 'Enter your first name...',
              isRequired: true,
              fieldWidth: 'half',
              sortOrder: 0
            },
            {
              fieldType: 'last_name',
              fieldName: 'last_name',
              label: 'Last Name',
              placeholder: 'Enter your last name...',
              isRequired: true,
              fieldWidth: 'half',
              sortOrder: 1
            },
            {
              fieldType: 'email',
              fieldName: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address...',
              isRequired: true,
              fieldWidth: 'full',
              sortOrder: 2
            },
            {
              fieldType: 'company',
              fieldName: 'company',
              label: 'Company',
              placeholder: 'Enter your company name...',
              isRequired: false,
              fieldWidth: 'full',
              sortOrder: 3
            },
            {
              fieldType: 'select',
              fieldName: 'plan',
              label: 'Plan Type',
              placeholder: 'Select a plan...',
              isRequired: true,
              fieldWidth: 'full',
              fieldOptions: JSON.stringify(['Starter', 'Professional', 'Enterprise']),
              sortOrder: 4
            },
            {
              fieldType: 'checkbox',
              fieldName: 'newsletter',
              label: 'Subscribe to our newsletter',
              isRequired: false,
              fieldWidth: 'full',
              sortOrder: 5
            }
          ]
        }
      }
    });

    // Create a feedback form
    const feedbackForm = await prisma.form.create({
      data: {
        name: 'Feedback Form',
        title: 'We Value Your Feedback',
        subheading: 'Help us improve by sharing your thoughts and suggestions.',
        successMessage: 'Thank you for your feedback! We appreciate your input.',
        errorMessage: 'Sorry, there was an error submitting your feedback. Please try again.',
        ctaText: 'Submit Feedback',
        ctaIcon: 'message-circle',
        ctaStyle: 'secondary',
        ctaSize: 'medium',
        ctaWidth: 'auto',
        ctaLoadingText: 'Submitting...',
        enableCaptcha: false,
        captchaType: 'drag',
        captchaDifficulty: 'hard',
        fields: {
          create: [
            {
              fieldType: 'text',
              fieldName: 'name',
              label: 'Your Name',
              placeholder: 'Enter your name...',
              isRequired: false,
              fieldWidth: 'full',
              sortOrder: 0
            },
            {
              fieldType: 'email',
              fieldName: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address...',
              isRequired: false,
              fieldWidth: 'full',
              sortOrder: 1
            },
            {
              fieldType: 'select',
              fieldName: 'category',
              label: 'Feedback Category',
              placeholder: 'Select a category...',
              isRequired: true,
              fieldWidth: 'full',
              fieldOptions: JSON.stringify(['General', 'Bug Report', 'Feature Request', 'Pricing', 'Support']),
              sortOrder: 2
            },
            {
              fieldType: 'radio',
              fieldName: 'rating',
              label: 'Overall Rating',
              isRequired: true,
              fieldWidth: 'full',
              fieldOptions: JSON.stringify(['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']),
              sortOrder: 3
            },
            {
              fieldType: 'textarea',
              fieldName: 'feedback',
              label: 'Your Feedback',
              placeholder: 'Please share your detailed feedback...',
              helpText: 'Be as specific as possible to help us improve.',
              isRequired: true,
              fieldWidth: 'full',
              sortOrder: 4
            }
          ]
        }
      }
    });

    console.log('✅ Forms seeded successfully!');
    console.log(`Created ${contactForm.id} forms:`);
    console.log('- Contact Form');
    console.log('- Lead Capture Form');
    console.log('- Feedback Form');

  } catch (error) {
    console.error('❌ Error seeding forms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedForms(); 