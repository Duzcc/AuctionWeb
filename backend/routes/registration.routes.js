import express from 'express';
import { createRegistration, getMyRegistrations, getRegistrationById } from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createRegistration);
router.get('/my', getMyRegistrations);
router.get('/:id', getRegistrationById);

export default router;
