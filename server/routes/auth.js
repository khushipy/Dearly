const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt with data:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Registration failed: User already exists', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    console.log('Creating new user:', email);
    user = new User({ email, password });
    
    // Hash password (handled by pre-save hook in User model)
    await user.save();
    console.log('User created successfully:', user.email);

    // Generate and return token
    const token = user.generateAuthToken();
    console.log('Auth token generated for user:', user.email);

    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error in registration:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      ...(err.errors && { errors: Object.values(err.errors).map(e => e.message) })
    });
    res.status(500).json({ 
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate and return token
    const token = user.generateAuthToken();

    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;