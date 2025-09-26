// controllers/PatientController.ts
import type { Request, Response } from 'express';
import { LicenseService, LicenseServiceError } from '../services/LicenseService.js';

export class PatientController {
  /**
   * GET /patient/{patientId}/licenses
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
      const licenses = await LicenseService.getLicensesByPatient(patientId);

      // Responder con las licencias encontradas
      res.status(200).json({
        success: true,
        data: licenses,
        count: licenses.length,
        message: `Found ${licenses.length} license(s) for patient ${patientId}`
      });

    } catch (error) {
      // Manejar errores del servicio de licencias
      if (error instanceof LicenseServiceError) {
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