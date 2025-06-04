# 🚀 Guía de Deployment - MyWorkIn

Esta guía detallada te ayudará a desplegar MyWorkIn en diferentes entornos de producción.

## 📋 Pre-requisitos de Deployment

### Cuentas y Servicios Necesarios
- [ ] **Vercel Account** (recomendado para hosting)
- [ ] **Firebase Project** configurado
- [ ] **OpenAI API Key** con créditos suficientes
- [ ] **MercadoPago Account** para pagos
- [ ] **Dominio personalizado** (opcional)

### Verificaciones Pre-Deployment
```bash
# Verificar que el build funciona localmente
pnpm run build
pnpm run start

# Verificar tipos TypeScript
pnpm run type-check

# Verificar linting
pnpm run lint
```

## 🌐 Deployment en Vercel (Recomendado)

### Paso 1: Preparar el Repositorio
```bash
# Asegurar que todos los cambios estén en git
git add .
git commit -m "Preparar para deployment"
git push origin main
```

### Paso 2: Conectar a Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Conectar cuenta con GitHub/GitLab
3. Importar proyecto MyWorkIn
4. Configurar como Next.js project

### Paso 3: Configurar Variables de Entorno
En Vercel Dashboard → Settings → Environment Variables:

```env
# Production Environment Variables
OPENAI_API_KEY=sk-...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
MP_ACCESS_TOKEN=TEST-... (o PROD-... para producción)
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-... (o tu clave real)
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
NODE_ENV=production

# Build Configuration
NEXT_TELEMETRY_DISABLED=1
```

### Paso 4: Configurar Build Settings
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install --frozen-lockfile",
  "devCommand": "pnpm run dev"
}
```

### Paso 5: Deploy
```bash
# Automático con cada push a main
git push origin main

# O manual desde Vercel CLI
npx vercel --prod
```

## 🐳 Deployment con Docker

### Dockerfile Optimizado
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pnpm
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose para Desarrollo
```yaml
version: '3.8'

services:
  myworkin:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SITE_URL=http://localhost:3000
    env_file:
      - .env.local
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### Comandos Docker
```bash
# Build imagen
docker build -t myworkin:latest .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local myworkin:latest

# Con Docker Compose
docker-compose up -d
```

## ☁️ Deployment en AWS

### EC2 + PM2
```bash
# En instancia EC2
sudo apt update
sudo apt install nodejs npm

# Instalar pnpm y PM2
npm install -g pnpm pm2

# Clonar repositorio
git clone <repo-url>
cd myworkinweb

# Instalar y construir
pnpm install
pnpm run build

# Configurar PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'myworkin',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/myworkinweb',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Lambda + Serverless
```yaml
# serverless.yml
service: myworkin

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    nextConfigDir: './'
```

## 🔧 Configuraciones Post-Deployment

### 1. Firebase Configuration
```javascript
// Configurar reglas de Firestore para producción
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // CVs protegidos por usuario
    match /cvs/{cvId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Empleos públicos para lectura, protegidos para escritura
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null 
        && hasRole(request.auth.uid, 'employer');
    }
  }
}
```

### 2. MercadoPago Webhooks
```bash
# Configurar webhook en MercadoPago
curl -X POST \
  https://api.mercadopago.com/v1/webhooks \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://tu-dominio.com/api/mercadopago/webhook",
    "events": ["payment.created", "payment.updated"]
  }'
```

### 3. Dominio Personalizado
```bash
# En Vercel
vercel domains add tu-dominio.com
vercel domains verify tu-dominio.com

# Configurar DNS
# A record: @ → 76.76.19.61
# CNAME: www → cname.vercel-dns.com
```

## 📊 Monitoreo Post-Deployment

### Health Check Endpoint
```javascript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verificar conexiones críticas
    const checks = {
      database: await checkFirestore(),
      openai: await checkOpenAI(),
      mercadopago: await checkMercadoPago(),
      timestamp: new Date().toISOString()
    };
    
    return Response.json({
      status: 'healthy',
      checks
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

### Configurar Alertas
```bash
# Uptime monitoring
curl -X POST https://api.uptimerobot.com/v2/newMonitor \
  -d "api_key=YOUR_API_KEY" \
  -d "friendly_name=MyWorkIn Health" \
  -d "url=https://tu-dominio.com/api/health" \
  -d "type=1"
```

## 🔐 Configuraciones de Seguridad

### 1. HTTPS y SSL
```javascript
// next.config.js - Headers de seguridad
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

### 2. Rate Limiting
```javascript
// Configurar Vercel Edge Config para rate limiting
const rateLimit = new Map();

export function rateLimitCheck(ip: string, limit = 100) {
  const now = Date.now();
  const window = 60000; // 1 minuto
  
  const requests = rateLimit.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < window);
  
  if (recentRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
}
```

## 🧪 Testing en Producción

### Smoke Tests Post-Deployment
```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="https://tu-dominio.com"

echo "🧪 Ejecutando smoke tests..."

# Test 1: Health check
curl -f "$BASE_URL/api/health" || exit 1
echo "✅ Health check passed"

# Test 2: Homepage
curl -f "$BASE_URL" || exit 1
echo "✅ Homepage accessible"

# Test 3: API endpoints
curl -f "$BASE_URL/api/cv/templates" || exit 1
echo "✅ API endpoints working"

echo "🎉 Todos los smoke tests pasaron!"
```

## 📈 Optimizaciones Post-Deployment

### 1. CDN Configuration
```javascript
// Configurar Cache-Control headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Cache static assets por 1 año
  if (request.nextUrl.pathname.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Cache API responses por 5 minutos
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300');
  }
  
  return response;
}
```

### 2. Database Indexing
```javascript
// Crear índices en Firestore
const indexes = [
  { collection: 'jobs', fields: ['category', 'location', 'createdAt'] },
  { collection: 'users', fields: ['email', 'verified'] },
  { collection: 'cvs', fields: ['userId', 'updatedAt'] }
];
```

## 🚨 Troubleshooting Común

### Error: Build Failures
```bash
# Limpiar cache y reinstalar
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Error: Environment Variables
```bash
# Verificar variables en Vercel
vercel env ls

# Agregar variable faltante
vercel env add VARIABLE_NAME
```

### Error: Firebase Connection
```bash
# Verificar formato JSON de service account
node -e "console.log(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))"
```

### Error: OpenAI Rate Limits
```javascript
// Implementar retry con backoff
const retryWithBackoff = async (fn, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};
```

## 📋 Checklist de Deployment

### Pre-Deploy
- [ ] Tests locales pasan
- [ ] Build exitoso localmente
- [ ] Variables de entorno configuradas
- [ ] Firebase rules actualizadas
- [ ] OpenAI quota verificada

### Deploy
- [ ] Repositorio actualizado
- [ ] Variables de entorno en plataforma
- [ ] Dominio configurado
- [ ] SSL/HTTPS habilitado

### Post-Deploy
- [ ] Health check funciona
- [ ] Smoke tests pasan
- [ ] Monitoring configurado
- [ ] Backup strategy implementada
- [ ] Rollback plan preparado

---

**¡Deployment exitoso! 🎉**

Para soporte: soporte@myworkin.com
