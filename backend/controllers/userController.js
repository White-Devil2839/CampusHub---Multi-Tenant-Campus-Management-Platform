const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logAction = require('../utils/auditLogger');
const ClubMembership = require('../models/ClubMembership');
const EventRegistration = require('../models/EventRegistration');

// @desc    Delete my account
// @route   DELETE /api/:institutionCode/users/me
// @access  Private
const deleteMyAccount = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required to delete account' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Optional: Delete associated data (Memberships, Registrations)
        // Ideally this should be handled by database middleware or cascade, but we can do it here for safety
        await ClubMembership.deleteMany({ userId: user._id });
        await EventRegistration.deleteMany({ userId: user._id });

        await User.findByIdAndDelete(user._id);

        await logAction({
            action: 'DELETE_USER',
            performedBy: user._id, // The user deleted themselves
            institutionId: req.institutionId,
            targetId: user._id,
            targetModel: 'User',
            details: 'User deleted their own account',
            req
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    deleteMyAccount
};
