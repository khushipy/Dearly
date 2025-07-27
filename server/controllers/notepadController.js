const Notepad = require('../models/Notepad');
const bcrypt = require('bcryptjs');

// Create or join a notepad between two users with a shared password
exports.createOrJoinNotepad = async (req, res) => {
  try {
    const { userId1, userId2, sharedPassword } = req.body;
    // Check if notepad already exists for these two users
    let notepad = await Notepad.findOne({ users: { $all: [userId1, userId2], $size: 2 } });
    if (notepad) {
      // Check password
      const isMatch = await bcrypt.compare(sharedPassword, notepad.sharedPasswordHash);
      if (!isMatch) return res.status(401).json({ msg: 'Incorrect shared password' });
      return res.json({ notepad });
    }
    // Create new notepad
    const sharedPasswordHash = await bcrypt.hash(sharedPassword, 10);
    notepad = new Notepad({ users: [userId1, userId2], sharedPasswordHash, messages: [] });
    await notepad.save();
    res.json({ notepad });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Send a message or note
exports.sendMessage = async (req, res) => {
  try {
    const { notepadId, sender, type, content } = req.body;
    const notepad = await Notepad.findById(notepadId);
    if (!notepad) return res.status(404).json({ msg: 'Notepad not found' });
    notepad.messages.push({ sender, type, content });
    await notepad.save();
    res.json({ msg: 'Message sent', notepad });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all messages/notes for a notepad
exports.getMessages = async (req, res) => {
  try {
    const { notepadId } = req.params;
    const notepad = await Notepad.findById(notepadId).populate('messages.sender', 'name email');
    if (!notepad) return res.status(404).json({ msg: 'Notepad not found' });
    res.json({ messages: notepad.messages });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
