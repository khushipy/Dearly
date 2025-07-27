const express = require('express');
const router = express.Router();
const { createOrJoinNotepad, sendMessage, getMessages } = require('../controllers/notepadController');

// Dummy auth middleware (replace with real JWT auth in production)
const auth = (req, res, next) => {
  req.user = { id: req.header('x-user-id') };
  next();
};

// Create or join a notepad
router.post('/create-or-join', auth, createOrJoinNotepad);
// Send a message or note
router.post('/send', auth, sendMessage);
// Get all messages/notes for a notepad
router.get('/:notepadId/messages', auth, getMessages);

module.exports = router; 