
import { matchPractices } from '@/services/matchPracticesService';
import { MatchPracticesRequest } from '@/services/matchPracticesService';

// Mock del fetch global para interceptar las peticiones
global.fetch = jest.fn();

// Mock de useAuth específico para este test
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user' },
    loading: false,
  }),
}));

describe('matchPractices Service Tests', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('debería enviar correctamente los datos al endpoint externo', async () => {
    // Datos de prueba
    const testData: MatchPracticesRequest = {
      puesto: 'Desarrollador Frontend',
      cv_url: 'https://example.com/cv-test.pdf'
    };

    // Mock de respuesta exitosa
    const mockResponse = {
      practicas: [
        {
          company: 'Test Company',
          title: 'Test Position',
          descripcion: 'Test description',
          location: 'Test Location',
          salary: '$1000',
          url: 'https://test.com/job',
          fecha_agregado: '2024-01-01',
          similitud_requisitos: 85,
          similitud_titulo: 90,
          similitud_experiencia: 80,
          similitud_macro: 88,
          similitud_total: 86,
          justificacion_requisitos: 'Test justification',
          justificacion_titulo: 'Test title justification',
          justificacion_experiencia: 'Test experience justification',
          justificacion_macro: 'Test macro justification'
        }
      ]
    };

    // Configurar mock para devolver una respuesta exitosa
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      status: 200,
      statusText: 'OK'
    } as Response);

    // Ejecutar la función
    const result = await matchPractices(testData);

    // Verificar que fetch fue llamado con los parámetros correctos
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://jobsmatch.onrender.com/match-practices',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      }
    );

    // Verificar que la respuesta es correcta
    expect(result).toEqual(mockResponse);
    expect(result.practicas).toHaveLength(1);
    expect(result.practicas[0].company).toBe('Test Company');
  });

  test('debería validar que cv_url no esté vacío', async () => {
    const testData: MatchPracticesRequest = {
      puesto: 'Desarrollador Frontend',
      cv_url: ''
    };

    await expect(matchPractices(testData)).rejects.toThrow(
      'cv_url es requerido y no puede estar vacío'
    );

    // Verificar que no se hizo ninguna petición HTTP
    expect(fetch).not.toHaveBeenCalled();
  });

  test('debería validar que puesto no esté vacío', async () => {
    const testData: MatchPracticesRequest = {
      puesto: '',
      cv_url: 'https://example.com/cv-test.pdf'
    };

    await expect(matchPractices(testData)).rejects.toThrow(
      'puesto es requerido y no puede estar vacío'
    );

    // Verificar que no se hizo ninguna petición HTTP
    expect(fetch).not.toHaveBeenCalled();
  });

  test('debería manejar errores de red correctamente', async () => {
    const testData: MatchPracticesRequest = {
      puesto: 'Desarrollador Frontend',
      cv_url: 'https://example.com/cv-test.pdf'
    };

    // Mock de error de red
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(matchPractices(testData)).rejects.toThrow('Network error');

    // Verificar que se intentó hacer la petición
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('debería manejar respuestas HTTP no exitosas', async () => {
    const testData: MatchPracticesRequest = {
      puesto: 'Desarrollador Frontend',
      cv_url: 'https://example.com/cv-test.pdf'
    };

    // Mock de respuesta con error HTTP
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Error interno del servidor'
    } as Response);

    await expect(matchPractices(testData)).rejects.toThrow(
      'Error en el servidor: Error interno del servidor'
    );

    // Verificar que se hizo la petición
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});