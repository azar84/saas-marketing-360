const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data for new company schema...');

    // Get a technology industry for testing
    const techIndustry = await prisma.industry.findFirst({
      where: { code: 'TECH' }
    });

    if (!techIndustry) {
      console.log('❌ No TECH industry found. Please run the industries upload script first.');
      return;
    }

    // Sample company 1: Tech Startup
    const company1 = await prisma.company.create({
      data: {
        name: 'InnovaTech Solutions',
        website: 'https://innovatech.example.com',
        baseUrl: 'innovatech.example.com',
        description: 'A cutting-edge technology company specializing in AI and machine learning solutions.',
        slug: createSlug('InnovaTech Solutions'),
        isActive: true
      }
    });

    console.log(`✅ Created company: ${company1.name} (ID: ${company1.id})`);

    // Add address for company 1
    await prisma.companyAddress.create({
      data: {
        companyId: company1.id,
        type: 'HQ',
        fullAddress: '123 Tech Street, Suite 500, San Francisco, CA 94105, USA',
        streetAddress: '123 Tech Street',
        addressLine2: 'Suite 500',
        city: 'San Francisco',
        stateProvince: 'CA',
        country: 'USA',
        zipPostalCode: '94105',
        latitude: 37.7749,
        longitude: -122.4194,
        isPrimary: true
      }
    });

    // Add contacts for company 1
    await prisma.companyContact.createMany({
      data: [
        {
          companyId: company1.id,
          type: 'email',
          label: 'Primary',
          value: 'contact@innovatech.example.com',
          isPrimary: true,
          isActive: true
        },
        {
          companyId: company1.id,
          type: 'phone',
          label: 'Main Office',
          value: '+1-415-555-0123',
          isPrimary: true,
          isActive: true
        },
        {
          companyId: company1.id,
          type: 'form',
          label: 'Contact Form',
          value: 'https://innovatech.example.com/contact',
          contactPage: 'https://innovatech.example.com/contact',
          isPrimary: false,
          isActive: true
        }
      ]
    });

    // Add social media for company 1
    await prisma.companySocial.createMany({
      data: [
        {
          companyId: company1.id,
          platform: 'linkedin',
          url: 'https://linkedin.com/company/innovatech-solutions',
          handle: 'innovatech-solutions',
          isVerified: false
        },
        {
          companyId: company1.id,
          platform: 'twitter',
          url: 'https://twitter.com/innovatech',
          handle: '@innovatech',
          isVerified: false
        },
        {
          companyId: company1.id,
          platform: 'github',
          url: 'https://github.com/innovatech',
          handle: 'innovatech',
          isVerified: false
        }
      ]
    });

    // Add technologies for company 1
    await prisma.companyTechnology.createMany({
      data: [
        {
          companyId: company1.id,
          category: 'frontend',
          name: 'React',
          version: '18.2.0',
          firstDetected: new Date('2023-01-15'),
          lastDetected: new Date(),
          isActive: true
        },
        {
          companyId: company1.id,
          category: 'backend',
          name: 'Node.js',
          version: '18.x',
          firstDetected: new Date('2023-01-15'),
          lastDetected: new Date(),
          isActive: true
        },
        {
          companyId: company1.id,
          category: 'database',
          name: 'PostgreSQL',
          version: '15',
          firstDetected: new Date('2023-01-15'),
          lastDetected: new Date(),
          isActive: true
        },
        {
          companyId: company1.id,
          category: 'hosting',
          name: 'AWS',
          firstDetected: new Date('2023-01-15'),
          lastDetected: new Date(),
          isActive: true
        }
      ]
    });

    // Add services for company 1
    await prisma.companyService.createMany({
      data: [
        {
          companyId: company1.id,
          name: 'AI Consulting',
          description: 'Strategic AI implementation consulting for enterprises',
          category: 'Consulting',
          isPrimary: true
        },
        {
          companyId: company1.id,
          name: 'Machine Learning Development',
          description: 'Custom ML model development and deployment',
          category: 'Development',
          isPrimary: false
        },
        {
          companyId: company1.id,
          name: 'Data Analytics',
          description: 'Advanced data analytics and visualization solutions',
          category: 'Analytics',
          isPrimary: false
        }
      ]
    });

    // Add staff for company 1
    await prisma.companyStaff.createMany({
      data: [
        {
          companyId: company1.id,
          firstName: 'John',
          lastName: 'Smith',
          title: 'CEO & Founder',
          department: 'Executive',
          email: 'john.smith@innovatech.example.com',
          phone: '+1-415-555-0124',
          linkedinUrl: 'https://linkedin.com/in/johnsmith-ceo',
          isPrimary: true,
          isActive: true
        },
        {
          companyId: company1.id,
          firstName: 'Sarah',
          lastName: 'Johnson',
          title: 'CTO',
          department: 'Engineering',
          email: 'sarah.johnson@innovatech.example.com',
          linkedinUrl: 'https://linkedin.com/in/sarahjohnson-cto',
          isPrimary: false,
          isActive: true
        }
      ]
    });

    // Add industry relation for company 1
    await prisma.companyIndustryRelation.create({
      data: {
        companyId: company1.id,
        industryId: techIndustry.id,
        isPrimary: true
      }
    });

    // Add business intelligence for company 1
    await prisma.companyIntelligence.create({
      data: {
        companyId: company1.id,
        businessModel: 'B2B SaaS',
        growthStage: 'Series A',
        marketPosition: 'Emerging',
        partnerships: {
          strategic: ['Microsoft', 'Google Cloud'],
          technology: ['OpenAI', 'Hugging Face']
        },
        certifications: ['SOC 2', 'ISO 27001'],
        confidenceScore: 0.95,
        analyzedAt: new Date()
      }
    });

    // Add financial data for company 1
    await prisma.companyFinancial.create({
      data: {
        companyId: company1.id,
        fundingStatus: 'Series A',
        revenueModel: 'Subscription',
        profitability: 'Break-even',
        fundingRounds: [
          {
            round: 'Seed',
            amount: '$2M',
            date: '2022-06-15',
            investors: ['TechVentures', 'InnovateFund']
          },
          {
            round: 'Series A',
            amount: '$8M',
            date: '2023-11-20',
            investors: ['GrowthCapital', 'TechVentures', 'AIFund']
          }
        ],
        investors: ['GrowthCapital', 'TechVentures', 'InnovateFund', 'AIFund'],
        boardMembers: [
          { name: 'John Smith', role: 'CEO' },
          { name: 'Michael Chen', role: 'Investor Representative' }
        ],
        advisors: [
          { name: 'Dr. Emily Watson', expertise: 'AI Research' },
          { name: 'Robert Kim', expertise: 'Enterprise Sales' }
        ],
        lastUpdated: new Date()
      }
    });

    // Add hiring data for company 1
    await prisma.companyHiring.create({
      data: {
        companyId: company1.id,
        isHiring: true,
        openPositions: [
          { title: 'Senior ML Engineer', department: 'Engineering', level: 'Senior' },
          { title: 'Product Manager', department: 'Product', level: 'Mid' },
          { title: 'Sales Engineer', department: 'Sales', level: 'Mid' }
        ],
        hiringFocus: ['Engineering', 'Product', 'Sales'],
        benefits: [
          'Competitive salary',
          'Equity package',
          'Health insurance',
          'Remote work options',
          'Learning stipend'
        ],
        companyCulture: 'Fast-paced startup environment with focus on innovation and collaboration',
        lastUpdated: new Date()
      }
    });

    // Add sample URLs for company 1
    await prisma.companyUrl.createMany({
      data: [
        {
          companyId: company1.id,
          url: 'https://innovatech.example.com',
          path: '/',
          title: 'InnovaTech Solutions - AI & Machine Learning Experts',
          description: 'Leading AI and machine learning solutions for enterprises',
          status: 'scraped',
          statusCode: 200,
          contentType: 'text/html',
          contentLength: 45678,
          isInternal: true,
          depth: 0,
          lastScraped: new Date(),
          scrapedCount: 1
        },
        {
          companyId: company1.id,
          url: 'https://innovatech.example.com/about',
          path: '/about',
          title: 'About Us - InnovaTech Solutions',
          description: 'Learn about our team and mission',
          status: 'scraped',
          statusCode: 200,
          contentType: 'text/html',
          contentLength: 32456,
          isInternal: true,
          depth: 1,
          lastScraped: new Date(),
          scrapedCount: 1
        },
        {
          companyId: company1.id,
          url: 'https://innovatech.example.com/services',
          path: '/services',
          title: 'Our Services - AI Consulting & ML Development',
          description: 'Comprehensive AI and machine learning services',
          status: 'scraped',
          statusCode: 200,
          contentType: 'text/html',
          contentLength: 28934,
          isInternal: true,
          depth: 1,
          lastScraped: new Date(),
          scrapedCount: 1
        },
        {
          companyId: company1.id,
          url: 'https://innovatech.example.com/contact',
          path: '/contact',
          title: 'Contact InnovaTech Solutions',
          status: 'discovered',
          isInternal: true,
          depth: 1
        },
        {
          companyId: company1.id,
          url: 'https://innovatech.example.com/blog/ai-trends-2024.pdf',
          path: '/blog/ai-trends-2024.pdf',
          title: 'AI Trends 2024 Whitepaper',
          status: 'discovered',
          contentType: 'application/pdf',
          isInternal: true,
          depth: 2
        }
      ]
    });

    // Add enrichment record for company 1
    await prisma.companyEnrichment.create({
      data: {
        companyId: company1.id,
        source: 'manual',
        mode: 'comprehensive',
        pagesScraped: 3, // Updated to match scraped URLs
        totalPagesFound: 5, // Updated to match total URLs
        rawData: {
          source: 'test_data',
          created_by: 'test_script',
          confidence: 1.0
        },
        scrapedAt: new Date(),
        processedAt: new Date()
      }
    });

    console.log('  📍 Added address');
    console.log('  📞 Added 3 contacts');
    console.log('  🌐 Added 3 social media links');
    console.log('  💻 Added 4 technologies');
    console.log('  🔧 Added 3 services');
    console.log('  👥 Added 2 staff members');
    console.log('  🏭 Added industry relation');
    console.log('  🧠 Added business intelligence');
    console.log('  💰 Added financial data');
    console.log('  📋 Added hiring data');
    console.log('  🔗 Added 5 URLs (3 scraped, 2 discovered)');
    console.log('  📊 Added enrichment metadata');

    // Sample company 2: Simpler structure
    const company2 = await prisma.company.create({
      data: {
        name: 'Local Bakery Co',
        website: 'https://localbakery.example.com',
        baseUrl: 'localbakery.example.com',
        description: 'Family-owned bakery serving fresh bread and pastries since 1985.',
        slug: createSlug('Local Bakery Co'),
        isActive: true
      }
    });

    console.log(`✅ Created company: ${company2.name} (ID: ${company2.id})`);

    // Add basic contact for company 2
    await prisma.companyContact.create({
      data: {
        companyId: company2.id,
        type: 'email',
        label: 'Primary',
        value: 'info@localbakery.example.com',
        isPrimary: true,
        isActive: true
      }
    });

    // Add enrichment record for company 2
    await prisma.companyEnrichment.create({
      data: {
        companyId: company2.id,
        source: 'manual',
        mode: 'basic',
        pagesScraped: 3,
        totalPagesFound: 5,
        rawData: {
          source: 'test_data',
          created_by: 'test_script',
          confidence: 0.8
        },
        scrapedAt: new Date(),
        processedAt: new Date()
      }
    });

    console.log('  📞 Added 1 contact');
    console.log('  📊 Added enrichment metadata');

    // Verification
    const totalCompanies = await prisma.company.count();
    const totalAddresses = await prisma.companyAddress.count();
    const totalContacts = await prisma.companyContact.count();
    const totalSocials = await prisma.companySocial.count();
    const totalTechnologies = await prisma.companyTechnology.count();
    const totalServices = await prisma.companyService.count();
    const totalStaff = await prisma.companyStaff.count();
    const totalUrls = await prisma.companyUrl.count();
    const totalEnrichments = await prisma.companyEnrichment.count();

    console.log('\n🎉 Sample Data Creation Complete!');
    console.log('\n📊 Summary:');
    console.log(`  Companies: ${totalCompanies}`);
    console.log(`  Addresses: ${totalAddresses}`);
    console.log(`  Contacts: ${totalContacts}`);
    console.log(`  Social Media: ${totalSocials}`);
    console.log(`  Technologies: ${totalTechnologies}`);
    console.log(`  Services: ${totalServices}`);
    console.log(`  Staff: ${totalStaff}`);
    console.log(`  URLs: ${totalUrls}`);
    console.log(`  Enrichments: ${totalEnrichments}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createSampleData();
}

module.exports = { createSampleData };
