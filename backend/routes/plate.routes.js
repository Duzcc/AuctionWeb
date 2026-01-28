import express from 'express';
import {
    getPlates,
    getPlateById,
    createPlate,
    updatePlate,
    deletePlate,
    getPlateStats
} from '../controllers/plate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/', getPlates);
router.get('/stats', getPlateStats);
router.get('/:id', getPlateById);

/**
 * Admin-only routes
 */
router.post('/', authenticate, authorizeRoles('admin'), createPlate);
router.put('/:id', authenticate, authorizeRoles('admin'), updatePlate);
router.delete('/:id', authenticate, authorizeRoles('admin'), deletePlate);

export default router;
