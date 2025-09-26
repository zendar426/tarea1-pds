// services/LicenseValidatorService.ts
import axios, { type AxiosResponse } from 'axios';
import type { License, VerificationResult, ApiResponse, ErrorResponse } from '../types/License.js';

export class LicenseValidatorError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'LicenseValidatorError';
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
  }
}

export class LicenseValidatorService {
  private static readonly LICENSES_SERVICE_URL = process.env.LICENSES_SERVICE_URL || 'http://localhost:3001';

  /**
   * Verifica la validez de una licencia desde el servicio de licencias
   */
  static async verifyLicense(folio: string): Promise<VerificationResult> {
    if (!folio || typeof folio !== 'string' || folio.trim().length === 0) {
      throw new LicenseValidatorError('folio is required and must be a non-empty string', 400, 'INVALID_FOLIO');
    }

    try {
      const response: AxiosResponse<ApiResponse<VerificationResult>> = await axios.get(
        `${this.LICENSES_SERVICE_URL}/licenses/${folio}/verify`,
        {
          timeout: 5000
        }
      );

      if (!response.data.success) {
        throw new LicenseValidatorError('Failed to verify license', 500, 'SERVICE_ERROR');
      }

      return response.data.data;

    } catch (error) {
      if (error instanceof LicenseValidatorError) {
        throw error;
      }

      // Manejar errores de axios
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un error
          const statusCode = error.response.status;
          
          // Si es 404, significa que la licencia no existe, pero esto es válido
          if (statusCode === 404) {
            return { valid: false };
          }

          const errorData = error.response.data as ErrorResponse;
          
          throw new LicenseValidatorError(
            errorData.error || 'License service error',
            statusCode,
            errorData.code
          );
        } else if (error.request) {
          // La request se hizo pero no hubo respuesta
          throw new LicenseValidatorError(
            'License service is unavailable',
            503,
            'SERVICE_UNAVAILABLE'
          );
        } else {
          // Error al configurar la request
          throw new LicenseValidatorError(
            'Failed to communicate with license service',
            500,
            'COMMUNICATION_ERROR'
          );
        }
      }

      // Error desconocido
      throw new LicenseValidatorError(
        'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Obtiene todas las licencias de un paciente desde el servicio de licencias
   */
  static async getPatientLicenses(patientId: string): Promise<License[]> {
    if (!patientId || typeof patientId !== 'string' || patientId.trim().length === 0) {
      throw new LicenseValidatorError('patientId is required and must be a non-empty string', 400, 'INVALID_PATIENT_ID');
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
        throw new LicenseValidatorError('Failed to retrieve licenses', 500, 'SERVICE_ERROR');
      }

      return response.data.data;

    } catch (error) {
      if (error instanceof LicenseValidatorError) {
        throw error;
      }

      // Manejar errores de axios
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un error
          const statusCode = error.response.status;
          const errorData = error.response.data as ErrorResponse;
          
          throw new LicenseValidatorError(
            errorData.error || 'License service error',
            statusCode,
            errorData.code
          );
        } else if (error.request) {
          // La request se hizo pero no hubo respuesta
          throw new LicenseValidatorError(
            'License service is unavailable',
            503,
            'SERVICE_UNAVAILABLE'
          );
        } else {
          // Error al configurar la request
          throw new LicenseValidatorError(
            'Failed to communicate with license service',
            500,
            'COMMUNICATION_ERROR'
          );
        }
      }

      // Error desconocido
      throw new LicenseValidatorError(
        'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }
}