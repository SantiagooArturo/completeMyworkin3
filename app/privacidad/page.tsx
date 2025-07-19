'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header con botón de retroceso */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-[#028bbf] hover:text-[#027ba8] transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Política de Privacidad
            </h1>
            <p className="text-gray-600 mb-6">
              MyWorkIn S.A.C. - Protección de Datos Personales
            </p>
            
            {/* Contenido de la política */}
            <div className="prose prose-gray max-w-none">
              
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                POLÍTICA DE PRIVACIDAD DE MYWORKIN S.A.C.
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                MyWorkIn S.A.C. (en adelante, "MyWorkIn"), con domicilio en Calle Los Abetos N.º 137, 
                Urbanización El Remanso Etapa Dos, distrito de La Molina, Lima; valora a sus usuarios de 
                sus servicios (en adelante, los "Usuarios") y está comprometida con la protección de su 
                privacidad.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Como parte de dicho compromiso, hemos desarrollado la presente política de privacidad 
                (en adelante, la "Política de Privacidad") que describe la manera en la que MyWorkIn 
                tratará la información que califique como datos personales de los Usuarios.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-8">
                <strong>Fecha de entrada en vigencia:</strong> [Colocar fecha de publicación oficial]
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                1. INTRODUCCIÓN
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                MyWorkIn S.A.C., identificada con RUC N.º 20612485926 y domiciliada en Calle Los Abetos 
                N.º 137, Urbanización El Remanso Etapa Dos, distrito de La Molina, provincia y departamento 
                de Lima, Perú, pone a disposición de sus Usuarios, aliados y universidades esta Política 
                de Privacidad, la cual se emite en cumplimiento de la Ley N.º 29733 - Ley de Protección 
                de Datos Personales y su Reglamento aprobado mediante el Decreto Supremo N.º 016-2024-JUS 
                (en adelante, la "Normativa Aplicable").
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                La presente Política de Privacidad describe de manera clara y detallada los principios, 
                finalidades, condiciones y derechos aplicables al tratamiento de los datos personales de 
                los Usuarios que interactúan con los servicios de MyWorkIn. Esto incluye las entrevistas 
                automatizadas realizadas a través de WhatsApp, así como la información recopilada mediante 
                formularios, sitios web, otras herramientas digitales y, en general, cualquier servicio 
                brindado por MyWorkIn.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                2. IDENTIDAD Y DATOS DEL TITULAR DEL BANCO DE DATOS
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                MyWorkIn S.A.C. es la entidad responsable del tratamiento de los datos personales de los 
                Usuarios. Los datos de contacto de la empresa son los siguientes:
              </p>
              
              <ul className="list-none space-y-2 mb-6 bg-gray-50 p-4 rounded-lg">
                <li><strong>Razón social:</strong> MyWorkIn S.A.C.</li>
                <li><strong>Nombre comercial:</strong> WorkIn</li>
                <li><strong>RUC:</strong> 20612485926</li>
                <li><strong>Domicilio fiscal:</strong> Calle Los Abetos N.º 137, Urb. El Remanso Et. Dos, La Molina, Lima - Perú</li>
                <li><strong>Correo electrónico para contacto:</strong> francesco@workin.com</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                3. BANCOS DE DATOS PERSONALES
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                MyWorkIn realiza el tratamiento de datos personales de acuerdo con lo dispuesto en la 
                Normativa Aplicable. La información recopilada puede incluir datos proporcionados 
                directamente por los Usuarios, así como aquellos obtenidos a través del uso de herramientas 
                tecnológicas implementadas en la plataforma. Esta información puede ser tratada de forma 
                automatizada o no, y almacenada en bancos de datos previamente inscritos ante la ANPDP.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                En cumplimiento del principio de calidad, se espera que los datos proporcionados por los 
                titulares de los datos personales sean veraces, completos, exactos y actualizados, sin 
                perjuicio de las validaciones que pueda realizar MyWorkIn por medios legítimos.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                MyWorkIn ha registrado formalmente los siguientes bancos de datos ante la Autoridad 
                Nacional de Protección de Datos Personales (la "ANPDP"), conforme a la normativa vigente:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 font-semibold">Código de Registro</th>
                      <th className="text-left py-2 font-semibold">Titular del Banco</th>
                      <th className="text-left py-2 font-semibold">Denominación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">PN-2025-30</td>
                      <td className="py-2">MyWorkIn S.A.C.</td>
                      <td className="py-2">Usuarios registrados</td>
                    </tr>
                    <tr>
                      <td className="py-2">PN-2025-29</td>
                      <td className="py-2">MyWorkIn S.A.C.</td>
                      <td className="py-2">Potenciales clientes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Cada banco de datos ha sido debidamente inscrito ante la ANPDP conforme al procedimiento 
                correspondiente, declarando las finalidades específicas del tratamiento, las categorías 
                de datos involucradas, las transferencias previstas y las medidas de seguridad aplicadas.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                En todos los casos, MyWorkIn aplica medidas técnicas y organizativas razonables para 
                garantizar la confidencialidad, integridad y disponibilidad de los datos personales 
                tratados, restringiendo el acceso únicamente a personal autorizado o terceros debidamente 
                habilitados para tales fines.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                4. DATOS PERSONALES RECOPILADOS
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Dependiendo del tipo de interacción con la plataforma y los servicios utilizados, MyWorkIn 
                puede recopilar distintos tipos de datos personales, entre los cuales se incluyen:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Datos identificativos:</strong> Nombre completo, teléfono y correo electrónico.</li>
                <li><strong>Datos académicos y laborales:</strong> Información contenida en el CV, experiencia laboral, centro y grado de estudios.</li>
                <li><strong>Datos biométricos:</strong> Voz, información relacionada con características físicas y de identidad, tales como la voz, la imagen facial captada para reconocimiento (rostro) y fotografías o videos generales donde pueda aparecer el usuario (imagen).</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                5. FINALIDADES DEL TRATAMIENTO
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Los datos personales recabados por MyWorkIn serán tratados para las siguientes finalidades:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Brindar los servicios de preparación para entrevistas laborales.</li>
                <li>Contactar al Usuario para seguimiento, soporte y mejora del servicio.</li>
                <li>Compartir grabaciones y otros datos con empresas o universidades aliadas, previo consentimiento expreso del Usuario.</li>
                <li>Realizar análisis de comportamiento y mejorar los algoritmos de inteligencia artificial utilizados en la plataforma.</li>
                <li>Enviar promociones y comunicaciones comerciales, previo consentimiento expreso del Usuario.</li>
                <li>Elaborar estadísticas con datos disociados, con fines institucionales o en alianzas estratégicas.</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                6. CONSENTIMIENTO LIBRE, PREVIO, INFORMADO Y SEGMENTADO
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                El tratamiento de los datos personales sólo será realizado con el consentimiento libre, 
                previo, informado y expreso del Usuario. Dicho consentimiento será recogido de forma 
                diferenciada y expresa a través de casillas independientes. A continuación, se detallan 
                los consentimientos requeridos:
              </p>
              
              <ul className="list-disc pl-6 space-y-3 mb-6">
                <li>
                  <strong>Uso del servicio (obligatorio):</strong> El Usuario autoriza el tratamiento de 
                  sus datos para poder utilizar los servicios de MyWorkIn, como entrevistas simuladas, 
                  análisis de CV y reportes de empleabilidad.
                </li>
                <li>
                  <strong>Fines comerciales (opcional):</strong> El Usuario puede autorizar el envío de 
                  promociones, newsletters y comunicaciones sobre nuevos servicios.
                </li>
                <li>
                  <strong>Compartir con universidades (opcional):</strong> El Usuario podrá autorizar el 
                  compartir sus datos personales y resultados con universidades aliadas, con fines 
                  educativos, de empleabilidad y apoyo académico.
                </li>
              </ul>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Es importante señalar que el Usuario podrá seguir accediendo al servicio sin haber otorgado 
                su consentimiento para las finalidades opcionales, salvo que exista una justificación 
                técnica documentada que lo impida.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                7. TRANSFERENCIA NACIONAL E INTERNACIONAL DE DATOS
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                MyWorkIn podrá transferir los datos personales recopilados a: Empresas reclutadoras, 
                universidades aliadas y otras entidades, para fines vinculados a la selección y 
                contratación de potenciales perfiles dentro del territorio nacional.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Asimismo, MyWorkIn podrá transferir datos personales a entidades ubicadas fuera del 
                territorio nacional. En aquellos casos en los que el país receptor no cuente con un 
                nivel de protección adecuado de datos personales, se establecerán cláusulas contractuales 
                adecuadas que garanticen un nivel de protección equivalente al establecido en la 
                legislación peruana.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                8. DERECHOS DE LOS USUARIOS (ARCO)
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Los titulares de los datos personales podrán ejercer los siguientes derechos en relación 
                con sus datos personales:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Acceso:</strong> Derecho a obtener confirmación sobre si sus datos están siendo tratados y a acceder a los mismos.</li>
                <li><strong>Rectificación:</strong> Derecho a solicitar la corrección de datos personales inexactos.</li>
                <li><strong>Cancelación:</strong> Derecho a solicitar la eliminación de sus datos personales.</li>
                <li><strong>Oposición:</strong> Derecho a oponerse al tratamiento de sus datos personales.</li>
              </ul>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Los plazos de respuesta a las solicitudes son los siguientes: 10 días para solicitudes 
                de cancelación, y 20 días para el ejercicio de los demás derechos. Las solicitudes deben 
                enviarse al correo electrónico: <strong>francesco@workin.com</strong>
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                9. PLAZOS DE CONSERVACIÓN DE LOS DATOS
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Los datos personales serán conservados mientras el Usuario mantenga una cuenta activa en 
                la plataforma de MyWorkIn o mientras continúe utilizando sus servicios. El usuario podrá 
                solicitar la eliminación de su cuenta, de lo contrario los datos se almacenarán únicamente 
                por el tiempo necesario para cumplir con obligaciones legales mínimas o requerimientos de 
                la autoridad competente, conforme a lo establecido en la Normativa Aplicable.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                En cualquier momento, el titular de los datos personales podrá ejercer su derecho a 
                solicitar la cancelación de sus datos personales, de acuerdo con el procedimiento 
                establecido en el punto 9 de la presente Política de Privacidad.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                10. MEDIDAS DE SEGURIDAD Y DOCUMENTACIÓN
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                MyWorkIn adopta medidas de seguridad orientadas a proteger los datos personales de los 
                USUARIOS frente a accesos no autorizados, tratamientos indebidos o cualquier forma de 
                uso no conforme con la Normativa Aplicable.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                El acceso a los datos personales de los USUARIOS está restringido únicamente al personal 
                autorizado, y su tratamiento se realiza conforme a las finalidades previamente informadas 
                a los USUARIOS, titulares de los datos personales. La plataforma aplica criterios de 
                limitación del tratamiento, resguardo de la información compartida y conservación de los 
                datos personales durante el tiempo necesario para cumplir con los fines declarados.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                MyWorkIn mantiene el compromiso de proteger la confidencialidad, integridad y disponibilidad 
                de los datos personales tratados, conforme a los principios establecidos en la Normativa 
                Vigente de protección de datos personales en el Perú.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                11. MODIFICACIONES A ESTA POLÍTICA
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-8">
                Esta Política de Privacidad podrá ser modificada en cualquier momento, especialmente en 
                caso de cambios normativos o de operación. La versión vigente estará disponible en el 
                sitio web oficial de MyWorkIn: www.workin2.com.
              </p>

              <div className="border-t border-gray-200 pt-6 mt-8">
                <p className="text-center text-gray-600 text-sm">
                  © MyWorkIn S.A.C. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 