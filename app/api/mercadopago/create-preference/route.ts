import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN no está configurado');
}

const client = new MercadoPagoConfig({ 
  accessToken: MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

export async function POST(request: NextRequest) {
  try {
    const { title, price, quantity = 1, userId, revisions, userEmail } = await request.json();

    if (!title || !price || !userId || !userEmail) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    const preference = new Preference(client);
    
    const preferenceData = {
      items: [
        {
          id: `cv_analysis_${Date.now()}`,
          title: `${title}`,
          description: `Análisis de CV - ${revisions} revisión${revisions > 1 ? 'es' : ''}`,
          category_id: 'services',
          unit_price: Number(price),
          quantity: Number(quantity),
          currency_id: 'PEN'
        }
      ],
      payer: {
        email: userEmail
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending`
      },
      auto_return: 'approved' as const,
      external_reference: `${userId}_${revisions}_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
      statement_descriptor: 'MyWorkIn CV',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('Error creando preferencia:', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago' },
      { status: 500 }
    );
  }
}