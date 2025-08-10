// src/lib/buildCanonicalNaics.ts
import { parse as parseCSV } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { buildStaticNaicsData } from "./staticNaicsData";

const US_2022_XLSX = "https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx";
const US_2022_2017_XWALK = "https://www.census.gov/naics/concordances/2022_to_2017_NAICS.xlsx";
// Canadian NAICS 2022 URL - temporarily disabled due to URL issues
// const CA_2022_STRUCTURE_CSV = "https://www.statcan.gc.ca/o1/sites/default/files/2023-06/naics-canada-2022-v1-0-classification-structure.csv";

const tidy = (s: unknown) => (s ?? "").toString().replace(/\s+/g, " ").trim();

const split = (codeRaw: string) => {
  const code = tidy(codeRaw); 
  const o: any = {};
  if (!code) return o;
  if (code.includes("-")) { 
    o.sector_code = code; 
    return o; 
  }
  if (code.length >= 2) o.sector_code = code.slice(0, 2);
  if (code.length >= 3) o.subsector_code = code.slice(0, 3);
  if (code.length >= 4) o.industry_group_code = code.slice(0, 4);
  if (code.length >= 5) o.industry_code = code.slice(0, 5);
  if (code.length >= 6) o.national_industry_code = code.slice(0, 6);
  return o;
};

async function fetchAB(url: string, timeoutMs = 15000): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status} ${r.statusText}`);
    return r.arrayBuffer();
  } finally {
    clearTimeout(timeout);
  }
}

async function readUSXlsx(url: string) {
  const ab = await fetchAB(url);
  const nodeBuf = Buffer.from(new Uint8Array(ab));
  const wb = new ExcelJS.Workbook();
  await (wb.xlsx.load as any)(nodeBuf);
  const ws = wb.worksheets[0];
  const headers: string[] = []; 
  ws.getRow(1).eachCell((c, i) => headers[i - 1] = tidy(c.value as string));
  const out: Record<string, string>[] = [];
  for (let i = 2; i <= ws.rowCount; i++) {
    const row = ws.getRow(i); 
    const rec: any = {};
    row.eachCell((c, j) => rec[headers[j - 1]] = tidy(c.value as string));
    if (Object.values(rec).some(v => v)) out.push(rec);
  }
  return out;
}

async function readCSV(url: string) {
  const txt = new TextDecoder().decode(new Uint8Array(await fetchAB(url)));
  return parseCSV(txt, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
}

export interface NAICSClassification {
  sector_code?: string;
  sector_title?: string;
  subsector_code?: string;
  subsector_title?: string;
  industry_group_code?: string;
  industry_group_title?: string;
  industry_code?: string;
  industry_title?: string;
  national_industry_code?: string;
  national_industry_title?: string;
  title: string;
}

export interface NAICSAlias {
  alias_code: string;
  maps_to: string;
  note: string;
}

export interface NAICSChange {
  code_2017: string;
  title_2017: string;
  code_2022: string;
  title_2022: string;
  method: string;
}

export async function buildCanonicalNaicsXlsx(): Promise<Buffer> {
  try {
    console.log('Starting NAICS data compilation (official sources)...');
    // 1) Load official sources
    const [us22, xwalk] = await Promise.all([
      readUSXlsx(US_2022_XLSX),
      readUSXlsx(US_2022_2017_XWALK),
    ]);

    // Canadian data temporarily disabled due to URL issues
    const ca22: Record<string, string>[] = [];

    // 2) Normalize US 2022 (canonical backbone)
    const usCodeCol = Object.keys(us22[0]).find(k => /2022.*code/i.test(k))!;
    const usTitleCol = Object.keys(us22[0]).find(k => /2022.*title/i.test(k))!;

    const canonical: NAICSClassification[] = us22
      .filter(r => r[usCodeCol] && r[usTitleCol])
      .map(r => ({ ...split(r[usCodeCol]), title: tidy(r[usTitleCol]) }));

    // Optional CA add (skipped here as ca22 is empty)

    // Map titles for parent levels
    const mapTitle = (key: string) => {
      const m = new Map<string, string>();
      for (const r of canonical) {
        const val = r[key as keyof NAICSClassification] as string | undefined;
        if (val && !m.has(val)) m.set(val, r.title);
      }
      return (code?: string) => (code ? m.get(code) : undefined);
    };

    const tSec = mapTitle("sector_code");
    const tSub = mapTitle("subsector_code");
    const tGrp = mapTitle("industry_group_code");
    const tInd = mapTitle("industry_code");
    const tNat = mapTitle("national_industry_code");

    const classifications: NAICSClassification[] = canonical.map(r => ({
      sector_code: r.sector_code,
      sector_title: tSec(r.sector_code),
      subsector_code: r.subsector_code,
      subsector_title: tSub(r.subsector_code),
      industry_group_code: r.industry_group_code,
      industry_group_title: tGrp(r.industry_group_code),
      industry_code: r.industry_code,
      industry_title: tInd(r.industry_code),
      national_industry_code: r.national_industry_code,
      national_industry_title: tNat(r.national_industry_code),
      title: r.title,
    }));

    const aliases: NAICSAlias[] = [
      { alias_code: "411", maps_to: "423", note: "CA wholesale farm → US wholesale (durable/nondurable split rolled into 423/424)" },
      { alias_code: "412", maps_to: "424", note: "Petroleum wholesalers" },
      { alias_code: "413", maps_to: "424", note: "Food/beverage/tobacco" },
      { alias_code: "414", maps_to: "423", note: "Personal & household goods" },
      { alias_code: "415", maps_to: "423", note: "Motor vehicle wholesalers" },
      { alias_code: "416", maps_to: "423", note: "Building materials" },
      { alias_code: "417", maps_to: "423", note: "Machinery & equipment" },
      { alias_code: "418", maps_to: "423", note: "Miscellaneous wholesalers" },
      { alias_code: "419", maps_to: "425", note: "B2B electronic markets & agents" },
    ];

    const c22 = Object.keys(xwalk[0]).find(k => /2022.*code/i.test(k))!;
    const t22 = Object.keys(xwalk[0]).find(k => /2022.*title/i.test(k))!;
    const c17 = Object.keys(xwalk[0]).find(k => /2017.*code/i.test(k))!;
    const t17 = Object.keys(xwalk[0]).find(k => /2017.*title/i.test(k))!;

    const changes: NAICSChange[] = xwalk
      .filter(r => r[c22] && r[c17])
      .map(r => ({
        code_2017: tidy(r[c17]),
        title_2017: tidy(r[t17]),
        code_2022: tidy(r[c22]),
        title_2022: tidy(r[t22]),
        method: "official_concordance",
      }));

    return await buildWorkbookFromData(classifications, aliases, changes);
  } catch (err) {
    console.warn('Falling back to static NAICS data for Excel build:', err instanceof Error ? err.message : err);
    const { classifications, aliases, changes } = await buildStaticNaicsData();
    return await buildWorkbookFromData(classifications, aliases, changes);
  }
}

async function buildWorkbookFromData(
  classifications: NAICSClassification[],
  aliases: NAICSAlias[],
  changes: NAICSChange[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet('Classifications');
  ws.columns = [
    { header: 'sector_code', key: 'sector_code', width: 15 },
    { header: 'sector_title', key: 'sector_title', width: 50 },
    { header: 'subsector_code', key: 'subsector_code', width: 15 },
    { header: 'subsector_title', key: 'subsector_title', width: 50 },
    { header: 'industry_group_code', key: 'industry_group_code', width: 15 },
    { header: 'industry_group_title', key: 'industry_group_title', width: 50 },
    { header: 'industry_code', key: 'industry_code', width: 15 },
    { header: 'industry_title', key: 'industry_title', width: 50 },
    { header: 'national_industry_code', key: 'national_industry_code', width: 20 },
    { header: 'national_industry_title', key: 'national_industry_title', width: 50 },
    { header: 'title', key: 'title', width: 50 },
  ];
  ws.addRows(classifications);

  const wsA = wb.addWorksheet('Aliases');
  wsA.columns = [
    { header: 'alias_code', key: 'alias_code', width: 15 },
    { header: 'maps_to', key: 'maps_to', width: 15 },
    { header: 'note', key: 'note', width: 80 },
  ];
  wsA.addRows(aliases);

  const wsC = wb.addWorksheet('Changes_2017_to_2022');
  wsC.columns = [
    { header: 'code_2017', key: 'code_2017', width: 15 },
    { header: 'title_2017', key: 'title_2017', width: 50 },
    { header: 'code_2022', key: 'code_2022', width: 15 },
    { header: 'title_2022', key: 'title_2022', width: 50 },
    { header: 'method', key: 'method', width: 20 },
  ];
  wsC.addRows(changes);

  ;[ws, wsA, wsC].forEach(worksheet => {
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function buildCanonicalNaicsData(): Promise<{
  classifications: NAICSClassification[];
  aliases: NAICSAlias[];
  changes: NAICSChange[];
}> {
  console.log('Starting NAICS data compilation for database...');
  
  try {
    // 1) Try to load official sources
    const [us22, xwalk] = await Promise.all([
      readUSXlsx(US_2022_XLSX),
      readUSXlsx(US_2022_2017_XWALK),
    ]);

    // Canadian data temporarily disabled due to URL issues
    let ca22: Record<string, string>[] = [];
    console.log('Canadian NAICS data temporarily disabled, using comprehensive US data only');
    
    // Continue with original processing...
    return await processOfficialNaicsData(us22, xwalk, ca22);
  } catch (error) {
    console.warn('Failed to fetch official NAICS data, using static fallback data:', error instanceof Error ? error.message : 'Unknown error');
    return buildStaticNaicsData();
  }
}

async function processOfficialNaicsData(us22: Record<string, string>[], xwalk: Record<string, string>[], ca22: Record<string, string>[]): Promise<{
  classifications: NAICSClassification[];
  aliases: NAICSAlias[];
  changes: NAICSChange[];
}> {

  // 2) Normalize US 2022 (canonical backbone)
  const usCodeCol = Object.keys(us22[0]).find(k => /2022.*code/i.test(k))!;
  const usTitleCol = Object.keys(us22[0]).find(k => /2022.*title/i.test(k))!;
  
  const canonical: NAICSClassification[] = us22
    .filter(r => r[usCodeCol] && r[usTitleCol])
    .map(r => ({ ...split(r[usCodeCol]), title: tidy(r[usTitleCol]) }));

  // 3) Add CA 2022 6-digit codes
  if (ca22.length > 0) {
    const caCodeCol = Object.keys(ca22[0]).find(k => /code/i.test(k));
    const caTitleCol = Object.keys(ca22[0]).find(k => /(english|title)/i.test(k)) || Object.keys(ca22[0])[1];
    
    if (caCodeCol && caTitleCol) {
      const caRows = ca22
        .filter(r => r[caCodeCol] && r[caTitleCol])
        .map(r => ({ ...split(r[caCodeCol]), title: tidy(r[caTitleCol]) }));

      const usNat = new Set(canonical.map(r => r.national_industry_code).filter(Boolean));
      for (const r of caRows) {
        if (r.national_industry_code && !usNat.has(r.national_industry_code)) {
          canonical.push(r);
        }
      }
    }
  }

  // 4) Fill parent titles
  const mapTitle = (key: string) => {
    const m = new Map<string, string>();
    for (const r of canonical) {
      if (r[key as keyof NAICSClassification] && !m.has(r[key as keyof NAICSClassification] as string)) {
        m.set(r[key as keyof NAICSClassification] as string, r.title);
      }
    }
    return (code?: string) => (code ? m.get(code) : undefined);
  };
  
  const tSec = mapTitle("sector_code");
  const tSub = mapTitle("subsector_code");
  const tGrp = mapTitle("industry_group_code");
  const tInd = mapTitle("industry_code");
  const tNat = mapTitle("national_industry_code");

  const classifications: NAICSClassification[] = canonical.map(r => ({
    sector_code: r.sector_code, 
    sector_title: tSec(r.sector_code),
    subsector_code: r.subsector_code, 
    subsector_title: tSub(r.subsector_code),
    industry_group_code: r.industry_group_code, 
    industry_group_title: tGrp(r.industry_group_code),
    industry_code: r.industry_code, 
    industry_title: tInd(r.industry_code),
    national_industry_code: r.national_industry_code, 
    national_industry_title: tNat(r.national_industry_code),
    title: r.title
  }));

  // 5) Aliases
  const aliases: NAICSAlias[] = [
    { alias_code: "411", maps_to: "423", note: "CA wholesale farm → US wholesale" },
    { alias_code: "412", maps_to: "424", note: "Petroleum wholesalers" },
    { alias_code: "413", maps_to: "424", note: "Food/beverage/tobacco" },
    { alias_code: "414", maps_to: "423", note: "Personal & household goods" },
    { alias_code: "415", maps_to: "423", note: "Motor vehicle wholesalers" },
    { alias_code: "416", maps_to: "423", note: "Building materials" },
    { alias_code: "417", maps_to: "423", note: "Machinery & equipment" },
    { alias_code: "418", maps_to: "423", note: "Miscellaneous wholesalers" },
    { alias_code: "419", maps_to: "425", note: "B2B electronic markets & agents" },
  ];

  // 6) Changes
  const c22 = Object.keys(xwalk[0]).find(k => /2022.*code/i.test(k))!;
  const t22 = Object.keys(xwalk[0]).find(k => /2022.*title/i.test(k))!;
  const c17 = Object.keys(xwalk[0]).find(k => /2017.*code/i.test(k))!;
  const t17 = Object.keys(xwalk[0]).find(k => /2017.*title/i.test(k))!;
  
  const changes: NAICSChange[] = xwalk
    .filter(r => r[c22] && r[c17])
    .map(r => ({
      code_2017: tidy(r[c17]), 
      title_2017: tidy(r[t17]),
      code_2022: tidy(r[c22]), 
      title_2022: tidy(r[t22]),
      method: "official_concordance"
    }));

  return { classifications, aliases, changes };
}
