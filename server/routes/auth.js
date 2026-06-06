const express   = require('express');
const jwt       = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User      = require('../models/User');
const auth      = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

// POST /api/auth/register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/profile
router.get('/profile', auth, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// PUT /api/auth/profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
], async (req, res) => {
  try {
    const { name } = req.body;
    if (name) req.user.name = name;
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
