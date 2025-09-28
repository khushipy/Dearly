// server/routes/connections.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendInviteEmail } = require("../services/email");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// Get all connections
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "connections.userId",
      "email"
    );
    res.json(user.connections);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Send connection request
router.post("/invite", auth, async (req, res) => {
  try {
    const { email } = req.body;
    const fromUser = await User.findById(req.user.id);

    // Find user to connect with
    const toUser = await User.findOne({ email });
    if (!toUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Check if connection already exists
    const existingConnection = fromUser.connections.find(
      (conn) => conn.userId.toString() === toUser._id.toString()
    );

    if (existingConnection) {
      return res.status(400).json({ msg: "Connection already exists" });
    }

    // Generate token for the invite
    const token = jwt.sign(
      { from: fromUser._id, to: toUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send invite email
    await sendInviteEmail(email, token);

    // Create pending connection
    fromUser.connections.push({
      userId: toUser._id,
      status: "pending",
    });

    await fromUser.save();
    res.json({ msg: "Invite sent" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Accept connection request
router.post("/accept/:token", auth, async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(req.user.id);

    // Only the intended recipient can accept
    if (decoded.to.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const fromUser = await User.findById(decoded.from);
    if (!fromUser) {
      return res.status(400).json({ msg: "Invalid invite" });
    }

    // Generate a shared secret for these two users
    const sharedSecret = crypto.randomBytes(32).toString("hex");

    // Update current user's connection
    currentUser.connections.push({
      userId: fromUser._id,
      status: "accepted",
      sharedSecret,
    });

    // Update the other user's connection
    fromUser.connections.push({
      userId: currentUser._id,
      status: "accepted",
      sharedSecret,
    });

    await Promise.all([currentUser.save(), fromUser.save()]);
    res.json({ msg: "Connection established" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
