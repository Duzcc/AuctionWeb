import cron from 'node-cron';
import SessionPlate from '../models/SessionPlate.model.js';
import Session from '../models/Session.model.js';
import biddingService from '../services/bidding.service.js';
import auctionPaymentService from '../services/auctionPayment.service.js';

class AuctionCronJobs {
    constructor() {
        this.jobs = [];
    }

    /**
     * Start all cron jobs
     */
    startAll() {
        console.log('🕐 Starting auction cron jobs...');

        // Run auction checks every minute
        this.startAuctionChecker();

        // Run payment checks every hour
        this.startPaymentChecker();

        console.log('✅ All cron jobs started');
    }

    /**
     * Check for auctions that need to start or end
     * Runs every minute
     */
    startAuctionChecker() {
        const job = cron.schedule('* * * * *', async () => {
            try {
                const now = new Date();
                console.log(`⏰ [${now.toISOString()}] Running auction checker...`);

                // 1. Auto-start auctions
                await this.autoStartAuctions(now);

                // 2. Auto-end auctions
                await this.autoEndAuctions(now);

            } catch (error) {
                console.error('❌ Auction checker error:', error);
            }
        });

        this.jobs.push({ name: 'auctionChecker', job });
        console.log('  ✓ Auction checker scheduled (every minute)');
    }

    /**
     * Auto-start auctions that should be bidding now
     */
    async autoStartAuctions(now) {
        try {
            // CASE 1: Plates có đủ auctionEndTime → khởi động bình thường
            const auctionsToStart = await SessionPlate.find({
                status: 'pending',
                auctionStartTime: { $lte: now },
                auctionEndTime: { $gt: now }
            });

            if (auctionsToStart.length > 0) {
                console.log(`  🟢 Starting ${auctionsToStart.length} auctions (case 1)...`);
                for (const auction of auctionsToStart) {
                    auction.status = 'bidding';
                    await auction.save();
                    console.log(`    ✓ Started: ${auction.plateNumber}`);
                }
            }

            // CASE 2: Plates chưa có auctionEndTime → lấy endTime từ Session cha
            const auctionsMissingEndTime = await SessionPlate.find({
                status: 'pending',
                auctionStartTime: { $lte: now },
                $or: [
                    { auctionEndTime: null },
                    { auctionEndTime: { $exists: false } }
                ]
            }).populate('sessionId');

            if (auctionsMissingEndTime.length > 0) {
                console.log(`  🟡 Fixing ${auctionsMissingEndTime.length} auctions with missing endTime...`);
                for (const auction of auctionsMissingEndTime) {
                    const session = auction.sessionId;
                    // Dùng Session.endTime nếu có; fallback: auctionStartTime + 60 phút
                    const derivedEndTime = session?.endTime
                        ? new Date(session.endTime)
                        : new Date(now.getTime() + 60 * 60 * 1000);

                    if (derivedEndTime > now) {
                        auction.auctionEndTime = derivedEndTime;
                        auction.status = 'bidding';
                        await auction.save();
                        console.log(`    ✓ Fixed & Started: ${auction.plateNumber} → ends ${derivedEndTime.toISOString()}`);
                    } else {
                        // endTime đã qua → mark unsold
                        auction.status = 'unsold';
                        await auction.save();
                        console.log(`    ✗ Expired without bids: ${auction.plateNumber}`);
                    }
                }
            }
        } catch (error) {
            console.error('Auto-start auctions error:', error);
        }
    }

    /**
     * Auto-end auctions and determine winners
     */
    async autoEndAuctions(now) {
        try {
            const auctionsToEnd = await SessionPlate.find({
                status: 'bidding',
                auctionEndTime: { $lte: now }
            });

            if (auctionsToEnd.length > 0) {
                console.log(`  🔴 Ending ${auctionsToEnd.length} auctions...`);

                for (const auction of auctionsToEnd) {
                    try {
                        // Determine winner
                        const result = await biddingService.determineWinner(auction._id.toString());

                        console.log(
                            `    ✓ Ended: ${auction.plateNumber} - ` +
                            (result.winner ? `Winner: ${result.winner.userName}` : 'No bids')
                        );

                        // Auto-settle if there's a winner
                        if (result.status === 'sold') {
                            await this.autoSettleAuction(auction._id.toString());
                        }

                    } catch (error) {
                        console.error(`    ✗ Failed to end ${auction.plateNumber}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.error('Auto-end auctions error:', error);
        }
    }

    /**
     * Auto-settle auction (process payment and refunds)
     */
    async autoSettleAuction(sessionPlateId) {
        try {
            await auctionPaymentService.completeAuctionSettlement(sessionPlateId);
            console.log(`Settlement completed for auction ${sessionPlateId}`);
        } catch (error) {
            console.error(`Settlement failed for ${sessionPlateId}:`, error.message);
        }
    }

    /**
     * Check for payment timeouts and pending payments
     * Runs every hour
     */
    startPaymentChecker() {
        const job = cron.schedule('0 * * * *', async () => {
            try {
                const now = new Date();
                console.log(`[${now.toISOString()}] Running payment checker...`);

                await this.checkPaymentTimeouts(now);

            } catch (error) {
                console.error('Payment checker error:', error);
            }
        });

        this.jobs.push({ name: 'paymentChecker', job });
        console.log('Payment checker scheduled (every hour)');
    }

    /**
     * Check for payment timeouts (winner has 48 hours to pay)
     */
    async checkPaymentTimeouts(now) {
        try {
            const PAYMENT_DEADLINE_HOURS = 48;
            const deadlineDate = new Date(now.getTime() - PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000);

            const overdueAuctions = await SessionPlate.find({
                status: 'sold',
                winnerId: { $exists: true, $ne: null },
                auctionEndTime: { $lte: deadlineDate }
            });

            if (overdueAuctions.length > 0) {
                console.log(`Found ${overdueAuctions.length} overdue payments`);

                for (const auction of overdueAuctions) {
                    try {
                        // Check if payment was completed
                        const Payment = (await import('../models/Payment.model.js')).default;
                        const Registration = (await import('../models/Registration.model.js')).default;

                        const registration = await Registration.findOne({
                            sessionId: auction.sessionId,
                            userId: auction.winnerId
                        });

                        const payment = await Payment.findOne({
                            user: auction.winnerId,
                            registration: registration?._id,
                            type: 'auction_payment',
                            status: 'COMPLETED'
                        });

                        if (!payment) {
                            // Payment not completed - handle timeout
                            console.log(`Timeout: ${auction.plateNumber} - Winner: ${auction.winnerName}`);
                            await auctionPaymentService.handlePaymentTimeout(auction._id.toString());
                        }

                    } catch (error) {
                        console.error(`Timeout check failed for ${auction.plateNumber}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.error('Check payment timeouts error:', error);
        }
    }

    /**
     * Stop all cron jobs
     */
    stopAll() {
        console.log('Stopping all cron jobs...');
        this.jobs.forEach(({ name, job }) => {
            job.stop();
            console.log(`Stopped: ${name}`);
        });
        this.jobs = [];
    }
}

export default new AuctionCronJobs();
