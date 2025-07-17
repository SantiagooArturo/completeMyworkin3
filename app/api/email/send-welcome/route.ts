import { NextRequest, NextResponse } from 'next/server';
import { EmailService, WelcomeEmailData } from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    // Verificar que el servicio de email esté configurado
    if (!EmailService.isConfigured()) {
      console.error('❌ EmailService no está configurado');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Servicio de email no disponible' 
        }, 
        { status: 500 }
      );
    }

    // Obtener datos del request
    const body = await request.json();
    const { email, displayName, credits } = body;

    // Validar datos requeridos
    if (!email || !displayName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email y displayName son requeridos' 
        }, 
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Formato de email inválido' 
        }, 
        { status: 400 }
      );
    }

    console.log('📧 API: Enviando email de bienvenida para:', email);

    // Preparar datos para el email
    const emailData: WelcomeEmailData = {
      email: email.trim(),
      displayName: displayName.trim(),
      credits: credits || undefined
    };

    // Enviar email usando el servicio
    const result = await EmailService.sendWelcomeEmail(emailData);

    if (result.success) {
      console.log('✅ API: Email de bienvenida enviado exitosamente:', result.messageId);
      
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email de bienvenida enviado correctamente'
      });
    } else {
      console.error('❌ API: Error enviando email:', result.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Error enviando email' 
        }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ API: Error inesperado en send-welcome:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}

// Endpoint para testing (opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email');

    if (!testEmail) {
      return NextResponse.json(
        { 
          error: 'Parámetro email requerido para test. Uso: /api/email/send-welcome?email=test@example.com' 
        }, 
        { status: 400 }
      );
    }

    console.log('🧪 Enviando email de prueba a:', testEmail);

    const result = await EmailService.sendTestEmail(testEmail);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: `Email de prueba enviado a ${testEmail}`
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error en test de email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error enviando email de prueba' 
      }, 
      { status: 500 }
    );
  }
} 