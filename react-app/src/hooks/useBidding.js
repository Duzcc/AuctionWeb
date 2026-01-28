import { useState, useCallback } from 'react';
import { useAuction } from './useAuction';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom hook for bidding functionality
 * @param {String} sessionPlateId - ID of the session plate
 * @param {String} token - JWT token
 */
export function useBidding(sessionPlateId, token) {
    const auction = useAuction(sessionPlateId, token);
    const [isPlacingBid, setIsPlacingBid] = useState(false);
    const [bidError, setBidError] = useState(null);
    const [rateLimitRemaining, setRateLimitRemaining] = useState(null);

    const priceStep = auction.auctionData?.priceStep || 0;

    /**
     * Place a bid with step multiplier
     * @param {Number} stepMultiplier - How many steps to bid (1, 2, 5, etc.)
     */
    const handlePlaceBid = useCallback(async (stepMultiplier = 1) => {
        if (isPlacingBid) {
            setBidError('Please wait for the previous bid to complete');
            return;
        }

        setIsPlacingBid(true);
        setBidError(null);

        try {
            const bidAmount = auction.currentPrice + (priceStep * stepMultiplier);

            const response = await axios.post(
                `${API_URL}/api/bids`,
                { sessionPlateId, bidAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            // Success notification
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast('Bid placed successfully!', 'success');
            }

            return response.data;

        } catch (error) {
            console.error('Bid error:', error);
            const errorMessage = error.response?.data?.message || error.message;

            // Handle rate limit error
            if (error.response?.status === 429) {
                const retryAfter = error.response.data.retryAfter;
                setRateLimitRemaining(retryAfter);
                setBidError(`Please wait ${retryAfter} seconds before bidding again`);

                // Clear rate limit message after time expires
                setTimeout(() => {
                    setRateLimitRemaining(null);
                    setBidError(null);
                }, retryAfter * 1000);
            } else {
                setBidError(errorMessage);
            }

            throw error;
        } finally {
            setIsPlacingBid(false);
        }
    }, [auction.currentPrice, priceStep, isPlacingBid, sessionPlateId, token]);

    /**
     * Place a custom amount bid
     * @param {Number} customAmount - Custom bid amount
     */
    const placeBidCustom = useCallback(async (customAmount) => {
        if (isPlacingBid) {
            setBidError('Please wait for the previous bid to complete');
            return;
        }

        // Validate custom amount
        const minimumBid = auction.currentPrice + priceStep;
        if (customAmount < minimumBid) {
            setBidError(`Bid must be at least ${minimumBid.toLocaleString('vi-VN')} VND`);
            return;
        }

        // Check if it's a valid increment
        const startingPrice = auction.auctionData?.startingPrice || 0;
        const priceAboveStart = customAmount - startingPrice;
        if (priceAboveStart % priceStep !== 0) {
            setBidError(`Bid must be in increments of ${priceStep.toLocaleString('vi-VN')} VND`);
            return;
        }

        setIsPlacingBid(true);
        setBidError(null);

        try {
            const response = await axios.post(
                `${API_URL}/api/bids`,
                { sessionPlateId, bidAmount: customAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast('Bid placed successfully!', 'success');
            }

            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            if (error.response?.status === 429) {
                const retryAfter = error.response.data.retryAfter;
                setRateLimitRemaining(retryAfter);
                setBidError(`Please wait ${retryAfter} seconds before bidding again`);

                setTimeout(() => {
                    setRateLimitRemaining(null);
                    setBidError(null);
                }, retryAfter * 1000);
            } else {
                setBidError(errorMessage);
            }

            throw error;
        } finally {
            setIsPlacingBid(false);
        }
    }, [auction.currentPrice, auction.auctionData, priceStep, isPlacingBid, sessionPlateId, token]);

    /**
     * Get my bid history
     */
    const getMyBids = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/bids/my-bids`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return response.data.data;
        } catch (error) {
            console.error('Get my bids error:', error);
            throw error;
        }
    }, [token]);

    return {
        // From useAuction
        ...auction,

        // Bidding-specific
        priceStep,
        isPlacingBid,
        bidError,
        rateLimitRemaining,

        // Actions
        handlePlaceBid,       // Place bid with step multiplier
        placeBidCustom,       // Place custom amount bid
        getMyBids,            // Get user's bid history

        // Helpers
        canBid: !isPlacingBid && auction.status === 'active' && !rateLimitRemaining,
        minimumNextBid: auction.currentPrice + priceStep
    };
}
