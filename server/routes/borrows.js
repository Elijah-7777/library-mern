const express = require('express');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
const LOAN_DAYS = 14;
const MAX_ACTIVE_LOANS = 5;

// GET /api/borrows/mine   (defined before /:id style routes)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const loans = await Borrow.find({ user: req.user._id }).populate('book', 'title author').sort({ borrowedAt: -1 });
    res.json(loans);
  } catch (err) { next(err); }
});

// GET /api/borrows   (librarian: all loans, paginated)
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;
    const filter = req.query.status ? { status: String(req.query.status) } : {};
    const [loans, total] = await Promise.all([
      Borrow.find(filter).populate('book', 'title author').populate('user', 'name email')
        .sort({ borrowedAt: -1 }).skip((page - 1) * limit).limit(limit),
      Borrow.countDocuments(filter),
    ]);
    res.json({ loans, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) { next(err); }
});

// POST /api/borrows/:bookId   (member borrows a book)
router.post('/:bookId', protect, async (req, res, next) => {
  try {
    const active = await Borrow.find({ user: req.user._id, status: 'borrowed' });
    if (active.length >= MAX_ACTIVE_LOANS) {
      return res.status(400).json({ message: `Loan limit reached (${MAX_ACTIVE_LOANS} books)` });
    }
    if (active.some((b) => String(b.book) === req.params.bookId)) {
      return res.status(400).json({ message: 'You already borrowed this book' });
    }
    // Atomic decrement prevents two people taking the last copy
    const book = await Book.findOneAndUpdate(
      { _id: req.params.bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    if (!book) return res.status(400).json({ message: 'No copies available' });

    const dueDate = new Date(Date.now() + LOAN_DAYS * 24 * 60 * 60 * 1000);
    const borrow = await Borrow.create({ user: req.user._id, book: book._id, dueDate });
    res.status(201).json(await borrow.populate('book', 'title author'));
  } catch (err) { next(err); }
});

// PUT /api/borrows/:id/return   (owner or librarian)
router.put('/:id/return', protect, async (req, res, next) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Loan record not found' });
    if (String(borrow.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to return this loan' });
    }
    if (borrow.status === 'returned') return res.status(400).json({ message: 'Already returned' });
    borrow.status = 'returned';
    borrow.returnedAt = new Date();
    await borrow.save();
    await Book.findByIdAndUpdate(borrow.book, { $inc: { availableCopies: 1 } });
    res.json(borrow);
  } catch (err) { next(err); }
});

module.exports = router;
