const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true, // Automatically convert to lowercase
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'MEMBER'],
        default: 'MEMBER',
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true,
    },
    // Secure Password Reset Fields
    resetTokenHash: String,
    resetTokenExpiresAt: Date,
    resetUsed: {
        type: Boolean,
        default: false,
    },
    resetRequestedAt: Date,
    resetAttempts: {
        type: Number,
        default: 0,
    },
    // Session Invalidation
    tokenVersion: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Email must be unique globally across the entire platform
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
