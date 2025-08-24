import { NextRequest, NextResponse } from 'next/server';
import scheduler from '@/lib/scheduler';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing enrichment processing...');
    
    // Test if the method exists and can be called
    if (typeof scheduler.processCompletedEnrichmentJobs === 'function') {
      console.log('✅ Method exists, calling it...');
      await scheduler.processCompletedEnrichmentJobs();
      return NextResponse.json({ success: true, message: 'Enrichment processing completed' });
    } else {
      console.log('❌ Method does not exist');
      return NextResponse.json({ error: 'Method not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error testing enrichment processing:', error);
    return NextResponse.json(
      { error: 'Failed to test enrichment processing', details: String(error) },
      { status: 500 }
    );
  }
}
