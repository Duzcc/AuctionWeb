import express from 'express';
import {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite
} from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:plateId', removeFavorite);
router.get('/check/:plateId', checkFavorite);

export default router;
