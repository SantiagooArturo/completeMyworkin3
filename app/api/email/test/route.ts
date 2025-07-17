import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/emailService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  // Verificar que se proporcione un email
  if (!email) {
    return NextResponse.json({
      error: '❌ Email requerido',
      usage: 'GET /api/email/test?email=tu@email.com',
      example: 'GET /api/email/test?email=santiago@sworkin2.com'
    }, { status: 400 });
  }

  try {
    console.log('🧪 === INICIANDO TEST DE EMAIL ===');
    
    // 1. Verificar configuración
    console.log('🔧 Verificando configuración...');
    const isConfigured = EmailService.isConfigured();
    
    const configStatus = {
      isConfigured,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
      hasSantiagoEmail: !!process.env.SANTIAGO_EMAIL,
      fromEmail: process.env.RESEND_FROM_EMAIL,
      santiagoEmail: process.env.SANTIAGO_EMAIL
    };

    console.log('📋 Estado de configuración:', configStatus);

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: '❌ Servicio de email no configurado correctamente',
        config: configStatus
      }, { status: 500 });
    }

    // 2. Enviar email de prueba
    console.log('📧 Enviando email de prueba a:', email);
    
    const result = await EmailService.sendWelcomeEmail({
      email: email,
      displayName: 'Usuario de Prueba',
      credits: 10
    });

    console.log('📊 Resultado del envío:', result);

    // 3. Responder con el resultado
    if (result.success) {
      console.log('✅ === TEST EXITOSO ===');
      
      return NextResponse.json({
        success: true,
        message: `✅ Email de prueba enviado exitosamente a ${email}`,
        messageId: result.messageId,
        config: configStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ === TEST FALLIDO ===');
      
      return NextResponse.json({
        success: false,
        error: `❌ Error enviando email: ${result.error}`,
        config: configStatus,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ === ERROR INESPERADO EN TEST ===');
    console.error(error);

    return NextResponse.json({
      success: false,
      error: '❌ Error inesperado en el test',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, displayName } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email requerido en el body'
      }, { status: 400 });
    }

    console.log('🧪 POST Test - Enviando email a:', email);

    const result = await EmailService.sendWelcomeEmail({
      email: email,
      displayName: displayName || 'Usuario de Prueba POST',
      credits: 10
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error en POST test',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 