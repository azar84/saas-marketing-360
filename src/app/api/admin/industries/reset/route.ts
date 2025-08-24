import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

function tidy(value: unknown): string {
  return (value ?? '').toString().replace(/\s+/g, ' ').trim();
}

export async function POST() {
  try {
    // 1) Clear all existing industry-related tables (hierarchical + flat)
    // Build deletes only for models that exist on this Prisma client
    const client: any = prisma as any;
    const maybeDeletes: any[] = [];
    const maybePush = (prop: string) => {
      if (client[prop]?.deleteMany) {
        maybeDeletes.push(client[prop].deleteMany());
      }
    };
    // Order: child relations first
    maybePush('companyNAICSClassification');
    maybePush('nAICSAlias');
    maybePush('nAICSChange');
    maybePush('nAICSClassification');
    maybePush('industry');

    if (maybeDeletes.length) {
      await prisma.$transaction(maybeDeletes);
    }

    // 2) Load Excel from data folder
    const root = process.cwd();
    const filePath = path.join(root, 'data', '2022_NAICS_Structure.xlsx');

    // Ensure file exists
    await fs.access(filePath);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    const ws = wb.worksheets[0];
    if (!ws) throw new Error('No worksheet found in Excel');

    // Identify header row and title column robustly
    let headerRowIdx = -1;
    let titleIdx = -1;

    // Try to detect a header row within the first 30 rows
    for (let r = 1; r <= Math.min(30, ws.rowCount); r++) {
      const headers: string[] = [];
      ws.getRow(r).eachCell((cell, idx) => {
        headers[idx - 1] = tidy(cell.value as string);
      });
      const tIdx = headers.findIndex((h) => /(^|\b)title(\b|$)/i.test(h) || /2022.*title/i.test(h));
      const cIdx = headers.findIndex((h) => /(^|\b)code(\b|$)/i.test(h) || /2022.*code/i.test(h));
      if (tIdx >= 0 && cIdx >= 0) {
        headerRowIdx = r;
        titleIdx = tIdx;
        break;
      }
    }

    // Fallback: pick the column with the most long text values as title
    if (headerRowIdx === -1) {
      const colScores: number[] = [];
      const sampleStart = 1;
      const sampleEnd = Math.min(ws.rowCount, 200);
      const maxCols = ws.columnCount || 10;
      for (let c = 1; c <= maxCols; c++) {
        let score = 0;
        for (let r = sampleStart; r <= sampleEnd; r++) {
          const v = tidy(ws.getRow(r).getCell(c).value as string);
          // Count longer text rows as signal for titles
          if (v && /[a-zA-Z]/.test(v) && v.length >= 5) score++;
        }
        colScores[c - 1] = score;
      }
      const bestIdx = colScores.reduce((best, cur, idx) => (cur > colScores[best] ? idx : best), 0);
      headerRowIdx = 1; // assume first row as header for iteration start
      titleIdx = bestIdx;
    }

    if (titleIdx < 0) throw new Error('Could not locate Title column in the Excel file');

    // 3) Collect titles from the row after header row, de-duplicate
    const titleSet = new Set<string>();
    for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const rawTitle = row.getCell(titleIdx + 1).value as string | undefined;
      const title = tidy(rawTitle);
      if (title) titleSet.add(title);
    }

    const labels = Array.from(titleSet);

    // 4) Insert into flat Industry table in batches
    let inserted = 0;
    const batchSize = 200;
    for (let i = 0; i < labels.length; i += batchSize) {
      const batch = labels.slice(i, i + batchSize).map((label) => ({ 
        label,
        code: label.substring(0, 4).toUpperCase()
      }));
      await prisma.industry.createMany({ data: batch });
      inserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: 'Reset industries to flat list from Excel',
      counts: {
        industries_inserted: inserted,
      },
      file: filePath,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset industries from Excel',
        details: error?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.industry.count();
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message ?? 'Unknown error' }, { status: 500 });
  }
}


