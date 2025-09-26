// controllers/InsurerController.ts
import type { Request, Response } from 'express';
import { LicenseValidatorService, LicenseValidatorError } from '../services/LicenseValidatorService.js';

export class InsurerController {
  /**
   * GET /insurer/licenses/{folio}/verify
   * Verifica la validez de una licencia médica
   */
  static async verifyLicense(req: Request, res: Response): Promise<void> {
    try {
      const { folio } = req.params;

      // Validar que el folio esté presente
      if (!folio) {
        res.status(400).json({
          success: false,
          error: 'folio is required',
          code: 'MISSING_FOLIO'
        });
        return;
      }

      // Verificar la licencia usando el servicio
      const verification = await LicenseValidatorService.verifyLicense(folio);

      // Responder con el resultado de la verificación
      res.status(200).json({
        success: true,
        data: verification,
        message: verification.valid 
          ? `License ${folio} is valid` 
          : `License ${folio} is invalid or not found`
      });

    } catch (error) {
      // Manejar errores del servicio validador
      if (error instanceof LicenseValidatorError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code
        });
        return;
      }

      // Manejar otros errores
      console.error('Error verifying license:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify license'
      });
    }
  }

  /**
   * GET /insurer/patients/{patientId}/licenses
   * Obtiene todas las licencias de un paciente específico
   */
  static async getPatientLicenses(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;

      // Validar que el patientId esté presente
      if (!patientId) {
        res.status(400).json({
          success: false,
          error: 'patientId is required',
          code: 'MISSING_PATIENT_ID'
        });
        return;
      }

      // Obtener las licencias usando el servicio
      const licenses = await LicenseValidatorService.getPatientLicenses(patientId);

      // Responder con las licencias encontradas
      res.status(200).json({
        success: true,
        data: licenses,
        count: licenses.length,
        message: `Found ${licenses.length} license(s) for patient ${patientId}`
      });

    } catch (error) {
      // Manejar errores del servicio validador
      if (error instanceof LicenseValidatorError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code
        });
        return;
      }

      // Manejar otros errores
      console.error('Error getting patient licenses:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve patient licenses'
      });
    }
  }
}