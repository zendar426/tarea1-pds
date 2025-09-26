#!/usr/bin/env node

// verify-provider.js
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

const opts = {
  providerBaseUrl: process.env.PACT_PROVIDER_URL || 'http://licencias:3001',
  provider: process.env.PACT_PROVIDER_NAME || 'Licencias Service',
  
  // Directorio donde están los contratos Pact
  pactUrls: [
    path.resolve('./pacts/medico_app-licencias_service.json'),
    path.resolve('./pacts/portal_paciente-licencias_service.json'),
    path.resolve('./pacts/validador_aseguradora-licencias_service.json')
  ],
  
  // URL para configurar los provider states
  providerStatesSetupUrl: `${process.env.PACT_PROVIDER_URL || 'http://licencias:3001'}/_pactState`,
  
  // Configuración de logs y timeouts
  logLevel: 'INFO',
  timeout: 30000,
  
  // Permitir pendientes
  publishVerificationResult: false,
  
  // Configuración adicional
  verbose: true
};

console.log('🔍 Iniciando verificación de contratos Pact...');
console.log(`📍 Provider URL: ${opts.providerBaseUrl}`);
console.log(`📄 Contratos a verificar: ${opts.pactUrls.length}`);
console.log(`🔧 Provider States URL: ${opts.providerStatesSetupUrl}`);

// Ejecutar verificación
new Verifier(opts)
  .verifyProvider()
  .then(() => {
    console.log('✅ Verificación de contratos Pact exitosa!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verificación de contratos Pact falló:', error);
    process.exit(1);
  });