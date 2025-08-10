import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Deprecated legacy endpoint; comprehensive seeding is handled elsewhere.
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Deprecated: use /api/admin/naics/comprehensive-seed instead' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Deprecated: use /api/admin/naics/comprehensive-seed for status' },
    { status: 410 }
  );
}
