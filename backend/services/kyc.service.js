import User from '../models/User.model.js';

class KYCService {
    /**
     * Submit KYC documents
     * @param {String} userId
     * @param {Array} documents - Array of document objects with type and url
     */
    async submitKYC(userId, documents) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if KYC already approved
            if (user.kycStatus === 'approved') {
                throw new Error('KYC already approved');
            }

            // Validate documents
            if (!documents || documents.length === 0) {
                throw new Error('At least one document is required');
            }

            // Required document types for individuals
            const requiredDocsIndividual = ['id_front', 'id_back', 'selfie'];
            // Required document types for organizations
            const requiredDocsOrg = ['business_license', 'id_front', 'id_back'];

            const requiredDocs = user.userType === 'organization' ? requiredDocsOrg : requiredDocsIndividual;
            const providedTypes = documents.map(doc => doc.type);

            const missingDocs = requiredDocs.filter(type => !providedTypes.includes(type));
            if (missingDocs.length > 0) {
                throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
            }

            // Update user KYC documents
            user.kycDocuments = documents.map(doc => ({
                type: doc.type,
                url: doc.url,
                uploadedAt: new Date()
            }));

            user.kycStatus = 'pending';
            user.kycRejectionReason = undefined; // Clear previous rejection reason if any

            await user.save();

            console.log(`✅ KYC submitted for user ${userId}`);

            return {
                success: true,
                message: 'KYC documents submitted successfully',
                kycStatus: user.kycStatus,
                documents: user.kycDocuments
            };

        } catch (error) {
            console.error('Submit KYC error:', error);
            throw error;
        }
    }

    /**
     * Get KYC status for a user
     * @param {String} userId
     */
    async getKYCStatus(userId) {
        try {
            const user = await User.findById(userId).select(
                'kycStatus kycVerifiedAt kycDocuments kycNotes kycRejectionReason userType'
            );

            if (!user) {
                throw new Error('User not found');
            }

            return {
                success: true,
                data: {
                    kycStatus: user.kycStatus,
                    kycVerifiedAt: user.kycVerifiedAt,
                    documents: user.kycDocuments || [],
                    notes: user.kycNotes,
                    rejectionReason: user.kycRejectionReason,
                    userType: user.userType
                }
            };

        } catch (error) {
            console.error('Get KYC status error:', error);
            throw error;
        }
    }

    /**
     * Admin: Approve KYC
     * @param {String} userId
     * @param {String} adminId
     * @param {String} notes
     */
    async approveKYC(userId, adminId, notes = null) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.kycStatus === 'approved') {
                throw new Error('KYC already approved');
            }

            if (user.kycStatus !== 'pending') {
                throw new Error('KYC must be in pending status to approve');
            }

            user.kycStatus = 'approved';
            user.kycVerifiedAt = new Date();
            user.kycNotes = notes || 'Approved by admin';
            user.kycRejectionReason = undefined;

            await user.save();

            console.log(`✅ KYC approved for user ${userId} by admin ${adminId}`);

            // TODO: Send email notification to user
            // await emailService.sendKYCApprovalEmail(user.email, user.username);

            return {
                success: true,
                message: 'KYC approved successfully',
                userId,
                kycStatus: user.kycStatus,
                verifiedAt: user.kycVerifiedAt
            };

        } catch (error) {
            console.error('Approve KYC error:', error);
            throw error;
        }
    }

    /**
     * Admin: Reject KYC
     * @param {String} userId
     * @param {String} adminId
     * @param {String} reason - Rejection reason
     */
    async rejectKYC(userId, adminId, reason) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.kycStatus === 'approved') {
                throw new Error('Cannot reject already approved KYC');
            }

            if (!reason || reason.trim() === '') {
                throw new Error('Rejection reason is required');
            }

            user.kycStatus = 'rejected';
            user.kycRejectionReason = reason;
            user.kycNotes = `Rejected by admin: ${reason}`;
            user.kycVerifiedAt = undefined;

            await user.save();

            console.log(`❌ KYC rejected for user ${userId} by admin ${adminId}`);

            // TODO: Send email notification to user
            // await emailService.sendKYCRejectionEmail(user.email, user.username, reason);

            return {
                success: true,
                message: 'KYC rejected',
                userId,
                kycStatus: user.kycStatus,
                rejectionReason: reason
            };

        } catch (error) {
            console.error('Reject KYC error:', error);
            throw error;
        }
    }

    /**
     * Admin: Get all pending KYC submissions
     * @param {Object} filters
     */
    async getPendingKYC(filters = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status = 'pending',
                userType
            } = filters;

            const query = { kycStatus: status };

            if (userType) {
                query.userType = userType;
            }

            const users = await User.find(query)
                .select(
                    'username email fullName userType kycStatus kycDocuments ' +
                    'identityNumber businessName createdAt'
                )
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await User.countDocuments(query);

            return {
                success: true,
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total
                }
            };

        } catch (error) {
            console.error('Get pending KYC error:', error);
            throw error;
        }
    }

    /**
     * Admin: Get KYC statistics
     */
    async getKYCStats() {
        try {
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: '$kycStatus',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {
                not_submitted: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            };

            stats.forEach(stat => {
                result[stat._id] = stat.count;
            });

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error('Get KYC stats error:', error);
            throw error;
        }
    }

    /**
     * Check if user can participate in auctions
     * @param {String} userId
     */
    async canParticipate(userId, sessionId = null) {
        try {
            const user = await User.findById(userId).select(
                'isProfileComplete kycStatus isBiddingAllowed bannedUntil role'
            );

            if (!user) {
                return {
                    canParticipate: false,
                    reason: 'User not found'
                };
            }

            // --- BYPASS LOGIC ---
            // 1. Admin bypass: Admins can always participate/moderating
            if (user.role === 'admin') {
                return { canParticipate: true };
            }

            // 2. Approved registration bypass: 
            // If the user already has an approved registration for this specific session,
            // we trust that the admin already verified them.
            if (sessionId) {
                // Dynamically import to avoid circular dependencies if any
                const Registration = (await import('../models/Registration.model.js')).default;
                const registration = await Registration.findOne({
                    userId,
                    sessionId: sessionId,
                    status: { $in: ['approved', 'won_paid'] }
                });

                if (registration) {
                    return { canParticipate: true };
                }
            }

            if (!user.isProfileComplete) {
                return {
                    canParticipate: false,
                    reason: 'Profile incomplete. Please complete your profile first.'
                };
            }

            if (user.kycStatus !== 'approved') {
                return {
                    canParticipate: false,
                    reason: 'KYC not approved. Please submit and wait for KYC approval.'
                };
            }

            if (!user.isBiddingAllowed) {
                return {
                    canParticipate: false,
                    reason: 'Bidding is not allowed for this account.'
                };
            }

            if (user.bannedUntil && user.bannedUntil > new Date()) {
                return {
                    canParticipate: false,
                    reason: `Account is banned until ${user.bannedUntil.toLocaleDateString('vi-VN')}`
                };
            }

            return {
                canParticipate: true
            };

        } catch (error) {
            console.error('Can participate check error:', error);
            throw error;
        }
    }
}

export default new KYCService();
