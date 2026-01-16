const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');

// @desc    Get all clubs for the institution
// @route   GET /api/:institutionCode/clubs
// @access  Public
const getClubs = async (req, res) => {
    try {
        const clubs = await Club.find({ institutionId: req.institutionId, approved: true });
        res.json(clubs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single club details
// @route   GET /api/:institutionCode/clubs/:clubId
// @access  Public
const getClubById = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (club.institutionId.toString() !== req.institutionId.toString()) {
            return res.status(404).json({ message: 'Club not found in this institution' });
        }

        res.json(club);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Join a club
// @route   POST /api/:institutionCode/clubs/:clubId/join
// @access  Member
const joinClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        const { requestedRole = 'MEMBER' } = req.body; // Can request MEMBER or CLUB_LEAD

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (club.institutionId.toString() !== req.institutionId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const existingMembership = await ClubMembership.findOne({
            userId: req.user._id,
            clubId: req.params.clubId,
        });

        if (existingMembership) {
            return res.status(400).json({ message: 'Already a member or request pending' });
        }

        // Admins are auto-approved with full access
        const isAdmin = req.user.role === 'ADMIN';

        const membership = await ClubMembership.create({
            userId: req.user._id,
            clubId: req.params.clubId,
            institutionId: req.institutionId,
            status: isAdmin ? 'APPROVED' : 'PENDING',
            role: isAdmin ? 'CLUB_LEAD' : 'MEMBER', // Admins get Club Lead by default
            requestedRole: isAdmin ? 'CLUB_LEAD' : requestedRole,
        });

        if (isAdmin) {
            res.status(201).json({
                ...membership.toObject(),
                message: 'You have been automatically added to this club as Admin'
            });
        } else {
            res.status(201).json({
                ...membership.toObject(),
                message: 'Join request sent! Waiting for admin approval.'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my memberships
// @route   GET /api/:institutionCode/me/memberships
// @access  Member
const getMyMemberships = async (req, res) => {
    try {
        const memberships = await ClubMembership.find({
            userId: req.user._id,
            institutionId: req.institutionId,
        }).populate('clubId', 'name logo category');

        res.json(memberships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get club members
// @route   GET /api/:institutionCode/clubs/:clubId/members
// @access  Public
const getClubMembers = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);

        if (!club || club.institutionId.toString() !== req.institutionId.toString()) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const members = await ClubMembership.find({
            clubId: req.params.clubId,
            status: 'APPROVED'
        }).populate('userId', 'name email role');

        // Include club role in response
        const membersWithRoles = members.map(m => ({
            _id: m._id,
            userId: m.userId,
            role: m.role, // MEMBER or CLUB_LEAD
            joinedAt: m.createdAt
        }));

        res.json(membersWithRoles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get club events
// @route   GET /api/:institutionCode/clubs/:clubId/events
// @access  Public
const getClubEvents = async (req, res) => {
    try {
        const Event = require('../models/Event');
        const club = await Club.findById(req.params.clubId);

        if (!club || club.institutionId.toString() !== req.institutionId.toString()) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const events = await Event.find({
            clubId: req.params.clubId,
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getClubs,
    getClubById,
    joinClub,
    getMyMemberships,
    getClubMembers,
    getClubEvents,
};
