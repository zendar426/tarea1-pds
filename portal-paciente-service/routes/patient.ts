// routes/patient.ts
import { Router } from 'express';
import { PatientController } from '../controllers/PatientController.js';

const router = Router();

// GET /patient/{patientId}/licenses - Obtener licencias de un paciente
router.get('/:patientId/licenses', PatientController.getPatientLicenses);

export default router;