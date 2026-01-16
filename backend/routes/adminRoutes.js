const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createClub,
    getPendingRequests,
    updateRequestStatus,
    createEvent,
    getUsers,
    deleteUser,
    updateUserRole,
    getAuditLogs
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('ADMIN'));

router.post('/clubs', createClub);
router.get('/requests', getPendingRequests);
router.patch('/requests/:id', updateRequestStatus);
router.post('/events', createEvent);

// User Management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// Audit
router.get('/audit-logs', getAuditLogs);

module.exports = router;
