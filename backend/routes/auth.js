const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const jwtService = require('../services/auth/jwtService');
const validationService = require('../services/auth/validationService');
const responseService = require('../services/response/responseService');

const router = express.Router();
const userModel = new User();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate registration data
    const validation = validationService.validateRegistration({ username, email, password });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    const user = await userModel.create(username, email, password);

    // Generate JWT token
    const token = jwtService.generateToken(user);

    res.status(201).json(responseService.formatAuthResponse('User created successfully', user, token));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json(responseService.formatErrorResponse(error.message, 400));
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate login data
    const validation = validationService.validateLogin({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    const user = await userModel.authenticate(email, password);

    // Generate JWT token
    const token = jwtService.generateToken(user);

    res.json(responseService.formatAuthResponse('Login successful', user, token));
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json(responseService.formatErrorResponse(error.message, 401));
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json(responseService.formatErrorResponse('User not found', 404));
    }
    res.json(responseService.formatProfileResponse(user));
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to get user profile'));
  }
});

module.exports = router;
