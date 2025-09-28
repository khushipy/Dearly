// server/routes/notes.js
const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get all notes for a specific connection
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the users are connected
    const currentUser = await User.findById(req.user.id);
    const connection = currentUser.connections.find(
      (conn) => conn.userId.toString() === userId && conn.status === "accepted"
    );

    if (!connection) {
      return res.status(403).json({ msg: "Not connected with this user" });
    }

    const notes = await Note.find({
      $or: [
        { from: req.user.id, to: userId },
        { from: userId, to: req.user.id },
      ],
    })
      .sort("createdAt")
      .populate("from", "email")
      .populate("to", "email");

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Send a note
router.post("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, iv } = req.body;

    // Verify the users are connected
    const currentUser = await User.findById(req.user.id);
    const connection = currentUser.connections.find(
      (conn) => conn.userId.toString() === userId && conn.status === "accepted"
    );

    if (!connection) {
      return res.status(403).json({ msg: "Not connected with this user" });
    }

    const note = new Note({
      from: req.user.id,
      to: userId,
      content,
      iv,
    });

    await note.save();

    // Populate the sender/receiver info before sending back
    await note.populate("from", "email");
    await note.populate("to", "email");

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
