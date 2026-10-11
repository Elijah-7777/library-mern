const express = require('express');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats  (members see their own loans, librarians see library-wide numbers)
router.get('/', protect, async (req, res, next) => {
  try {
    const now = new Date();
    if (req.user.role === 'admin') {
      const [titles, members, active, overdue, copies] = await Promise.all([
        Book.countDocuments(),
        User.countDocuments({ role: 'member' }),
        Borrow.countDocuments({ status: 'borrowed' }),
        Borrow.countDocuments({ status: 'borrowed', dueDate: { $lt: now } }),
        Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }]),
      ]);
      return res.json({
        role: 'admin', titles, members, activeLoans: active, overdue,
        totalCopies: copies[0]?.total || 0, availableCopies: copies[0]?.available || 0,
      });
    }
    const [active, overdue, history] = await Promise.all([
      Borrow.countDocuments({ user: req.user._id, status: 'borrowed' }),
      Borrow.countDocuments({ user: req.user._id, status: 'borrowed', dueDate: { $lt: now } }),
      Borrow.countDocuments({ user: req.user._id, status: 'returned' }),
    ]);
    res.json({ role: 'member', activeLoans: active, overdue, returned: history });
  } catch (err) { next(err); }
});

module.exports = router;
