
const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const Event = require('../models/Event');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');
const logAction = require('../utils/auditLogger');

// @desc    Create a new club
// @route   POST /api/:institutionCode/admin/clubs
// @access  Admin
const createClub = async (req, res) => {
    const { name, category, description, logo } = req.body;

    try {
        const existingClub = await Club.findOne({ name, institutionId: req.institutionId });

        if (existingClub) {
            return res.status(400).json({ message: 'Club with this name already exists' });
        }

        const club = await Club.create({
            name,
            category,
            description,
            logo,
            approved: true, // Admin created clubs are auto-approved
            institutionId: req.institutionId,
        });

        res.status(201).json(club);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get pending membership requests
// @route   GET /api/:institutionCode/admin/requests
// @access  Admin
const getPendingRequests = async (req, res) => {
    try {
        const requests = await ClubMembership.find({
            institutionId: req.institutionId,
            status: 'PENDING',
        })
            .populate('userId', 'name email')
            .populate('clubId', 'name');

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve or Reject membership request
// @route   PATCH /api/:institutionCode/admin/requests/:id
// @access  Admin
const updateRequestStatus = async (req, res) => {
    const { status, role } = req.body; // APPROVED or REJECTED, optional role override

    try {
        // Securely find membership belonging to this institution
        const membership = await ClubMembership.findOne({
            _id: req.params.id,
            institutionId: req.institutionId
        })
            .populate('userId')
            .populate('clubId')
            .populate('institutionId');

        if (!membership) {
            return res.status(404).json({ message: 'Membership request not found or not authorized' });
        }

        // Removed manual check as query handles it
        // if (membership.institutionId._id.toString() !== req.institutionId.toString()) ...

        membership.status = status;

        // Set the role when approving - use provided role or the requested role
        if (status === 'APPROVED') {
            membership.role = role || membership.requestedRole || 'MEMBER';
        }

        await membership.save();

        // Send Email if Approved
        if (status === 'APPROVED') {
            try {
                const roleText = membership.role === 'CLUB_LEAD' ? 'Club Lead' : 'Member';
                const message = `
                    <h2>Membership Approved!</h2>
                    <p>Congratulations <strong>${membership.userId.name}</strong>,</p>
                    <p>Your membership request for <strong>${membership.clubId.name}</strong> at <strong>${membership.institutionId.name}</strong> has been approved.</p>
                    <p>Your role: <strong>${roleText}</strong></p>
                    <p>You can now view club details and participate in events.</p>
`;

                await sendEmail({
                    to: membership.userId.email,
                    subject: 'Your Membership Was Approved - CampusHub',
                    html: message
                });
            } catch (err) {
                console.error('Failed to send approval email:', err);
            }
        }

        res.json(membership);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new event
// @route   POST /api/:institutionCode/admin/events
// @access  Admin
const createEvent = async (req, res) => {
    const { title, description, date, endTime, location, capacity, type, clubId } = req.body;

    try {
        // Validate dates
        const startDate = new Date(date);
        const endDate = new Date(endTime);
        const now = new Date();

        // Check if event is in the past
        if (startDate < now) {
            return res.status(400).json({ message: 'Cannot create events in the past' });
        }

        if (endDate <= startDate) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Check for overlapping events for the same club
        if (type === 'CLUB' && clubId) {
            const clubOverlap = await Event.findOne({
                clubId,
                institutionId: req.institutionId,
                $or: [
                    // Event starts during another event
                    { date: { $lte: startDate }, endTime: { $gt: startDate } },
                    // Event ends during another event
                    { date: { $lt: endDate }, endTime: { $gte: endDate } },
                    // Event completely contains another event
                    { date: { $gte: startDate }, endTime: { $lte: endDate } }
                ]
            });

            if (clubOverlap) {
                return res.status(400).json({
                    message: 'This club already has an event scheduled during this time'
                });
            }
        }

        // Check for institution-wide time conflicts (same time slot)
        const institutionOverlap = await Event.findOne({
            institutionId: req.institutionId,
            $or: [
                // Event starts during another event
                { date: { $lte: startDate }, endTime: { $gt: startDate } },
                // Event ends during another event
                { date: { $lt: endDate }, endTime: { $gte: endDate } },
                // Event completely contains another event
                { date: { $gte: startDate }, endTime: { $lte: endDate } }
            ]
        });

        if (institutionOverlap) {
            return res.status(400).json({
                message: `Time conflict: Another event "${institutionOverlap.title}" is scheduled during this time`
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            endTime,
            location,
            capacity,
            type,
            clubId: type === 'CLUB' ? clubId : undefined,
            institutionId: req.institutionId,
        });

        // Audit
        await logAction({
            action: 'CREATE_EVENT',
            performedBy: req.user._id,
            institutionId: req.institutionId,
            targetId: event._id,
            targetModel: 'Event',
            details: `Event ${title} created`,
            req
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users for institution
// @route   GET /api/:institutionCode/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const { search, role, sort } = req.query;

        let query = { institutionId: req.institutionId };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        let sortOption = {};
        if (sort === 'latest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const users = await User.find(query)
            .select('-password')
            .sort(sortOption);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/:institutionCode/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, institutionId: req.institutionId });

        if (!user) {
            return res.status(404).json({ message: 'User not found in this institution' });
        }

        // Prevent deleting self?
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        await User.deleteOne({ _id: user._id });

        await logAction({
            action: 'DELETE_USER',
            performedBy: req.user._id,
            institutionId: req.institutionId,
            targetId: user._id,
            targetModel: 'User',
            details: `User ${user.email} deleted`,
            req
        });

        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PATCH /api/:institutionCode/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    try {
        const user = await User.findOne({ _id: req.params.id, institutionId: req.institutionId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        await logAction({
            action: 'UPDATE_ROLE',
            performedBy: req.user._id,
            institutionId: req.institutionId,
            targetId: user._id,
            targetModel: 'User',
            details: `User roles updated from ${oldRole} to ${role} `,
            req
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Audit Logs
// @route   GET /api/:institutionCode/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ institutionId: req.institutionId })
            .populate('performedBy', 'name email')
            .sort('-createdAt')
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClub,
    getPendingRequests,
    updateRequestStatus,
    createEvent,
    getUsers,
    deleteUser,
    updateUserRole,
    getAuditLogs
};
