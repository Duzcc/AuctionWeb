import { body, validationResult } from 'express-validator';

/**
 * Validate KYC submission
 */
export const validateKYCSubmission = [
    body('documents')
        .isArray({ min: 1 })
        .withMessage('At least one document is required'),

    body('documents.*.type')
        .isIn(['id_front', 'id_back', 'selfie', 'business_license'])
        .withMessage('Invalid document type'),

    body('documents.*.url')
        .isURL()
        .withMessage('Document URL must be valid'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate wallet deposit
 */
export const validateWalletDeposit = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => value > 0)
        .withMessage('Amount must be greater than 0')
        .custom((value) => value >= 10000)
        .withMessage('Minimum deposit is 10,000 VND'),

    body('paymentId')
        .isMongoId()
        .withMessage('Payment ID must be valid'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate wallet withdrawal
 */
export const validateWalletWithdrawal = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => value > 0)
        .withMessage('Amount must be greater than 0')
        .custom((value) => value >= 50000)
        .withMessage('Minimum withdrawal is 50,000 VND'),

    body('bankAccount')
        .notEmpty()
        .withMessage('Bank account information is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];
