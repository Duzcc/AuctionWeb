import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';
import { bidRateLimiter } from '../middleware/rateLimiter.js';
import {
    placeBid,
    getBidHistory,
    getMyBids,
    getAuctionState,
    adminDetermineWinner
} from '../controllers/bid.controller.js';

const router = express.Router();

// Public routes
router.get('/session-plate/:sessionPlateId', getBidHistory);
router.get('/auction-state/:sessionPlateId', getAuctionState);

// User routes (require authentication)
router.post('/', authenticate, bidRateLimiter, placeBid);
router.get('/my-bids', authenticate, getMyBids);

// Admin routes
router.post('/determine-winner/:sessionPlateId', authenticate, authorizeRoles('admin'), adminDetermineWinner);

export default router;
