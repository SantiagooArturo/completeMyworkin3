# MyWorkIn - Portal de Empleo con IA

![MyWorkIn](public/MyWorkIn-web.png)

## 🚀 Descripción del Proyecto

MyWorkIn es una plataforma web moderna de búsqueda de empleo que utiliza inteligencia artificial para optimizar currículums, analizar perfiles profesionales y conectar candidatos con oportunidades laborales relevantes.

## ✨ Características Principales

### 🤖 Inteligencia Artificial
- **Análisis de CV**: Evaluación automática de currículums con puntuación y recomendaciones
- **Mejora de Resúmenes**: Optimización de descripciones profesionales usando OpenAI
- **Matching Inteligente**: Conexión automática entre candidatos y ofertas laborales
- **Agentes IA**: Asistentes virtuales especializados por industria

### 📄 Constructor de CV
- **Editor Visual**: Interfaz intuitiva para crear currículums profesionales
- **Generación PDF**: Exportación automática a PDF optimizado
- **Templates Profesionales**: Múltiples diseños adaptativos
- **Vista Previa en Tiempo Real**: Visualización instantánea de cambios

### 💼 Bolsa de Trabajo
- **Búsqueda Avanzada**: Filtros por categoría, ubicación y experiencia
- **Postulación Directa**: Sistema integrado de aplicación a ofertas
- **Seguimiento de Aplicaciones**: Historial de postulaciones y estados

### 💳 Sistema de Pagos
- **MercadoPago Integration**: Pagos seguros y confiables
- **Planes Premium**: Funcionalidades avanzadas por suscripción
- **Webhooks**: Procesamiento automático de pagos

## 🛠 Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Framework de estilos utilitarios
- **shadcn/ui**: Componentes UI consistentes y accesibles

### Backend & Servicios
- **Firebase**: Autenticación y base de datos
- **OpenAI API**: Procesamiento de lenguaje natural
- **MercadoPago API**: Sistema de pagos
- **jsPDF**: Generación de documentos PDF

### Infraestructura
- **Vercel**: Deployment y hosting
- **Edge Runtime**: Funciones serverless optimizadas
- **CDN**: Distribución global de contenido

## 🚦 Requisitos Previos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta de Firebase
- API Key de OpenAI
- Cuenta de MercadoPago (para pagos)

## ⚙️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd myworkinweb
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# MercadoPago Configuration
MP_ACCESS_TOKEN=your_mercadopago_access_token
NEXT_PUBLIC_MP_PUBLIC_KEY=your_mercadopago_public_key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication y Firestore
3. Descargar credenciales de servicio
4. Configurar reglas de seguridad de Firestore

### 5. Ejecutar en Desarrollo
```bash
pnpm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
myworkinweb/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── ai/           # Endpoints de IA
│   │   ├── cv/           # Gestión de CVs
│   │   └── mercadopago/  # Sistema de pagos
│   ├── crear-cv/         # Constructor de CV
│   ├── bolsa-trabajo/    # Portal de empleos
│   └── dashboard/        # Panel de usuario
├── components/            # Componentes React reutilizables
│   ├── cv-builder/       # Componentes del constructor
│   └── ui/               # Componentes base UI
├── lib/                  # Utilidades y configuraciones
│   ├── client/          # Servicios del cliente
│   ├── error/           # Manejo de errores
│   └── performance/     # Optimizaciones
├── services/             # Servicios de negocio
├── firebase/             # Configuración Firebase
├── config/               # Configuraciones
└── docs/                 # Documentación técnica
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev              # Iniciar servidor de desarrollo
pnpm run build            # Construir para producción
pnpm run start            # Iniciar servidor de producción
pnpm run lint             # Ejecutar linter
pnpm run type-check       # Verificar tipado TypeScript

# Testing
node test-pdf-generation.js    # Probar generación de PDFs
node test-pdf-simple.js        # Prueba simple de PDF
```

## 🔐 Seguridad Implementada

### Autenticación
- Firebase Authentication con múltiples proveedores
- Sesiones seguras con JWT tokens
- Middleware de protección de rutas

### API Security
- Rate limiting en endpoints críticos
- Validación de entrada en todas las APIs
- Headers de seguridad configurados
- CORS apropiadamente configurado

### Datos Sensibles
- Variables de entorno para credenciales
- Separación cliente/servidor para API keys
- Encriptación de datos en tránsito

## ⚡ Optimizaciones de Performance

### Frontend
- **Code Splitting**: Carga bajo demanda de componentes
- **Lazy Loading**: Imágenes y componentes diferidos
- **Static Generation**: Páginas pre-renderizadas
- **Edge Runtime**: Funciones serverless optimizadas

### Backend
- **Caching**: Redis para datos frecuentes
- **Database Indexing**: Índices optimizados en Firestore
- **Compression**: Gzip habilitado
- **CDN**: Distribución global de assets

## 🚀 Deployment

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Manual
```bash
pnpm run build
pnpm run start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📊 Monitoreo y Analytics

- **Error Tracking**: Sistema centralizado de errores
- **Performance Monitoring**: Métricas de Core Web Vitals
- **User Analytics**: Seguimiento de interacciones
- **Health Check**: Endpoint `/api/health` para monitoreo

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o reportar bugs:
- Crear issue en GitHub
- Email: soporte@myworkin.com

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat integrado entre candidatos y empleadores
- [ ] Análisis de salarios por mercado
- [ ] Integración con LinkedIn
- [ ] App móvil nativa
- [ ] Sistema de referidos

---

**Desarrollado con ❤️ por el equipo MyWorkIn**
