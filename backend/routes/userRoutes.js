const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { getMyMemberships } = require('../controllers/clubController');
const { getMyRegistrations } = require('../controllers/eventController');

router.use(protect);

const { deleteMyAccount } = require('../controllers/userController');

router.get('/memberships', getMyMemberships);
router.get('/event-registrations', getMyRegistrations);
router.delete('/me', deleteMyAccount);

module.exports = router;
