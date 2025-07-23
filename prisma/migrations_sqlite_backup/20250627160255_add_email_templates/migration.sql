/*
  Warnings:

  - You are about to drop the column `ctaPosition` on the `forms` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subheading" TEXT,
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you! Your message has been sent successfully.',
    "errorMessage" TEXT NOT NULL DEFAULT 'Sorry, there was an error. Please try again.',
    "ctaText" TEXT NOT NULL DEFAULT 'Send Message',
    "ctaIcon" TEXT,
    "ctaStyle" TEXT NOT NULL DEFAULT 'primary',
    "ctaSize" TEXT NOT NULL DEFAULT 'large',
    "ctaWidth" TEXT NOT NULL DEFAULT 'auto',
    "ctaLoadingText" TEXT NOT NULL DEFAULT 'Sending...',
    "ctaBackgroundColor" TEXT,
    "ctaTextColor" TEXT,
    "ctaBorderColor" TEXT,
    "ctaHoverBackgroundColor" TEXT,
    "ctaHoverTextColor" TEXT,
    "redirectUrl" TEXT,
    "emailNotification" BOOLEAN NOT NULL DEFAULT false,
    "emailRecipients" TEXT,
    "dynamicEmailRecipients" BOOLEAN NOT NULL DEFAULT false,
    "emailFieldRecipients" TEXT,
    "sendToSubmitterEmail" BOOLEAN NOT NULL DEFAULT false,
    "submitterEmailField" TEXT,
    "adminEmailSubject" TEXT NOT NULL DEFAULT 'New Form Submission',
    "adminEmailTemplate" TEXT NOT NULL DEFAULT 'You have received a new form submission.

{{FORM_DATA}}

Submitted at: {{SUBMITTED_AT}}',
    "submitterEmailSubject" TEXT NOT NULL DEFAULT 'Thank you for your submission',
    "submitterEmailTemplate" TEXT NOT NULL DEFAULT 'Dear {{SUBMITTER_NAME}},

Thank you for contacting us! We have received your message and will get back to you soon.

Best regards,
The Team',
    "webhookUrl" TEXT,
    "enableCaptcha" BOOLEAN NOT NULL DEFAULT true,
    "captchaType" TEXT NOT NULL DEFAULT 'math',
    "captchaDifficulty" TEXT NOT NULL DEFAULT 'medium',
    "showContactInfo" BOOLEAN NOT NULL DEFAULT false,
    "contactPosition" TEXT NOT NULL DEFAULT 'right',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "contactAddress" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialLinkedin" TEXT,
    "socialInstagram" TEXT,
    "socialYoutube" TEXT,
    "contactHeading" TEXT NOT NULL DEFAULT 'Get in Touch',
    "contactSubheading" TEXT NOT NULL DEFAULT 'We''d love to hear from you. Here''s how you can reach us.',
    "contactPhoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "contactEmailLabel" TEXT NOT NULL DEFAULT 'Email',
    "contactAddressLabel" TEXT NOT NULL DEFAULT 'Address',
    "contactSocialLabel" TEXT NOT NULL DEFAULT 'Follow Us',
    "formBackgroundColor" TEXT,
    "formBorderColor" TEXT NOT NULL DEFAULT 'transparent',
    "formTextColor" TEXT,
    "fieldBackgroundColor" TEXT,
    "fieldBorderColor" TEXT,
    "fieldTextColor" TEXT,
    "sectionBackgroundColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_forms" ("captchaDifficulty", "captchaType", "contactAddress", "contactAddressLabel", "contactEmail", "contactEmailLabel", "contactHeading", "contactPhone", "contactPhoneLabel", "contactPosition", "contactSocialLabel", "contactSubheading", "createdAt", "ctaBackgroundColor", "ctaBorderColor", "ctaHoverBackgroundColor", "ctaHoverTextColor", "ctaIcon", "ctaLoadingText", "ctaSize", "ctaStyle", "ctaText", "ctaTextColor", "ctaWidth", "dynamicEmailRecipients", "emailFieldRecipients", "emailNotification", "emailRecipients", "enableCaptcha", "errorMessage", "fieldBackgroundColor", "fieldBorderColor", "fieldTextColor", "formBackgroundColor", "formBorderColor", "formTextColor", "id", "isActive", "name", "redirectUrl", "sectionBackgroundColor", "sendToSubmitterEmail", "showContactInfo", "socialFacebook", "socialInstagram", "socialLinkedin", "socialTwitter", "socialYoutube", "subheading", "submitterEmailField", "successMessage", "title", "updatedAt", "webhookUrl") SELECT "captchaDifficulty", "captchaType", "contactAddress", "contactAddressLabel", "contactEmail", "contactEmailLabel", "contactHeading", "contactPhone", "contactPhoneLabel", "contactPosition", "contactSocialLabel", "contactSubheading", "createdAt", "ctaBackgroundColor", "ctaBorderColor", "ctaHoverBackgroundColor", "ctaHoverTextColor", "ctaIcon", "ctaLoadingText", "ctaSize", "ctaStyle", "ctaText", "ctaTextColor", "ctaWidth", "dynamicEmailRecipients", "emailFieldRecipients", "emailNotification", "emailRecipients", "enableCaptcha", "errorMessage", "fieldBackgroundColor", "fieldBorderColor", "fieldTextColor", "formBackgroundColor", coalesce("formBorderColor", 'transparent') AS "formBorderColor", "formTextColor", "id", "isActive", "name", "redirectUrl", "sectionBackgroundColor", "sendToSubmitterEmail", "showContactInfo", "socialFacebook", "socialInstagram", "socialLinkedin", "socialTwitter", "socialYoutube", "subheading", "submitterEmailField", "successMessage", "title", "updatedAt", "webhookUrl" FROM "forms";
DROP TABLE "forms";
ALTER TABLE "new_forms" RENAME TO "forms";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
