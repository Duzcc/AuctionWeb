import express from 'express';
import { getAuctionResults, getAvailablePlates } from '../controllers/auctionResults.controller.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/results', getAuctionResults);
router.get('/available', getAvailablePlates);

export default router;
