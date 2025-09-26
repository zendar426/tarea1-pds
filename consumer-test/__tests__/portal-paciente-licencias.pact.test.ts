// __tests__/portal-paciente-licencias.pact.test.ts
import { Pact } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';

describe('Portal Paciente → Licencias Provider', () => {
  const mockProvider = new Pact({
    consumer: 'Portal Paciente',
    provider: 'Licencias Service',
    port: 9002,
    log: path.resolve(__dirname, '..', 'logs', 'portal-paciente-licencias.log'),
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

  describe('GET /licenses', () => {
    test('should return licenses for existing patient', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'patient 11111111-1 has issued license folio L-1001',
        uponReceiving: 'a request for licenses of existing patient',
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
      const response = await axios.get(`http://localhost:9002/licenses`, {
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

    test('should return empty array for patient with no licenses', async () => {
      // Configurar expectativa del mock
      await mockProvider.addInteraction({
        state: 'no licenses for patient 22222222-2',
        uponReceiving: 'a request for licenses of patient with no licenses',
        withRequest: {
          method: 'GET',
          path: '/licenses',
          query: {
            patientId: '22222222-2'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: [],
            count: 0
          }
        }
      });

      // Ejecutar la solicitud real
      const response = await axios.get(`http://localhost:9002/licenses`, {
        params: {
          patientId: '22222222-2'
        }
      });

      // Verificaciones
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveLength(0);
      expect(response.data.count).toBe(0);
    });
  });
});