// __tests__/validador-aseguradora-licencias.pact.test.ts
import { Pact } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

describe('Validador Aseguradora → Licencias Provider', () => {
  const mockProvider = new Pact({
    consumer: 'Validador Aseguradora',
    provider: 'Licencias Service',
    port: 9003,
    log: path.resolve(__dirname, '..', 'logs', 'validador-aseguradora-licencias.log'),
    dir: path.resolve(__dirname, '..', '..', 'pacts'),
    logLevel: 'info'
  });

  beforeAll(async () => {
    await mockProvider.setup();
  });

  afterAll(async () => {
    await mockProvider.finalize();
  });

  afterEach(async () => {
    await mockProvider.verify();
  });

  describe('GET /licenses/{folio}/verify', () => {
    test('should return valid=true for existing issued license', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'patient 11111111-1 has issued license folio L-1001',
        uponReceiving: 'a request to verify an existing issued license',
        withRequest: {
          method: 'GET',
          path: '/licenses/L-1001/verify'
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              valid: true
            },
            message: 'License is valid'
          }
        }
      });

      // Ejecutar la solicitud real
      const response = await axios.get(`http://localhost:9003/licenses/L-1001/verify`);

      // Verificaciones
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.valid).toBe(true);
    });

    test('should return valid=false for non-existing license', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'license L-404 does not exist',
        uponReceiving: 'a request to verify a non-existing license',
        withRequest: {
          method: 'GET',
          path: '/licenses/NOEXIST/verify'
        },
        willRespondWith: {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              valid: false
            },
            message: 'License is invalid or not found'
          }
        }
      });

      // Ejecutar la solicitud real - esperamos 404 pero con valid: false
      try {
        const response = await axios.get(`http://localhost:9003/licenses/NOEXIST/verify`);
        
        // Si no hay excepción, verificamos la respuesta
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(true);
        expect(response.data.data.valid).toBe(false);
      } catch (error: any) {
        // Si hay excepción por el 404, verificamos que la data sea correcta
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(true);
        expect(error.response.data.data.valid).toBe(false);
      }
    });
  });

  describe('GET /licenses?patientId={id}', () => {
    test('should return patient licenses for validation purposes', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'patient 11111111-1 has issued license folio L-1001',
        uponReceiving: 'a request for patient licenses for validation',
        withRequest: {
          method: 'GET',
          path: '/licenses',
          query: {
            patientId: '11111111-1'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: [
              {
                folio: 'L-1001',
                patientId: '11111111-1',
                doctorId: 'DOC123',
                diagnosis: 'Gripe común',
                startDate: '2025-09-26T00:00:00.000Z',
                days: 7,
                status: 'issued',
                createdAt: '2025-09-26T10:30:00.000Z'
              }
            ],
            count: 1
          }
        }
      });

      // Ejecutar la solicitud real
      const response = await axios.get(`http://localhost:9003/licenses`, {
        params: {
          patientId: '11111111-1'
        }
      });

      // Verificaciones
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].folio).toBe('L-1001');
      expect(response.data.data[0].patientId).toBe('11111111-1');
      expect(response.data.data[0].status).toBe('issued');
      expect(response.data.count).toBe(1);
    });
  });
});