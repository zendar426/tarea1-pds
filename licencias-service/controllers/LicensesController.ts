import type { Request, Response } from 'express';
import { LicensesService, LicenseValidationError, LicenseNotFoundError } from '../services/licensesService.js';


export class LicensesController {
    static async createLicense(req: Request, res: Response) {
        try {
            const { patientId, doctorId, diagnosis, startDate, days } = req.body;

            // Crear la licencia usando el servicio
            const newLicense = await LicensesService.createLicense({
                patientId,
                doctorId,
                diagnosis,
                startDate,
                days
            });

            // Responder con la licencia creada
            res.status(201).json({
                success: true,
                data: newLicense,
                message: 'License created successfully'
            });

        } catch (error) {
            // Manejar errores de validación personalizados
            if (error instanceof LicenseValidationError) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }

            // Manejar otros errores
            console.error('Error creating license:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to create license'
            });
        }
    }

    static async getLicenseByFolio(req: Request, res: Response) {
        try {
            const { folio } = req.params;

            // Validar que el folio esté presente
            if (!folio) {
                return res.status(400).json({
                    success: false,
                    error: 'Folio is required',
                    code: 'MISSING_FOLIO'
                });
            }

            // Obtener la licencia usando el servicio
            const license = await LicensesService.getLicenseByFolio(folio);

            // Responder con la licencia encontrada
            res.status(200).json({
                success: true,
                data: license
            });

        } catch (error) {
            // Manejar error cuando no se encuentra la licencia
            if (error instanceof LicenseNotFoundError) {
                return res.status(404).json({
                    success: false,
                    error: 'License not found',
                    message: 'No license found with the provided folio'
                });
            }

            // Manejar errores de validación
            if (error instanceof LicenseValidationError) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }

            // Manejar otros errores
            console.error('Error getting license by folio:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to retrieve license'
            });
        }
    }

    static async getLicensesByPatient(req: Request, res: Response) {
        try {
            const { patientId } = req.query;

            // Validar que el patientId esté presente y sea string
            if (!patientId || typeof patientId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'patientId query parameter is required and must be a string',
                    code: 'MISSING_PATIENT_ID'
                });
            }

            // Obtener las licencias del paciente usando el servicio
            const licenses = await LicensesService.getLicensesByPatient(patientId);

            // Responder con las licencias encontradas
            res.status(200).json({
                success: true,
                data: licenses,
                count: licenses.length
            });

        } catch (error) {
            // Manejar errores de validación
            if (error instanceof LicenseValidationError) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }

            // Manejar otros errores
            console.error('Error getting licenses by patient:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to retrieve patient licenses'
            });
        }
    }

    static async verifyLicense(req: Request, res: Response) {
        try {
            const { folio } = req.params;

            // Validar que el folio esté presente
            if (!folio) {
                return res.status(400).json({
                    success: false,
                    error: 'Folio is required',
                    code: 'MISSING_FOLIO'
                });
            }

            // Verificar la licencia usando el servicio
            const verification = await LicensesService.verifyLicense(folio);

            // Responder con el resultado de la verificación
            res.status(200).json({
                success: true,
                data: verification,
                message: verification.valid ? 'License is valid' : 'License is invalid or not found'
            });

        } catch (error) {
            // Manejar errores de validación
            if (error instanceof LicenseValidationError) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
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
}