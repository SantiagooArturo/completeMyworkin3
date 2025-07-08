# Variables de entorno necesarias para la funcionalidad de presigned URLs

# Cloudflare R2 Configuration (para presigned URLs)
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id

# O usar las variables existentes del sistema (si prefieres mantener compatibilidad)
# R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
# R2_ACCESS_KEY_ID=your-access-key-id
# R2_SECRET_ACCESS_KEY=your-secret-access-key
# R2_BUCKET_NAME=your-bucket-name
# R2_ACCOUNT_ID=your-account-id

# Nota: Puedes usar cualquiera de los dos sets de variables
# El código está configurado para usar CLOUDFLARE_R2_* por defecto
