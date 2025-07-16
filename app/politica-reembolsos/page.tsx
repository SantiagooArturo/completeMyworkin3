import Link from 'next/link';

export default function PoliticaReembolsos() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-sans">
      <header className="bg-white py-3 relative shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2">
                <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Política de Reembolsos</h1>
          
          <div className="space-y-4 text-gray-700">
            <p>En MyWorkIn, nos esforzamos por ofrecer servicios de alta calidad tanto a candidatos como a empresas. Esta política de reembolsos establece las condiciones bajo las cuales se pueden solicitar y procesar reembolsos para nuestros servicios premium.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">1. Servicios para Candidatos</h2>
            <p>Para los candidatos que hayan adquirido servicios premium en nuestra plataforma:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Suscripciones mensuales:</strong> Puedes cancelar tu suscripción en cualquier momento. Los reembolsos para suscripciones mensuales se procesan de forma prorrateada según el tiempo de servicio no utilizado.</li>
              <li><strong>Servicios de asesoramiento:</strong> Si no estás satisfecho con nuestros servicios de asesoramiento, puedes solicitar un reembolso dentro de los 7 días posteriores a la adquisición, siempre que no hayas utilizado más del 30% del servicio.</li>
              <li><strong>Cursos y talleres:</strong> Ofrecemos reembolso completo si la solicitud se realiza dentro de las 48 horas posteriores a la compra y no se ha accedido a más del 20% del contenido.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">2. Servicios para Empresas</h2>
            <p>Para las empresas que publican ofertas de prácticas o utilizan nuestros servicios de reclutamiento:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Publicación de ofertas:</strong> Si una oferta publicada no recibe aplicaciones calificadas dentro de los primeros 15 días, ofrecemos la extensión gratuita del período de publicación o un crédito para futuras publicaciones.</li>
              <li><strong>Paquetes de publicación:</strong> Los paquetes de múltiples publicaciones no son reembolsables una vez que se ha utilizado al menos una de las publicaciones incluidas.</li>
              <li><strong>Servicios de reclutamiento premium:</strong> Si no conseguimos proporcionar candidatos que cumplan con los requisitos mínimos especificados, ofrecemos un reembolso parcial o un servicio extendido sin costo adicional.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">3. Procedimiento de Solicitud</h2>
            <p>Para solicitar un reembolso, debes seguir estos pasos:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>Inicia sesión en tu cuenta de MyWorkIn.</li>
              <li>Ve a la sección "Mis Compras" o "Facturación".</li>
              <li>Selecciona el servicio para el que deseas solicitar un reembolso.</li>
              <li>Haz clic en "Solicitar Reembolso" y completa el formulario indicando el motivo.</li>
              <li>Nuestro equipo revisará tu solicitud y te contactará dentro de los 5 días hábiles siguientes.</li>
            </ol>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">4. Plazos de Procesamiento</h2>
            <p>Una vez aprobado el reembolso, el tiempo de procesamiento depende del método de pago original:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Tarjetas de crédito/débito:</strong> 5-10 días hábiles</li>
              <li><strong>PayPal:</strong> 3-5 días hábiles</li>
              <li><strong>Transferencia bancaria:</strong> 7-14 días hábiles</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">5. Excepciones</h2>
            <p>No se procesarán reembolsos en los siguientes casos:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Uso fraudulento o abusivo de nuestros servicios</li>
              <li>Violación de nuestros términos y condiciones</li>
              <li>Servicios completamente consumidos o utilizados</li>
              <li>Solicitudes realizadas fuera de los plazos establecidos</li>
              <li>Promociones o descuentos especiales marcados como "no reembolsables"</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">6. Cambios en la Política</h2>
            <p>MyWorkIn se reserva el derecho de modificar esta política de reembolsos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en nuestra plataforma. Las solicitudes de reembolso se procesarán según la política vigente en el momento de la compra del servicio.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">7. Contacto</h2>
            <p>Si tienes preguntas o necesitas asistencia adicional con respecto a reembolsos, contáctanos a través de nuestra sección de soporte o enviando un correo electrónico a billing@myworkin.com.</p>
            
            <p className="mt-6">Última actualización: 30 de marzo de 2025</p>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-3 mt-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center">
            <p className="text-gray-600 text-xs mb-2">© 2025 MyWorkIn. Todos los derechos reservados.</p>
            <div className="flex justify-center space-x-4 text-xs text-indigo-600">
              <Link href="/terminos-condiciones" className="hover:text-indigo-800 transition-colors">Términos y Condiciones</Link>
              <Link href="/politica-privacidad" className="hover:text-indigo-800 transition-colors">Política de Privacidad</Link>
              <Link href="/politica-reembolsos" className="hover:text-indigo-800 transition-colors">Política de Reembolsos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 