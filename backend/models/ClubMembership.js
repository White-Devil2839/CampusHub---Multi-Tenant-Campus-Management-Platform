const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    role: {
        type: String,
        enum: ['MEMBER', 'CLUB_LEAD'],
        default: 'MEMBER',
    },
    requestedRole: {
        type: String,
        enum: ['MEMBER', 'CLUB_LEAD'],
        default: 'MEMBER',
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true,
    },
}, { timestamps: true });

// Ensure a user can only have one membership status per club
clubMembershipSchema.index({ userId: 1, clubId: 1 }, { unique: true });

module.exports = mongoose.model('ClubMembership', clubMembershipSchema);
