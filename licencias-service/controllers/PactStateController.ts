// controllers/PactStateController.ts
import type { Request, Response } from 'express';
import { LicensesService } from '../services/licensesService.js';
import { License } from '../models/Licenses.js';

export class PactStateController {
  /**
   * POST /_pactState
   * Configura el estado del proveedor para los tests de Pact
   */
  static async setPactState(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.body;

      if (!state || typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'State parameter is required and must be a string'
        });
        return;
      }

      console.log(`🔧 Setting up Pact state: "${state}"`);

      switch (state) {
        case 'patient 11111111-1 has issued license folio L-1001':
          await setupPatientWithLicense();
          break;

        case 'no licenses for patient 22222222-2':
          await clearPatientLicenses('22222222-2');
          break;

        case 'license L-404 does not exist':
          await removeLicenseByFolio('L-404');
          await removeLicenseByFolio('NOEXIST');
          break;

        case 'issued license days>0 is creatable':
          // No setup específico necesario, las validaciones están siempre activas
          console.log('✅ License creation validation is enabled');
          break;

        case 'license creation validation is enabled':
          // No setup específico necesario, las validaciones están siempre activas
          console.log('✅ License creation validation is ready');
          break;

        default:
          console.log(`⚠️ Unknown Pact state: "${state}"`);
          break;
      }

      res.status(200).json({
        success: true,
        message: `State "${state}" configured successfully`
      });

    } catch (error) {
      console.error('Error setting up Pact state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set up Pact state'
      });
    }
  }
}

// Funciones auxiliares para configurar estados
async function setupPatientWithLicense(): Promise<void> {
  try {
    // Verificar si ya existe la licencia
    const existingLicense = await License.findOne({ folio: 'L-1001' });
    
    if (!existingLicense) {
      // Crear la licencia específica para el test
      const testLicense = new License({
        folio: 'L-1001',
        patientId: '11111111-1',
        doctorId: 'DOC123',
        diagnosis: 'Gripe común',
        startDate: new Date('2025-09-26'),
        days: 7,
        status: 'issued'
      });

      await testLicense.save();
      console.log('✅ Created test license L-1001 for patient 11111111-1');
    } else {
      console.log('ℹ️ Test license L-1001 already exists');
    }
  } catch (error) {
    console.error('Error setting up patient with license:', error);
    throw error;
  }
}

async function clearPatientLicenses(patientId: string): Promise<void> {
  try {
    const result = await License.deleteMany({ patientId });
    console.log(`✅ Cleared ${result.deletedCount} license(s) for patient ${patientId}`);
  } catch (error) {
    console.error(`Error clearing licenses for patient ${patientId}:`, error);
    throw error;
  }
}

async function removeLicenseByFolio(folio: string): Promise<void> {
  try {
    const result = await License.deleteMany({ folio });
    if (result.deletedCount > 0) {
      console.log(`✅ Removed ${result.deletedCount} license(s) with folio ${folio}`);
    } else {
      console.log(`ℹ️ No license found with folio ${folio}`);
    }
  } catch (error) {
    console.error(`Error removing license with folio ${folio}:`, error);
    throw error;
  }
}