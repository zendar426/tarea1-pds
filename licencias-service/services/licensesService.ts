// services/licensesService.ts
import { License } from '../models/Licenses.js';
import mongoose from 'mongoose';

export interface CreateLicenseDTO {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  startDate: string | Date;
  days: number;
}

export interface LicenseDTO {
  folio: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  startDate: Date;
  days: number;
  status: 'issued' | 'expired' | 'cancelled';
  createdAt?: Date;
}

export class LicenseValidationError extends Error {
  public code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'LicenseValidationError';
    this.code = code;
  }
}

export class LicenseNotFoundError extends Error {
  constructor(message: string = 'License not found') {
    super(message);
    this.name = 'LicenseNotFoundError';
  }
}

export class LicensesService {
  
  /**
   * Genera un folio único
   */
  private static generateFolio(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LIC-${timestamp}-${random}`;
  }

  /**
   * Valida los datos para crear una licencia
   */
  private static validateCreateLicenseData(data: CreateLicenseDTO): void {
    const { patientId, doctorId, diagnosis, startDate, days } = data;

    // Validar campos requeridos
    if (!patientId || typeof patientId !== 'string' || patientId.trim().length === 0) {
      throw new LicenseValidationError('patientId is required and must be a non-empty string', 'INVALID_PATIENT_ID');
    }

    if (!doctorId || typeof doctorId !== 'string' || doctorId.trim().length === 0) {
      throw new LicenseValidationError('doctorId is required and must be a non-empty string', 'INVALID_DOCTOR_ID');
    }

    if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length === 0) {
      throw new LicenseValidationError('diagnosis is required and must be a non-empty string', 'INVALID_DIAGNOSIS');
    }

    if (!startDate) {
      throw new LicenseValidationError('startDate is required', 'INVALID_START_DATE');
    }

    if (days === undefined || days === null) {
      throw new LicenseValidationError('days is required', 'INVALID_DAYS');
    }

    // Validar días
    if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
      throw new LicenseValidationError('Days must be a positive integer greater than 0', 'INVALID_DAYS');
    }

    // Validar fecha
    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) {
      throw new LicenseValidationError('startDate must be a valid date', 'INVALID_START_DATE');
    }
  }

  /**
   * Crea una nueva licencia médica
   */
  static async createLicense(data: CreateLicenseDTO): Promise<LicenseDTO> {
    try {
      // Validar datos de entrada
      this.validateCreateLicenseData(data);

      const { patientId, doctorId, diagnosis, startDate, days } = data;

      // Generar folio único con retry
      let folio: string;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        folio = this.generateFolio();
        attempts++;
        const existingLicense = await License.findOne({ folio });
        if (!existingLicense) break;
        
        if (attempts >= maxAttempts) {
          throw new Error('Unable to generate unique folio after multiple attempts');
        }
      } while (attempts < maxAttempts);

      // Crear nueva licencia
      const newLicense = new License({
        folio,
        patientId: patientId.trim(),
        doctorId: doctorId.trim(),
        diagnosis: diagnosis.trim(),
        startDate: new Date(startDate),
        days: Number(days),
        status: 'issued'
      });

      // Guardar en base de datos
      const savedLicense = await newLicense.save();

      // Retornar DTO
      return {
        folio: savedLicense.folio,
        patientId: savedLicense.patientId,
        doctorId: savedLicense.doctorId,
        diagnosis: savedLicense.diagnosis,
        startDate: savedLicense.startDate,
        days: savedLicense.days,
        status: savedLicense.status
      };

    } catch (error) {
      // Re-lanzar errores de validación personalizados
      if (error instanceof LicenseValidationError) {
        throw error;
      }

      // Manejar errores de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        if (error.errors.days) {
          throw new LicenseValidationError('Days must be greater than 0', 'INVALID_DAYS');
        }
        throw new LicenseValidationError(`Validation error: ${error.message}`, 'VALIDATION_ERROR');
      }

      // Manejar errores de duplicado
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        throw new Error('Duplicate folio generated, please retry');
      }

      // Re-lanzar otros errores
      throw error;
    }
  }

  /**
   * Obtiene una licencia por folio
   */
  static async getLicenseByFolio(folio: string): Promise<LicenseDTO> {
    if (!folio || typeof folio !== 'string' || folio.trim().length === 0) {
      throw new LicenseValidationError('Folio is required and must be a non-empty string', 'INVALID_FOLIO');
    }

    const license = await License.findOne({ folio: folio.trim() });

    if (!license) {
      throw new LicenseNotFoundError();
    }

    return {
      folio: license.folio,
      patientId: license.patientId,
      doctorId: license.doctorId,
      diagnosis: license.diagnosis,
      startDate: license.startDate,
      days: license.days,
      status: license.status,
      createdAt: license.createdAt
    };
  }

  /**
   * Obtiene todas las licencias de un paciente
   */
  static async getLicensesByPatient(patientId: string): Promise<LicenseDTO[]> {
    if (!patientId || typeof patientId !== 'string' || patientId.trim().length === 0) {
      throw new LicenseValidationError('patientId is required and must be a non-empty string', 'INVALID_PATIENT_ID');
    }

    const licenses = await License.find({ 
      patientId: patientId.trim() 
    }).sort({ createdAt: -1 });

    return licenses.map(license => ({
      folio: license.folio,
      patientId: license.patientId,
      doctorId: license.doctorId,
      diagnosis: license.diagnosis,
      startDate: license.startDate,
      days: license.days,
      status: license.status,
      createdAt: license.createdAt
    }));
  }

  /**
   * Verifica si una licencia existe y está activa
   */
  static async verifyLicense(folio: string): Promise<{ valid: boolean }> {
    if (!folio || typeof folio !== 'string' || folio.trim().length === 0) {
      throw new LicenseValidationError('Folio is required and must be a non-empty string', 'INVALID_FOLIO');
    }

    const license = await License.findOne({ folio: folio.trim() });

    if (!license) {
      return { valid: false };
    }

    // Una licencia es válida solo si está en estado "issued"
    return { valid: license.status === 'issued' };
  }
}