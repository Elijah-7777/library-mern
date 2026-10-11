const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/error');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const userPayload = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register  (role is always "member"; librarians are created via seed)
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email })) return res.status(409).json({ message: 'Email is already registered' });
      const user = await User.create({ name, email, password });
      res.status(201).json({ token: signToken(user._id), user: userPayload(user) });
    } catch (err) { next(err); }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(), body('password').notEmpty().withMessage('Password is required')],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user || !(await user.matchPassword(req.body.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.json({ token: signToken(user._id), user: userPayload(user) });
    } catch (err) { next(err); }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: userPayload(req.user) }));

// PUT /api/auth/profile  (update name / password)
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (req.body.name) user.name = req.body.name;
      if (req.body.password) user.password = req.body.password;
      await user.save();
      res.json({ user: userPayload(user) });
    } catch (err) { next(err); }
  }
);

module.exports = router;
