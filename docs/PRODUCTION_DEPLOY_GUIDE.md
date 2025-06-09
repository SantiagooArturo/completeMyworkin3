# Guía de Deploy del Sistema Asíncrono - Producción

## 🚀 INSTRUCCIONES DE DEPLOY

### Pre-requisitos de Producción
```bash
# Variables de entorno requeridas en producción
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Firebase Admin SDK (para APIs)
FIREBASE_SERVICE_ACCOUNT_JSON=tu_service_account_json

# MercadoPago (si usas pagos)
MP_ACCESS_TOKEN=tu_mp_token
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# OpenAI API (para análisis de CV)
OPENAI_API_KEY=tu_openai_key
```

### Pasos de Deploy

#### 1. Verificación Pre-Deploy
```bash
# Verificar que no hay errores
pnpm run build

# Verificar tipos
pnpm run type-check

# Verificar linting
pnpm run lint
```

#### 2. Deploy del Backend
- ✅ **Firebase Functions**: Las APIs ya están como API Routes de Next.js
- ✅ **Firebase Firestore**: Configurado para tracking de jobs
- ✅ **Firebase Storage**: Para subida de PDFs

#### 3. Deploy del Frontend
```bash
# Build de producción
pnpm run build

# Deploy (según tu plataforma)
# Vercel:
vercel --prod

# Netlify:
netlify deploy --prod

# Railway/Render:
git push origin main
```

### Configuración de Firebase en Producción

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Jobs de análisis CV - solo el usuario propietario
    match /cvAnalysisJobs/{jobId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Perfiles de usuario
    match /userCVProfiles/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Transacciones de créditos
    match /creditTransactions/{transactionId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow write: if false; // Solo APIs del servidor
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cv-uploads/{userId}/{fileName} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### Monitoreo Post-Deploy

#### 1. Verificaciones Inmediatas
- [ ] **Homepage**: `https://tu-dominio.com` carga correctamente
- [ ] **Análisis CV**: `https://tu-dominio.com/analizar-cv` funciona
- [ ] **APIs**: Verificar endpoints de análisis asíncrono
- [ ] **Firebase**: Conexión a Firestore funcionando

#### 2. Testing de Flujo Completo
```bash
# Test de análisis asíncrono
1. Subir PDF válido
2. Verificar job en Firestore
3. Confirmar progreso en tiempo real
4. Validar resultado final
```

#### 3. Métricas a Monitorear
- **Tiempo promedio de análisis**: < 2 minutos
- **Rate de éxito de jobs**: > 95%
- **Errores de timeout**: Debería ser 0%
- **Uso de créditos**: Funcionando correctamente

### Rollback Plan

#### Si hay problemas críticos:
1. **Rollback inmediato**:
   ```bash
   # Revertir a versión anterior
   git revert HEAD
   git push origin main
   ```

2. **Fallback temporal**:
   - El sistema anterior aún existe en `/api/proxy-analizar-cv`
   - Se puede reactivar modificando `/app/analizar-cv/page.tsx`

3. **Diagnóstico**:
   ```bash
   # Logs de Next.js
   vercel logs

   # Logs de Firebase
   firebase functions:log
   ```

### Optimizaciones Post-Deploy

#### Performance
- [ ] **CDN**: Configurar para assets estáticos
- [ ] **Caching**: Headers apropiados para APIs
- [ ] **Compression**: Gzip/Brotli habilitado

#### Seguridad
- [ ] **CORS**: Configurado apropiadamente
- [ ] **Rate Limiting**: Para APIs públicas
- [ ] **Sanitización**: Input validation en APIs

#### Escalabilidad
- [ ] **Database**: Índices optimizados en Firestore
- [ ] **Storage**: Limpieza automática de archivos antiguos
- [ ] **Jobs**: Queue management para análisis masivos

---

## 🚨 PUNTOS CRÍTICOS

### 1. Timeouts Eliminados
- ✅ **Antes**: Análisis síncronos que fallaban en 30s
- ✅ **Ahora**: Sistema asíncrono sin límites de tiempo

### 2. Experiencia de Usuario
- ✅ **Progreso en tiempo real** via Firebase listeners
- ✅ **Estados de carga** apropiados
- ✅ **Manejo de errores** en español

### 3. Sistema de Créditos
- ✅ **Integrado** con análisis asíncrono
- ✅ **Transacciones** atómicas
- ✅ **Verificación** antes del análisis

---

**El sistema está listo para producción y eliminará los problemas de timeout completamente.**
