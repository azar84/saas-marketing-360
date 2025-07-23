import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Validate the required fields in the uploaded JSON
function validateServiceAccount(json: any) {
  const required = [
    'type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id',
    'auth_uri', 'token_uri', 'auth_provider_x509_cert_url', 'client_x509_cert_url', 'universe_domain'
  ];
  for (const key of required) {
    if (!json[key]) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }
    const text = await (file as File).text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid JSON file' }, { status: 400 });
    }
    if (!validateServiceAccount(json)) {
      return NextResponse.json({ success: false, message: 'Missing required fields in service account JSON' }, { status: 400 });
    }
    // Deactivate previous credentials
    await prisma.serviceAccountCredentials.updateMany({ data: { isActive: false }, where: { isActive: true } });
    // Save new credentials
    const saved = await prisma.serviceAccountCredentials.create({
      data: {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key,
        privateKeyId: json.private_key_id,
        clientId: json.client_id,
        authUri: json.auth_uri,
        tokenUri: json.token_uri,
        authProviderX509CertUrl: json.auth_provider_x509_cert_url,
        clientX509CertUrl: json.client_x509_cert_url,
        universeDomain: json.universe_domain,
        isActive: true
      }
    });
    return NextResponse.json({ success: true, message: 'Service account credentials uploaded', id: saved.id });
  } catch (error) {
    console.error('❌ Error uploading service account credentials:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload credentials', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔍 Fetching service account credentials...');
    const cred = await prisma.serviceAccountCredentials.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    if (!cred) {
      console.log('📭 No active credentials found');
      return NextResponse.json({ success: false, message: 'No credentials found' }, { status: 404 });
    }
    // Exclude privateKey from response for security
    const { privateKey, ...safeCred } = cred;
    console.log('✅ Credentials found:', safeCred.clientEmail);
    return NextResponse.json({ success: true, data: safeCred });
  } catch (error) {
    console.error('❌ Error fetching service account credentials:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch credentials', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 