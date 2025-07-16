import Link from 'next/link';

export default function TerminosCondiciones() {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Términos y Condiciones</h1>
          
          <div className="space-y-4 text-gray-700">
            <p>Bienvenido a MyWorkIn. Al acceder y utilizar nuestro portal de prácticas profesionales, aceptas cumplir con los siguientes términos y condiciones. Por favor, léelos cuidadosamente.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">1. Aceptación de Términos</h2>
            <p>Al registrarte y utilizar MyWorkIn, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestro servicio.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">2. Descripción del Servicio</h2>
            <p>MyWorkIn es un portal que conecta a estudiantes y profesionales con oportunidades de prácticas profesionales. Facilitamos la búsqueda y aplicación a diversas ofertas laborales en diferentes sectores profesionales.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">3. Registro y Cuenta</h2>
            <p>Para acceder a ciertas funcionalidades de MyWorkIn, deberás registrarte proporcionando información precisa y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">4. Uso del Servicio</h2>
            <p>Te comprometes a utilizar nuestro servicio de manera responsable y de acuerdo con todas las leyes aplicables. No debes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Proporcionar información falsa sobre tu identidad o calificaciones profesionales</li>
              <li>Utilizar el servicio para actividades ilegales o no autorizadas</li>
              <li>Interferir con el funcionamiento del servicio o intentar acceder a áreas restringidas</li>
              <li>Publicar contenido ofensivo, difamatorio o que viole derechos de terceros</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">5. Ofertas de Prácticas</h2>
            <p>MyWorkIn no garantiza la exactitud de las ofertas publicadas ni los resultados de las aplicaciones a prácticas profesionales. Actuamos como intermediarios y no somos responsables de las relaciones laborales que se establezcan entre los usuarios y las empresas.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">6. Propiedad Intelectual</h2>
            <p>Todo el contenido de MyWorkIn, incluyendo logotipos, textos, gráficos, botones, imágenes y software, están protegidos por derechos de autor y otras leyes de propiedad intelectual. No puedes reproducir, distribuir o crear obras derivadas sin nuestro consentimiento expreso.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">7. Limitación de Responsabilidad</h2>
            <p>MyWorkIn proporciona el servicio "tal cual" y no asume ninguna responsabilidad por daños directos, indirectos, incidentales o consecuentes que puedan surgir del uso o la imposibilidad de usar nuestro servicio.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">8. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio. Es tu responsabilidad revisar periódicamente estos términos.</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">9. Ley Aplicable</h2>
            <p>Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes del país donde MyWorkIn tiene su sede principal, sin consideración a sus disposiciones sobre conflictos de leyes.</p>
            
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