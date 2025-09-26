// routes/pactState.ts
import { Router } from 'express';
import { PactStateController } from '../controllers/PactStateController.js';

const router = Router();

// POST /_pactState - Configurar estados para tests de Pact
router.post('/', PactStateController.setPactState);

export default router;