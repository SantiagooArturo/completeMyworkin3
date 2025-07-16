/**
 * Sistema centralizado de manejo de errores para MyWorkIn
 * Proporciona clases de error específicas y utilidades de logging
 */

export enum ErrorCode {
  // Errores de autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Errores de validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Errores de servicios externos
  OPENAI_ERROR = 'OPENAI_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  MERCADOPAGO_ERROR = 'MERCADOPAGO_ERROR',
  
  // Errores de CV
  CV_GENERATION_ERROR = 'CV_GENERATION_ERROR',
  CV_ANALYSIS_ERROR = 'CV_ANALYSIS_ERROR',
  CV_NOT_FOUND = 'CV_NOT_FOUND',
  
  // Errores de sistema
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp?: string;
  requestId?: string;
  userId?: string;
}

/**
 * Clase base para errores personalizados de la aplicación
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly requestId?: string;
  public readonly userId?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    requestId?: string,
    userId?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
    this.userId = userId;

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId
    };
  }
}

/**
 * Errores específicos para diferentes servicios
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any, requestId?: string) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details, requestId);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autorizado', details?: any, requestId?: string) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details, requestId);
    this.name = 'AuthenticationError';
  }
}

export class OpenAIError extends AppError {
  constructor(message: string, details?: any, requestId?: string) {
    super(ErrorCode.OPENAI_ERROR, message, 503, details, requestId);
    this.name = 'OpenAIError';
  }
}

export class CVError extends AppError {
  constructor(code: ErrorCode, message: string, details?: any, requestId?: string) {
    const statusCode = code === ErrorCode.CV_NOT_FOUND ? 404 : 422;
    super(code, message, statusCode, details, requestId);
    this.name = 'CVError';
  }
}

export class FirebaseError extends AppError {
  constructor(message: string, details?: any, requestId?: string) {
    super(ErrorCode.FIREBASE_ERROR, message, 503, details, requestId);
    this.name = 'FirebaseError';
  }
}

/**
 * Utilidades para logging de errores
 */
export class ErrorLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static log(error: Error | AppError, context?: string): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        ...(error instanceof AppError ? error.toJSON() : {})
      }
    };

    if (this.isDevelopment) {
      console.error('🚨 Error:', JSON.stringify(logData, null, 2));
    } else {
      console.error('🚨 Error:', JSON.stringify(logData));
    }

    // En producción, aquí se enviaría a un servicio de monitoring
    // como Sentry, LogRocket, etc.
  }

  static logWarning(message: string, context?: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, context, message, details };

    if (this.isDevelopment) {
      console.warn('⚠️ Warning:', JSON.stringify(logData, null, 2));
    } else {
      console.warn('⚠️ Warning:', JSON.stringify(logData));
    }
  }

  static logInfo(message: string, context?: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, context, message, details };

    if (this.isDevelopment) {
      console.info('ℹ️ Info:', JSON.stringify(logData, null, 2));
    } else {
      console.info('ℹ️ Info:', JSON.stringify(logData));
    }
  }
}

/**
 * Middleware para manejo de errores en APIs
 */
export function createErrorResponse(error: Error | AppError, requestId?: string): Response {
  // Si no es un AppError, convertirlo
  if (!(error instanceof AppError)) {
    ErrorLogger.log(error, 'Unhandled Error');
    
    const appError = new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Error interno del servidor',
      500,
      ErrorLogger['isDevelopment'] ? error.message : undefined,
      requestId
    );
    
    return new Response(
      JSON.stringify(appError.toJSON()),
      {
        status: appError.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Log del error
  ErrorLogger.log(error, 'API Error');

  // Crear respuesta
  const errorResponse = error.toJSON();
  
  // En producción, no exponer detalles sensibles
  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    delete errorResponse.details;
  }

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Utilidad para generar IDs de request únicos
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}