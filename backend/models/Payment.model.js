import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        required: false // Optional if this payment is for something else later, but for now mostly reg
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'ORDER', 'auction_payment', 'auction_remaining'],
        default: 'DEPOSIT'
    },
    amount: {
        type: Number,
        required: true
    },
    feeAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    method: {
        type: String,
        enum: ['VIETQR', 'vietqr', 'MOMO', 'momo', 'ZALOPAY', 'zalopay', 'BANKING', 'banking'],
        default: 'VIETQR'
    },
    transactionCode: {
        type: String,
        required: true,
        trim: true
    },
    proofImage: {
        type: String // URL to uploaded proof
    },
    adminNotes: {
        type: String
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
