import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('🌱 Starting database seeding via Prisma...');

    // Run the Prisma seed command
    const { stdout, stderr } = await execAsync('npx prisma db seed');

    if (stderr) {
      console.warn('Seed warnings:', stderr);
    }

    console.log('Seed output:', stdout);
    console.log('🎉 Database seeding completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully via Prisma',
      output: stdout
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database', details: (error as Error).message },
      { status: 500 }
    );
  }
} 