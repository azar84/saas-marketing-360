const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugJobs() {
  try {
    console.log('🔍 Checking jobs table...');
    
    const jobs = await prisma.job.findMany({
      orderBy: { submittedAt: 'desc' }
    });
    
    console.log(`📊 Found ${jobs.length} jobs in database`);
    
    jobs.forEach((job, index) => {
      console.log(`\n--- Job ${index + 1} ---`);
      console.log(`ID: ${job.id}`);
      console.log(`Type: ${job.type}`);
      console.log(`Status: ${job.status}`);
      console.log(`Progress: ${job.progress}`);
      console.log(`PollUrl: ${job.pollUrl}`);
      console.log(`Metadata:`, JSON.stringify(job.metadata, null, 2));
      console.log(`Submitted: ${job.submittedAt}`);
      console.log(`Completed: ${job.completedAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJobs();
