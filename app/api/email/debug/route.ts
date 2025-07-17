import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'test@example.com';

  try {
    console.log('🔍 === DEBUG DETALLADO DE EMAIL ===');
    
    // 1. Verificar variables de entorno
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const santiagoEmail = process.env.SANTIAGO_EMAIL;

    console.log('📋 Variables de entorno:');
    console.log('- RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NO CONFIGURADO');
    console.log('- RESEND_FROM_EMAIL:', fromEmail || 'NO CONFIGURADO');
    console.log('- SANTIAGO_EMAIL:', santiagoEmail || 'NO CONFIGURADO');

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY no configurado'
      });
    }

    // 2. Crear instancia de Resend directamente
    console.log('🔧 Creando instancia de Resend...');
    const resend = new Resend(apiKey);

    // 3. Probar envío directo
    console.log('📧 Enviando email de prueba directo...');
    
    const emailData = {
      from: fromEmail || 'onboarding@resend.dev',
      to: email,
      subject: '🧪 TEST DEBUG - MyWorkIn',
      html: `
        <h1>Test de Debug</h1>
        <p>Este es un email de prueba para debug.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Email destino: ${email}</p>
      `
    };

    console.log('📦 Datos del email:', emailData);

    // 4. Intentar envío
    const result = await resend.emails.send(emailData);
    
    console.log('📊 Resultado completo de Resend:', JSON.stringify(result, null, 2));

    // 5. Verificar respuesta
    if (result.data) {
      console.log('✅ Email enviado con ID:', result.data.id);
      
      return NextResponse.json({
        success: true,
        messageId: result.data.id,
        fullResult: result.data,
        config: {
          apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : null,
          fromEmail: fromEmail,
          santiagoEmail: santiagoEmail
        },
        timestamp: new Date().toISOString()
      });
    } else if (result.error) {
      console.error('❌ Error de Resend:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error.message || 'Error de Resend',
        errorDetails: result.error,
        config: {
          apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : null,
          fromEmail: fromEmail,
          santiagoEmail: santiagoEmail
        }
      }, { status: 400 });
    } else {
      console.error('❌ Respuesta inesperada de Resend:', result);
      
      return NextResponse.json({
        success: false,
        error: 'Respuesta inesperada de Resend',
        fullResult: result
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ === ERROR CRÍTICO EN DEBUG ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json({
      success: false,
      error: 'Error crítico en debug',
      details: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 