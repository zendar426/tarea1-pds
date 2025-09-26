// routes/licenses.ts
import { Router } from 'express';
import { LicensesController } from '../controllers/LicensesController.js';

const router = Router();

// POST /licenses - Crear nueva licencia
router.post('/', LicensesController.createLicense);

// GET /licenses/:folio - Obtener licencia por folio
router.get('/:folio', LicensesController.getLicenseByFolio);

// GET /licenses - Obtener licencias por patientId (query param)
router.get('/', LicensesController.getLicensesByPatient);

// GET /licenses/:folio/verify - Verificar validez de licencia
router.get('/:folio/verify', LicensesController.verifyLicense);

export default router;