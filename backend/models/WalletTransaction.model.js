import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'lock', 'unlock', 'deduct', 'refund'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    balanceBefore: {
        type: Number,
        required: [true, 'Balance before is required']
    },
    balanceAfter: {
        type: Number,
        required: [true, 'Balance after is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    referenceType: {
        type: String,
        enum: ['Payment', 'Registration', 'SessionPlate', 'Bid', 'Manual']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'reversed'],
        default: 'completed'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who processed manual transaction
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for performance
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ referenceId: 1, referenceType: 1 });
walletTransactionSchema.index({ type: 1 });
walletTransactionSchema.index({ status: 1 });
walletTransactionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
walletTransactionSchema.virtual('formattedAmount').get(function () {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(this.amount);
});

// Ensure virtual fields are serialized
walletTransactionSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    }
});

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
