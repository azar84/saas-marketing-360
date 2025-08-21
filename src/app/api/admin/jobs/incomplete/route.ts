import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const incomplete = await prisma.job.findMany({
      where: {
        status: {
          notIn: ['completed', 'failed']
        }
      },
      select: { id: true, status: true, type: true, metadata: true }
    });

    const count = incomplete.length;
    console.log(`🔔 Incomplete jobs: ${count}`);
    if (count > 0) {
      console.log('🔍 Incomplete job IDs:', incomplete.map(j => j.id));
    }

    return NextResponse.json({ success: true, count, jobs: incomplete });
  } catch (error) {
    console.error('Failed to get incomplete jobs:', error);
    return NextResponse.json({ success: false, error: 'Failed to get incomplete jobs' }, { status: 500 });
  }
}
