import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Interfaces para tipado
interface AdminConfig {
  credential: admin.credential.Credential;
  projectId: string;
}

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;
let isInitialized = false;

try {
  // Verificar si ya existe una instancia inicializada
  if (!getApps().length) {
    // Obtener las credenciales del servicio desde las variables de entorno
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está configurado en las variables de entorno');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Configuración de Firebase Admin
    const config: AdminConfig = {
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    };

    // Inicializar Firebase Admin
    const app = admin.initializeApp(config);
    console.log('✅ Firebase Admin inicializado correctamente para proyecto:', serviceAccount.project_id);
  }

  // Obtener las instancias de Firestore y Auth
  adminDb = admin.firestore();
  adminAuth = admin.auth();
  
  // Configurar Firestore con configuraciones adicionales
  adminDb.settings({
    ignoreUndefinedProperties: true,
  });
  
  isInitialized = true;

} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error);
  isInitialized = false;
}

// Funciones helper
export function isAdminInitialized(): boolean {
  return isInitialized;
}

// Función para verificar token de autenticación
export async function verifyIdToken(token: string) {
  if (!isInitialized) throw new Error('Firebase Admin no está inicializado');
  return adminAuth.verifyIdToken(token);
}

// Función para obtener usuario por ID
export async function getUserById(uid: string) {
  if (!isInitialized) throw new Error('Firebase Admin no está inicializado');
  return adminAuth.getUser(uid);
}

// Función para obtener usuario por email
export async function getUserByEmail(email: string) {
  if (!isInitialized) throw new Error('Firebase Admin no está inicializado');
  return adminAuth.getUserByEmail(email);
}

// Función para crear usuario
export async function createUser(userData: admin.auth.CreateRequest) {
  if (!isInitialized) throw new Error('Firebase Admin no está inicializado');
  return adminAuth.createUser(userData);
}

// Función para actualizar usuario
export async function updateUser(uid: string, userData: admin.auth.UpdateRequest) {
  if (!isInitialized) throw new Error('Firebase Admin no está inicializado');
  return adminAuth.updateUser(uid, userData);
}

// Función para eliminar usuario
export async function deleteUser(uid: string) {
  if (!isInitialized) throw new Error('Firebase Admin no está inicializado');
  return adminAuth.deleteUser(uid);
}

export { adminDb, adminAuth };