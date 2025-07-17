import { Resend } from 'resend';

// Verificar configuración
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const SANTIAGO_EMAIL = process.env.SANTIAGO_EMAIL;

if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY no está configurado');
}

if (!RESEND_FROM_EMAIL) {
  console.warn('⚠️ RESEND_FROM_EMAIL no está configurado');
}

if (!SANTIAGO_EMAIL) {
  console.warn('⚠️ SANTIAGO_EMAIL no está configurado');
}

// Inicializar Resend solo si tenemos API key
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface WelcomeEmailData {
  email: string;
  displayName: string;
  credits?: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Servicio principal para el manejo de emails
 */
export class EmailService {
  
  /**
   * Verificar si el servicio está correctamente configurado
   */
  static isConfigured(): boolean {
    return !!(RESEND_API_KEY && RESEND_FROM_EMAIL && SANTIAGO_EMAIL && resend);
  }

  /**
   * Enviar email de bienvenida cuando un usuario se registra
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    try {
      // Verificar configuración
      if (!this.isConfigured()) {
        console.error('❌ EmailService no está configurado correctamente');
        return {
          success: false,
          error: 'Servicio de email no configurado'
        };
      }

      console.log('📧 Enviando email de bienvenida a:', data.email);

      // Generar el HTML del email
      const htmlContent = this.generateWelcomeEmailHTML(data);

      // Enviar email con Resend
      const response = await resend!.emails.send({
        from: RESEND_FROM_EMAIL!,
        to: data.email,
        subject: '¡Bienvenido a MyWorkIn! 🚀',
        html: htmlContent,
        // Agregar headers para mejorar deliverability
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'MyWorkIn Platform'
        }
      });

      console.log('✅ Email de bienvenida enviado exitosamente:', response.data?.id);

      return {
        success: true,
        messageId: response.data?.id
      };

    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Generar el HTML del email de bienvenida
   */
  private static generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    const firstName = data.displayName.split(' ')[0] || data.displayName;
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a MyWorkIn!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #028bbf;
            margin-bottom: 10px;
        }
        .welcome-title {
            font-size: 24px;
            color: #1a202c;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .credits-box {
            background: linear-gradient(135deg, #028bbf 0%, #0369a1 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .credits-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .credits-list {
            list-style: none;
            padding: 0;
        }
        .credits-list li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        .credits-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #fbbf24;
            font-weight: bold;
        }
        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .santiago-name {
            font-weight: bold;
            color: #028bbf;
        }
        .contact-info {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
        }
        .contact-email {
            color: #028bbf;
            text-decoration: none;
            font-weight: 500;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo" style="text-align: center;">
                <img src="https://www.myworkin.pe/MyWorkIn-web.png" 
                     alt="MyWorkIn" 
                     style="height: 60px; width: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />
            </div>
            <h1 class="welcome-title">¡Bienvenido a MyWorkIn! 🚀</h1>
        </div>
        
        <div class="content">
            <p>Hola <strong>${firstName}</strong>,</p>
            
            <p>¡Qué emoción tenerte en MyWorkIn!</p>
            
            <p>Soy Santiago Franco Baanante, CTO de MyWorkIn. Personalmente quería darte la bienvenida a nuestra plataforma.</p>
            
            <p>En MyWorkIn hemos creado las herramientas que nosotros hubiéramos querido tener cuando éramos estudiantes buscando prácticas. Nuestro objetivo es democratizar el acceso a oportunidades profesionales de calidad.</p>
            
            <div class="credits-box">
                <div class="credits-title">🎁 Para empezar, ya tienes créditos gratuitos en tu cuenta para:</div>
                <ul class="credits-list">
                    <li>Analizar y optimizar tu CV</li>
                    <li>Acceder a nuestra bolsa de trabajo premium</li>
                    <li>Usar nuestras herramientas de IA</li>
                </ul>
            </div>
            
            <p>Si tienes alguna pregunta, sugerencia o simplemente quieres conversar sobre tu carrera profesional, no dudes en escribirme directamente.</p>
            
            <div class="contact-info">
                <p>📧 Contáctame directamente: <a href="mailto:${SANTIAGO_EMAIL}" class="contact-email">${SANTIAGO_EMAIL}</a></p>
            </div>
        </div>
        
        <div class="signature">
            <p>¡Éxitos en tu búsqueda!</p>
            <p class="santiago-name">Santiago Franco Baanante</p>
            <p>CTO<br>MyWorkIn</p>
        </div>
        
        <div class="footer">
            <p>Este email fue enviado porque te registraste en MyWorkIn. Si tienes alguna pregunta, responde directamente a este correo.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Método para testing - enviar email de prueba
   */
  static async sendTestEmail(testEmail: string): Promise<EmailResult> {
    return this.sendWelcomeEmail({
      email: testEmail,
      displayName: 'Usuario de Prueba',
      credits: 10
    });
  }
} 