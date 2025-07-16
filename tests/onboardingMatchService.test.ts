import { OnboardingMatchService } from '@/services/onboardingMatchService';
import { matchPractices } from '@/services/matchPracticesService';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock de las dependencias
jest.mock('@/services/matchPracticesService');
jest.mock('firebase/firestore');

// Mock del fetch global
global.fetch = jest.fn();

describe('OnboardingMatchService Tests', () => {
  const mockUserId = 'test-user-123';
  const mockMatchQuery = {
    puesto: 'Desarrollador Frontend',
    cv_url: 'https://example.com/cv-test.pdf'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log mock
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('debería usar práticas guardadas cuando existe un match reciente', async () => {
    const mockExistingMatch = {
      practices: [
        {
          company: 'Cached Company',
          title: 'Cached Position',
          descripcion: 'Cached description',
          location: 'Cached Location',
          salary: '$1500',
          url: 'https://cached.com/job',
          fecha_agregado: '2024-01-01',
          similitud_requisitos: 90,
          similitud_titulo: 95,
          similitud_experiencia: 85,
          similitud_macro: 88,
          similitud_total: 90,
          justificacion_requisitos: 'Cached justification',
          justificacion_titulo: 'Cached title justification',
          justificacion_experiencia: 'Cached experience justification',
          justificacion_macro: 'Cached macro justification'
        }
      ],
      source: 'cache' as const,
      timestamp: new Date(),
      matchQuery: mockMatchQuery
    };

    // Mock de documento existente en Firestore
    (getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        ...mockExistingMatch,
        timestamp: {
          toDate: () => new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
        }
      })
    } as any);

    const result = await OnboardingMatchService.executeMatchWithRetry(mockMatchQuery, mockUserId);

    expect(result.source).toBe('cache');
    expect(result.practices).toHaveLength(1);
    expect(result.practices[0].company).toBe('Cached Company');
    
    // Verificar que no se llamó al servicio externo
    expect(matchPractices).not.toHaveBeenCalled();
  });

  test('debería hacer nueva petición cuando no existe match reciente', async () => {
    const mockApiResponse = {
      practicas: [
        {
          company: 'New Company',
          title: 'New Position',
          descripcion: 'New description',
          location: 'New Location',
          salary: '$2000',
          url: 'https://new.com/job',
          fecha_agregado: '2024-01-01',
          similitud_requisitos: 95,
          similitud_titulo: 92,
          similitud_experiencia: 88,
          similitud_macro: 90,
          similitud_total: 91,
          justificacion_requisitos: 'New justification',
          justificacion_titulo: 'New title justification',
          justificacion_experiencia: 'New experience justification',
          justificacion_macro: 'New macro justification'
        }
      ]
    };

    // Mock de documento no existente
    (getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValueOnce({
      exists: () => false
    } as any);

    // Mock de respuesta exitosa del servicio
    (matchPractices as jest.MockedFunction<typeof matchPractices>).mockResolvedValueOnce(mockApiResponse);

    // Mock de setDoc para guardar el resultado
    (setDoc as jest.MockedFunction<typeof setDoc>).mockResolvedValueOnce(undefined);

    const result = await OnboardingMatchService.executeMatchWithRetry(mockMatchQuery, mockUserId);

    expect(result.source).toBe('api');
    expect(result.practices).toHaveLength(1);
    expect(result.practices[0].company).toBe('New Company');
    
    // Verificar que se llamó al servicio externo con los datos correctos
    expect(matchPractices).toHaveBeenCalledWith(mockMatchQuery);
    expect(matchPractices).toHaveBeenCalledTimes(1);
    
    // Verificar que se guardó el resultado en Firestore
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        practices: mockApiResponse.practicas,
        source: 'api',
        matchQuery: mockMatchQuery,
        timestamp: expect.any(Date),
        retryCount: 0
      })
    );
  });

  test('debería hacer retry cuando el primer intento falla', async () => {
    // Mock de documento no existente
    (getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValueOnce({
      exists: () => false
    } as any);

    // Mock de primer intento que falla
    (matchPractices as jest.MockedFunction<typeof matchPractices>)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        practicas: [
          {
            company: 'Retry Company',
            title: 'Retry Position',
            descripcion: 'Retry description',
            location: 'Retry Location',
            salary: '$1800',
            url: 'https://retry.com/job',
            fecha_agregado: '2024-01-01',
            similitud_requisitos: 88,
            similitud_titulo: 85,
            similitud_experiencia: 90,
            similitud_macro: 87,
            similitud_total: 88,
            justificacion_requisitos: 'Retry justification',
            justificacion_titulo: 'Retry title justification',
            justificacion_experiencia: 'Retry experience justification',
            justificacion_macro: 'Retry macro justification'
          }
        ]
      });

    // Mock de setDoc
    (setDoc as jest.MockedFunction<typeof setDoc>).mockResolvedValueOnce(undefined);

    const result = await OnboardingMatchService.executeMatchWithRetry(mockMatchQuery, mockUserId);

    expect(result.source).toBe('api');
    expect(result.practices).toHaveLength(1);
    expect(result.practices[0].company).toBe('Retry Company');
    
    // Verificar que se llamó dos veces al servicio (retry)
    expect(matchPractices).toHaveBeenCalledTimes(2);
    
    // Verificar que se guardó con retryCount = 1
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        source: 'api',
        retryCount: 1
      })
    );
  });

  test('debería usar prácticas mock cuando ambos intentos fallan', async () => {
    // Mock de documento no existente
    (getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValueOnce({
      exists: () => false
    } as any);

    // Mock de ambos intentos que fallan
    (matchPractices as jest.MockedFunction<typeof matchPractices>)
      .mockRejectedValueOnce(new Error('First error'))
      .mockRejectedValueOnce(new Error('Second error'));

    // Mock de setDoc
    (setDoc as jest.MockedFunction<typeof setDoc>).mockResolvedValueOnce(undefined);

    const result = await OnboardingMatchService.executeMatchWithRetry(mockMatchQuery, mockUserId);

    expect(result.source).toBe('mock');
    expect(result.practices.length).toBeGreaterThan(0);
    
    // Verificar que se llamó dos veces al servicio (primer intento + retry)
    expect(matchPractices).toHaveBeenCalledTimes(2);
    
    // Verificar que se guardó con source = 'mock' y retryCount = 2
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        source: 'mock',
        retryCount: 2
      })
    );
  });

  test('debería rechazar match muy antiguo (más de 2 horas)', async () => {
    // Mock de documento con timestamp muy antiguo
    (getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        practices: [],
        source: 'cache',
        matchQuery: mockMatchQuery,
        timestamp: {
          toDate: () => new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 horas atrás
        }
      })
    } as any);

    // Mock de nueva petición
    (matchPractices as jest.MockedFunction<typeof matchPractices>).mockResolvedValueOnce({
      practicas: [
        {
          company: 'Fresh Company',
          title: 'Fresh Position',
          descripcion: 'Fresh description',
          location: 'Fresh Location',
          salary: '$2200',
          url: 'https://fresh.com/job',
          fecha_agregado: '2024-01-01',
          similitud_requisitos: 92,
          similitud_titulo: 88,
          similitud_experiencia: 85,
          similitud_macro: 90,
          similitud_total: 89,
          justificacion_requisitos: 'Fresh justification',
          justificacion_titulo: 'Fresh title justification',
          justificacion_experiencia: 'Fresh experience justification',
          justificacion_macro: 'Fresh macro justification'
        }
      ]
    });

    // Mock de setDoc
    (setDoc as jest.MockedFunction<typeof setDoc>).mockResolvedValueOnce(undefined);

    const result = await OnboardingMatchService.executeMatchWithRetry(mockMatchQuery, mockUserId);

    expect(result.source).toBe('api');
    expect(result.practices[0].company).toBe('Fresh Company');
    
    // Verificar que se hizo nueva petición porque el cache era muy antiguo
    expect(matchPractices).toHaveBeenCalledWith(mockMatchQuery);
  });

  test('debería validar que los datos enviados al endpoint sean correctos', async () => {
    // Mock de documento no existente
    (getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValueOnce({
      exists: () => false
    } as any);

    // Mock de respuesta exitosa
    (matchPractices as jest.MockedFunction<typeof matchPractices>).mockResolvedValueOnce({
      practicas: []
    });

    // Mock de setDoc
    (setDoc as jest.MockedFunction<typeof setDoc>).mockResolvedValueOnce(undefined);

    await OnboardingMatchService.executeMatchWithRetry(mockMatchQuery, mockUserId);

    // Verificar que se llamó con los datos exactos
    expect(matchPractices).toHaveBeenCalledWith({
      puesto: 'Desarrollador Frontend',
      cv_url: 'https://example.com/cv-test.pdf'
    });
  });
});