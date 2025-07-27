const express = require('express');
const router = express.Router();
const { sendFriendRequest, acceptFriendRequest, listFriends } = require('../controllers/friendController');

// Dummy auth middleware (replace with real JWT auth in production)
const auth = (req, res, next) => {
  // In production, decode JWT and set req.user
  // For now, set req.user from a header for testing
  req.user = { id: req.header('x-user-id') };
  next();
};

router.post('/request', auth, sendFriendRequest);
router.post('/accept', auth, acceptFriendRequest);
router.get('/list', auth, listFriends);

module.exports = router; 