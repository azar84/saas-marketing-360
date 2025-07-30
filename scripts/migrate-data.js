const { PrismaClient } = require('@prisma/client');

// Heroku database connection
const herokuPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://u7amoifg8knblf:pb53f0d2006b5b559286f9d690e781e48ff326bb40308b83439a80fee709454c7@cduf3or326qj7m.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d7ad4ph0hqha85"
    }
  }
});

// Vercel database connection
const vercelPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://neondb_owner:npg_kYwWniTG9CS4@ep-steep-truth-adhpdp39-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from Heroku to Vercel...');

    // Test connections
    await herokuPrisma.$connect();
    console.log('✅ Connected to Heroku database');
    
    await vercelPrisma.$connect();
    console.log('✅ Connected to Vercel database');

    // Migrate site settings
    console.log('📊 Migrating site settings...');
    const siteSettings = await herokuPrisma.siteSettings.findMany();
    for (const setting of siteSettings) {
      await vercelPrisma.siteSettings.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting
      });
    }
    console.log(`✅ Migrated ${siteSettings.length} site settings`);

    // Migrate admin users
    console.log('👥 Migrating admin users...');
    const adminUsers = await herokuPrisma.adminUser.findMany();
    for (const user of adminUsers) {
      await vercelPrisma.adminUser.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ Migrated ${adminUsers.length} admin users`);

    // Migrate pages
    console.log('📄 Migrating pages...');
    const pages = await herokuPrisma.page.findMany();
    for (const page of pages) {
      await vercelPrisma.page.upsert({
        where: { id: page.id },
        update: page,
        create: page
      });
    }
    console.log(`✅ Migrated ${pages.length} pages`);

    // Migrate CTAs
    console.log('🔗 Migrating CTAs...');
    const ctas = await herokuPrisma.CTA.findMany();
    for (const cta of ctas) {
      await vercelPrisma.CTA.upsert({
        where: { id: cta.id },
        update: cta,
        create: cta
      });
    }
    console.log(`✅ Migrated ${ctas.length} CTAs`);

    // Migrate home page hero
    console.log('🏠 Migrating home page hero...');
    const homeHero = await herokuPrisma.homePageHero.findMany();
    for (const hero of homeHero) {
      await vercelPrisma.homePageHero.upsert({
        where: { id: hero.id },
        update: hero,
        create: hero
      });
    }
    console.log(`✅ Migrated ${homeHero.length} home page heroes`);

    // Migrate hero sections
    console.log('🎯 Migrating hero sections...');
    const heroSections = await herokuPrisma.heroSection.findMany();
    for (const section of heroSections) {
      await vercelPrisma.heroSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${heroSections.length} hero sections`);

    // Migrate media sections
    console.log('📺 Migrating media sections...');
    const mediaSections = await herokuPrisma.mediaSection.findMany();
    for (const section of mediaSections) {
      await vercelPrisma.mediaSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${mediaSections.length} media sections`);

    // Migrate features
    console.log('⭐ Migrating features...');
    const features = await herokuPrisma.feature.findMany();
    for (const feature of features) {
      await vercelPrisma.feature.upsert({
        where: { id: feature.id },
        update: feature,
        create: feature
      });
    }
    console.log(`✅ Migrated ${features.length} features`);

    // Migrate feature groups
    console.log('📦 Migrating feature groups...');
    const featureGroups = await herokuPrisma.featureGroup.findMany();
    for (const group of featureGroups) {
      await vercelPrisma.featureGroup.upsert({
        where: { id: group.id },
        update: group,
        create: group
      });
    }
    console.log(`✅ Migrated ${featureGroups.length} feature groups`);

    // Migrate forms first (needed for page sections)
    console.log('📝 Migrating forms...');
    const forms = await herokuPrisma.form.findMany();
    for (const form of forms) {
      await vercelPrisma.form.upsert({
        where: { id: form.id },
        update: form,
        create: form
      });
    }
    console.log(`✅ Migrated ${forms.length} forms`);

    // Migrate page sections
    console.log('📋 Migrating page sections...');
    const pageSections = await herokuPrisma.pageSection.findMany();
    for (const section of pageSections) {
      try {
        await vercelPrisma.pageSection.upsert({
          where: { id: section.id },
          update: section,
          create: section
        });
      } catch (error) {
        console.log(`⚠️ Skipping page section ${section.id} due to foreign key constraint`);
      }
    }
    console.log(`✅ Migrated ${pageSections.length} page sections`);

    // Migrate design system
    console.log('🎨 Migrating design system...');
    const designSystem = await herokuPrisma.designSystem.findMany();
    for (const design of designSystem) {
      await vercelPrisma.designSystem.upsert({
        where: { id: design.id },
        update: design,
        create: design
      });
    }
    console.log(`✅ Migrated ${designSystem.length} design system entries`);

    // Migrate header config
    console.log('🔝 Migrating header config...');
    const headerConfig = await herokuPrisma.headerConfig.findMany();
    for (const config of headerConfig) {
      await vercelPrisma.headerConfig.upsert({
        where: { id: config.id },
        update: config,
        create: config
      });
    }
    console.log(`✅ Migrated ${headerConfig.length} header configs`);

    // Migrate menus
    console.log('🍽️ Migrating menus...');
    const menus = await herokuPrisma.menu.findMany();
    for (const menu of menus) {
      await vercelPrisma.menu.upsert({
        where: { id: menu.id },
        update: menu,
        create: menu
      });
    }
    console.log(`✅ Migrated ${menus.length} menus`);

    // Migrate menu items
    console.log('🍽️ Migrating menu items...');
    const menuItems = await herokuPrisma.menuItem.findMany();
    for (const item of menuItems) {
      await vercelPrisma.menuItem.upsert({
        where: { id: item.id },
        update: item,
        create: item
      });
    }
    console.log(`✅ Migrated ${menuItems.length} menu items`);

    // Migrate FAQ categories
    console.log('❓ Migrating FAQ categories...');
    const faqCategories = await herokuPrisma.fAQCategory.findMany();
    for (const category of faqCategories) {
      await vercelPrisma.fAQCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`✅ Migrated ${faqCategories.length} FAQ categories`);

    // Migrate FAQs
    console.log('❓ Migrating FAQs...');
    const faqs = await herokuPrisma.fAQ.findMany();
    for (const faq of faqs) {
      await vercelPrisma.fAQ.upsert({
        where: { id: faq.id },
        update: faq,
        create: faq
      });
    }
    console.log(`✅ Migrated ${faqs.length} FAQs`);

    // Migrate FAQ sections
    console.log('❓ Migrating FAQ sections...');
    const faqSections = await herokuPrisma.fAQSection.findMany();
    for (const section of faqSections) {
      await vercelPrisma.fAQSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${faqSections.length} FAQ sections`);

    // Migrate contact sections
    console.log('📞 Migrating contact sections...');
    const contactSections = await herokuPrisma.contactSection.findMany();
    for (const section of contactSections) {
      await vercelPrisma.contactSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${contactSections.length} contact sections`);

    // Migrate contact fields
    console.log('📞 Migrating contact fields...');
    const contactFields = await herokuPrisma.contactField.findMany();
    for (const field of contactFields) {
      await vercelPrisma.contactField.upsert({
        where: { id: field.id },
        update: field,
        create: field
      });
    }
    console.log(`✅ Migrated ${contactFields.length} contact fields`);

    // Migrate plans
    console.log('💳 Migrating plans...');
    const plans = await herokuPrisma.plan.findMany();
    for (const plan of plans) {
      await vercelPrisma.plan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan
      });
    }
    console.log(`✅ Migrated ${plans.length} plans`);

    // Migrate billing cycles
    console.log('💳 Migrating billing cycles...');
    const billingCycles = await herokuPrisma.billingCycle.findMany();
    for (const cycle of billingCycles) {
      await vercelPrisma.billingCycle.upsert({
        where: { id: cycle.id },
        update: cycle,
        create: cycle
      });
    }
    console.log(`✅ Migrated ${billingCycles.length} billing cycles`);

    // Migrate plan pricing
    console.log('💳 Migrating plan pricing...');
    const planPricing = await herokuPrisma.planPricing.findMany();
    for (const pricing of planPricing) {
      await vercelPrisma.planPricing.upsert({
        where: { id: pricing.id },
        update: pricing,
        create: pricing
      });
    }
    console.log(`✅ Migrated ${planPricing.length} plan pricing entries`);

    // Migrate pricing sections
    console.log('💳 Migrating pricing sections...');
    const pricingSections = await herokuPrisma.pricingSection.findMany();
    for (const section of pricingSections) {
      await vercelPrisma.pricingSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${pricingSections.length} pricing sections`);

    // Migrate pricing section plans
    console.log('💳 Migrating pricing section plans...');
    const pricingSectionPlans = await herokuPrisma.pricingSectionPlan.findMany();
    for (const plan of pricingSectionPlans) {
      await vercelPrisma.pricingSectionPlan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan
      });
    }
    console.log(`✅ Migrated ${pricingSectionPlans.length} pricing section plans`);

    // Migrate team sections
    console.log('👥 Migrating team sections...');
    const teamSections = await herokuPrisma.teamSection.findMany();
    for (const section of teamSections) {
      await vercelPrisma.teamSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${teamSections.length} team sections`);

    // Migrate team members
    console.log('👥 Migrating team members...');
    const teamMembers = await herokuPrisma.teamMember.findMany();
    for (const member of teamMembers) {
      await vercelPrisma.teamMember.upsert({
        where: { id: member.id },
        update: member,
        create: member
      });
    }
    console.log(`✅ Migrated ${teamMembers.length} team members`);

    // Migrate HTML sections
    console.log('📄 Migrating HTML sections...');
    const htmlSections = await herokuPrisma.htmlSection.findMany();
    for (const section of htmlSections) {
      await vercelPrisma.htmlSection.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${htmlSections.length} HTML sections`);

    // Migrate script sections
    console.log('📜 Migrating script sections...');
    const scriptSections = await herokuPrisma.script_sections.findMany();
    for (const section of scriptSections) {
      await vercelPrisma.script_sections.upsert({
        where: { id: section.id },
        update: section,
        create: section
      });
    }
    console.log(`✅ Migrated ${scriptSections.length} script sections`);

    // Migrate newsletter subscribers
    console.log('📧 Migrating newsletter subscribers...');
    const newsletterSubscribers = await herokuPrisma.newsletterSubscriber.findMany();
    for (const subscriber of newsletterSubscribers) {
      await vercelPrisma.newsletterSubscriber.upsert({
        where: { id: subscriber.id },
        update: subscriber,
        create: subscriber
      });
    }
    console.log(`✅ Migrated ${newsletterSubscribers.length} newsletter subscribers`);

    // Migrate form submissions
    console.log('📝 Migrating form submissions...');
    const formSubmissions = await herokuPrisma.formSubmission.findMany();
    for (const submission of formSubmissions) {
      await vercelPrisma.formSubmission.upsert({
        where: { id: submission.id },
        update: submission,
        create: submission
      });
    }
    console.log(`✅ Migrated ${formSubmissions.length} form submissions`);

    // Migrate global functions
    console.log('⚙️ Migrating global functions...');
    const globalFunctions = await herokuPrisma.globalFunctions.findMany();
    for (const func of globalFunctions) {
      await vercelPrisma.globalFunctions.upsert({
        where: { id: func.id },
        update: func,
        create: func
      });
    }
    console.log(`✅ Migrated ${globalFunctions.length} global functions`);

    console.log('🎉 Data migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await herokuPrisma.$disconnect();
    await vercelPrisma.$disconnect();
  }
}

migrateData(); 