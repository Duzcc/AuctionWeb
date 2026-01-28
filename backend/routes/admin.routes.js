import express from 'express';
import {
    getDashboardStats,
    approvePayment,
    rejectPayment,
    getAllUsers,
    updateUserStatus,
    approveRegistration,
    getAllPlates,
    createPlate,
    updatePlate,
    deletePlate
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorizeRoles('admin'));

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Payment Management
router.put('/payments/:id/approve', approvePayment);
router.put('/payments/:id/reject', rejectPayment);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Registration Management
router.put('/registrations/:id/approve', approveRegistration);

// Product/Plate Management
router.get('/plates', getAllPlates);
router.post('/plates', createPlate);
router.put('/plates/:id', updatePlate);
router.delete('/plates/:id', deletePlate);

export default router;
