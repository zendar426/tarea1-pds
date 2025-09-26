// routes/insurer.ts
import { Router } from 'express';
import { InsurerController } from '../controllers/InsurerController.js';

const router = Router();

// GET /insurer/licenses/{folio}/verify - Verificar validez de una licencia
router.get('/licenses/:folio/verify', InsurerController.verifyLicense);

// GET /insurer/patients/{patientId}/licenses - Obtener licencias de un paciente
router.get('/patients/:patientId/licenses', InsurerController.getPatientLicenses);

export default router;