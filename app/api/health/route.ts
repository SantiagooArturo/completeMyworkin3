import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    status: 'OK',
    timestamp,
    server: 'Next.js',
    environment: process.env.NODE_ENV,
    webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
    mp_configured: !!process.env.MP_ACCESS_TOKEN,
    firebase_configured: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    uptime: process.uptime()
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
