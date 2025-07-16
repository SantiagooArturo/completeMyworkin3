// lib/firebase-admin.ts
import admin from 'firebase-admin';

// Función para validar las credenciales de Firebase Admin
function getFirebaseAdminCredentials() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está configurado en las variables de entorno');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Validar que tenga los campos requeridos
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!serviceAccount[field]) {
        throw new Error(`Campo requerido '${field}' faltante en las credenciales de Firebase Admin`);
      }
    }
    
    return serviceAccount;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON contiene JSON inválido');
    }
    throw error;
  }
}

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = getFirebaseAdminCredentials();
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    
    console.log('✅ Firebase Admin SDK inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error);
    throw error;
  }
}

export default admin;

// Función helper para buscar usuario por email
export async function getUserByEmail(email: string) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error('Error al buscar usuario por email:', error);
    throw error;
  }
}
