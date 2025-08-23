const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryCompanyUrls() {
  try {
    console.log('🔗 Company URLs Analysis\n');

    // Get URL statistics
    const totalUrls = await prisma.companyUrl.count();
    const scrapedUrls = await prisma.companyUrl.count({ where: { status: 'scraped' } });
    const discoveredUrls = await prisma.companyUrl.count({ where: { status: 'discovered' } });
    const failedUrls = await prisma.companyUrl.count({ where: { status: 'failed' } });

    console.log('📊 URL Statistics:');
    console.log(`  Total URLs: ${totalUrls}`);
    console.log(`  Scraped: ${scrapedUrls}`);
    console.log(`  Discovered: ${discoveredUrls}`);
    console.log(`  Failed: ${failedUrls}`);

    // Get URLs by company
    const companiesWithUrls = await prisma.company.findMany({
      include: {
        urls: {
          orderBy: [
            { depth: 'asc' },
            { discoveredAt: 'asc' }
          ]
        }
      },
      where: {
        urls: {
          some: {}
        }
      }
    });

    console.log('\n🏢 URLs by Company:');
    for (const company of companiesWithUrls) {
      console.log(`\n📋 ${company.name} (${company.urls.length} URLs)`);
      
      const groupedByStatus = company.urls.reduce((acc, url) => {
        if (!acc[url.status]) acc[url.status] = [];
        acc[url.status].push(url);
        return acc;
      }, {});

      Object.entries(groupedByStatus).forEach(([status, urls]) => {
        console.log(`  ${status.toUpperCase()} (${urls.length}):`);
        urls.forEach(url => {
          const sizeInfo = url.contentLength ? ` (${Math.round(url.contentLength / 1024)}KB)` : '';
          const scrapedInfo = url.lastScraped ? ` - Last scraped: ${url.lastScraped.toISOString().split('T')[0]}` : '';
          console.log(`    • ${url.path}${sizeInfo}${scrapedInfo}`);
          if (url.title) console.log(`      "${url.title}"`);
        });
      });
    }

    // Get content type statistics
    const contentTypes = await prisma.companyUrl.groupBy({
      by: ['contentType'],
      _count: {
        contentType: true
      },
      where: {
        contentType: { not: null }
      }
    });

    if (contentTypes.length > 0) {
      console.log('\n📄 Content Types:');
      contentTypes.forEach(ct => {
        console.log(`  ${ct.contentType || 'Unknown'}: ${ct._count.contentType}`);
      });
    }

    // Get depth analysis
    const depthStats = await prisma.companyUrl.groupBy({
      by: ['depth'],
      _count: {
        depth: true
      },
      orderBy: {
        depth: 'asc'
      }
    });

    if (depthStats.length > 0) {
      console.log('\n🌊 URL Depth Distribution:');
      depthStats.forEach(stat => {
        const depthLabel = stat.depth === 0 ? 'Homepage' : `Depth ${stat.depth}`;
        console.log(`  ${depthLabel}: ${stat._count.depth} URLs`);
      });
    }

    // Get largest pages
    const largestPages = await prisma.companyUrl.findMany({
      where: {
        contentLength: { not: null },
        status: 'scraped'
      },
      orderBy: {
        contentLength: 'desc'
      },
      take: 5,
      include: {
        company: {
          select: { name: true }
        }
      }
    });

    if (largestPages.length > 0) {
      console.log('\n📏 Largest Scraped Pages:');
      largestPages.forEach((url, index) => {
        const sizeKB = Math.round(url.contentLength / 1024);
        console.log(`  ${index + 1}. ${url.company.name} - ${url.path} (${sizeKB}KB)`);
      });
    }

  } catch (error) {
    console.error('❌ Error querying URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  queryCompanyUrls();
}

module.exports = { queryCompanyUrls };
