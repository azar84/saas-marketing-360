const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function exportAllData() {
  try {
    console.log('🚀 Starting SQLite data export...');
    
    const exportDir = path.join(process.cwd(), 'backups', 'postgresql-migration');
    await fs.mkdir(exportDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFile = path.join(exportDir, `sqlite-export-${timestamp}.json`);
    
    // Get all table names from Prisma schema
    const tables = [
      'SiteSettings',

      'DesignSystem',
      'Page',
      'HeroSection',
      'MediaSection',
      'MediaSectionFeature',
      'HeaderNavItem',
      'HeaderConfig',
      'CTA',
      'GlobalFunctions',
      'HeaderCTA',
      'HomePageHero',
      'TrustIndicator',
      'GlobalFeature',
      'FeatureGroup',
      'FeatureGroupItem',
      'PageFeatureGroup',
      'PageSection',
      'SectionTemplate',
      'Testimonial',
      'FAQCategory',
      'FAQ',
      'FAQSection',
      'FAQSectionCategory',
      'ContactSection',
      'ContactField',
      'ContactEmailSettings',
      'ContactSubmission',
      'Plan',
      'BillingCycle',
      'PlanPricing',
      'PlanFeatureType',
      'PlanFeatureLimit',
      'SharedFeature',
      'PlanFeature',
      'MediaLibrary',
      'MediaFolder',
      'MediaUsage',
      'BasicFeature',
      'PlanBasicFeature',
      'PricingSection',
      'PricingSectionPlan',
      'PagePricingSection',
      'Form',
      'FormField',
      'FormSubmission',
      'HtmlSection',
      'PageHtmlSection',
      'script_sections',
      'NewsletterSubscriber',
      'header_sections',
      'TeamSection',
      'TeamMember',
      'AdminUser',
      'Continent',
      'Country',
      'State',
      'County',
      'City',
      'CityAlternateName',
      'NAICSClassification',
      'NAICSAlias',
      'NAICSChange',
      'CompanyNAICSClassification',
      'Industry',
      'Keyword',
      'BusinessDirectory',
      'BusinessIndustry',
      'ContactPerson'
    ];

    const allData = {};
    let totalRecords = 0;

    for (const table of tables) {
      try {
        console.log(`📊 Exporting ${table}...`);
        
        // Use dynamic property access to get the table
        const tableData = await prisma[table].findMany();
        
        allData[table] = tableData;
        totalRecords += tableData.length;
        
        console.log(`✅ ${table}: ${tableData.length} records`);
      } catch (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
        allData[table] = [];
      }
    }

    // Save the export
    await fs.writeFile(exportFile, JSON.stringify(allData, null, 2));
    
    console.log(`\n🎉 Export completed successfully!`);
    console.log(`📁 Export file: ${exportFile}`);
    console.log(`📊 Total records exported: ${totalRecords}`);
    console.log(`📋 Tables exported: ${Object.keys(allData).length}`);
    
    // Create a summary file
    const summary = {
      exportDate: new Date().toISOString(),
      totalRecords,
      tables: Object.keys(allData).map(table => ({
        name: table,
        recordCount: allData[table].length
      })),
      notes: [
        'This export contains all data from SQLite database',
        'Use this file to restore data in PostgreSQL after migration',
        'Timestamp format: ISO 8601',
        'Data structure matches Prisma schema'
      ]
    };
    
    const summaryFile = path.join(exportDir, `export-summary-${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Summary file: ${summaryFile}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
if (require.main === module) {
  exportAllData()
    .then(() => {
      console.log('✅ Export script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Export script failed:', error);
      process.exit(1);
    });
}

module.exports = { exportAllData };
