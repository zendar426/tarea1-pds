// services/LicenseService.ts
import axios, { type AxiosResponse } from 'axios';
import type { License, ApiResponse, ErrorResponse } from '../types/License.js';

export class LicenseServiceError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'LicenseServiceError';
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
  }
}

export class LicenseService {
  private static readonly LICENSES_SERVICE_URL = process.env.LICENSES_SERVICE_URL || 'http://localhost:3001';

  /**
   * Obtiene todas las licencias de un paciente desde el servicio de licencias
   */
  static async getLicensesByPatient(patientId: string): Promise<License[]> {
    if (!patientId || typeof patientId !== 'string' || patientId.trim().length === 0) {
      throw new LicenseServiceError('patientId is required and must be a non-empty string', 400, 'INVALID_PATIENT_ID');
    }

    try {
      const response: AxiosResponse<ApiResponse<License[]>> = await axios.get(
        `${this.LICENSES_SERVICE_URL}/licenses`,
        {
          params: { patientId: patientId.trim() },
          timeout: 5000
        }
      );

      if (!response.data.success) {
        throw new LicenseServiceError('Failed to retrieve licenses', 500, 'SERVICE_ERROR');
      }

      return response.data.data;

    } catch (error) {
      if (error instanceof LicenseServiceError) {
        throw error;
      }

      // Manejar errores de axios
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un error
          const statusCode = error.response.status;
          const errorData = error.response.data as ErrorResponse;
          
          throw new LicenseServiceError(
            errorData.error || 'License service error',
            statusCode,
            errorData.code
          );
        } else if (error.request) {
          // La request se hizo pero no hubo respuesta
          throw new LicenseServiceError(
            'License service is unavailable',
            503,
            'SERVICE_UNAVAILABLE'
          );
        } else {
          // Error al configurar la request
          throw new LicenseServiceError(
            'Failed to communicate with license service',
            500,
            'COMMUNICATION_ERROR'
          );
        }
      }

      // Error desconocido
      throw new LicenseServiceError(
        'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }
}