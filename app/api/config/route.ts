import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const config = {
    mercadopago: {
      accessToken: !!process.env.MP_ACCESS_TOKEN,
      publicKey: !!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(config);
}
