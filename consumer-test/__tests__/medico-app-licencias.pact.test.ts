// __tests__/medico-app-licencias.pact.test.ts
import { Pact } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

describe('Medico App → Licencias Provider', () => {
  const mockProvider = new Pact({
    consumer: 'Medico App',
    provider: 'Licencias Service',
    port: 9001,
    log: path.resolve(__dirname, '..', 'logs', 'medico-app-licencias.log'),
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

  describe('POST /licenses', () => {
    test('should create license successfully with valid days', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'issued license days>0 is creatable',
        uponReceiving: 'a request to create a license with valid days',
        withRequest: {
          method: 'POST',
          path: '/licenses',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            patientId: '11111111-1',
            doctorId: 'DOC123',
            diagnosis: 'Gripe común',
            startDate: '2025-09-26',
            days: 7
          }
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              folio: 'LIC-1727343000000-ABC123',
              patientId: '11111111-1',
              doctorId: 'DOC123',
              diagnosis: 'Gripe común',
              startDate: '2025-09-26T00:00:00.000Z',
              days: 7,
              status: 'issued'
            },
            message: 'License created successfully'
          }
        }
      });

      // Ejecutar la solicitud real
      const response = await axios.post(`http://localhost:9001/licenses`, {
        patientId: '11111111-1',
        doctorId: 'DOC123',
        diagnosis: 'Gripe común',
        startDate: '2025-09-26',
        days: 7
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Verificaciones
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.folio).toBeTruthy();
      expect(response.data.data.patientId).toBe('11111111-1');
      expect(response.data.data.doctorId).toBe('DOC123');
      expect(response.data.data.diagnosis).toBe('Gripe común');
      expect(response.data.data.days).toBe(7);
      expect(response.data.data.status).toBe('issued');
    });

    test('should reject license creation with invalid days (days=0)', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'license creation validation is enabled',
        uponReceiving: 'a request to create a license with invalid days (0)',
        withRequest: {
          method: 'POST',
          path: '/licenses',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            patientId: '11111111-1',
            doctorId: 'DOC123',
            diagnosis: 'Gripe común',
            startDate: '2025-09-26',
            days: 0
          }
        },
        willRespondWith: {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: false,
            error: 'Days must be a positive integer greater than 0',
            code: 'INVALID_DAYS'
          }
        }
      });

      // Ejecutar la solicitud real y esperar que falle
      try {
        await axios.post(`http://localhost:9001/licenses`, {
          patientId: '11111111-1',
          doctorId: 'DOC123',
          diagnosis: 'Gripe común',
          startDate: '2025-09-26',
          days: 0
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Si llegamos aquí, el test debería fallar
        fail('Expected request to fail with 400 status');
      } catch (error: any) {
        // Verificaciones
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.code).toBe('INVALID_DAYS');
      }
    });
  });
});