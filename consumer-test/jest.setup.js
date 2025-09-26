// jest.setup.js
// Configuración global para Jest y Pact

// Timeout más largo para tests de Pact
jest.setTimeout(30000);

// Variables de entorno para tests
process.env.LICENSES_SERVICE_URL = 'http://localhost:3001';

// Configuración global si es necesaria
global.beforeAll = global.beforeAll || (() => {});
global.afterAll = global.afterAll || (() => {});