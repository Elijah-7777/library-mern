const express = require('express');
const { body } = require('express-validator');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const { protect, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/error');

const router = express.Router();

const bookRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('totalCopies').isInt({ min: 1 }).withMessage('Copies must be at least 1'),
  body('year').optional({ checkFalsy: true }).isInt({ min: 0, max: 3000 }).withMessage('Enter a valid year'),
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/books?search=&category=&page=&limit=   (search + pagination)
router.get('/', protect, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 50);
    const filter = {};
    if (req.query.search) {
      const rx = new RegExp(escapeRegex(String(req.query.search)), 'i');
      filter.$or = [{ title: rx }, { author: rx }, { isbn: rx }];
    }
    if (req.query.category && req.query.category !== 'All') filter.category = String(req.query.category);

    const [books, total, categories] = await Promise.all([
      Book.find(filter).sort({ title: 1 }).skip((page - 1) * limit).limit(limit),
      Book.countDocuments(filter),
      Book.distinct('category'),
    ]);
    res.json({ books, total, page, pages: Math.ceil(total / limit) || 1, categories: categories.sort() });
  } catch (err) { next(err); }
});

// GET /api/books/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
});

// POST /api/books  (librarian)
router.post('/', protect, adminOnly, bookRules, validate, async (req, res, next) => {
  try {
    const { title, author, isbn, category, year, description, totalCopies } = req.body;
    const book = await Book.create({
      title, author, isbn, category: category || 'General', year: year || undefined,
      description, totalCopies, availableCopies: totalCopies,
    });
    res.status(201).json(book);
  } catch (err) { next(err); }
});

// PUT /api/books/:id  (librarian)
router.put('/:id', protect, adminOnly, bookRules, validate, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const { title, author, isbn, category, year, description, totalCopies } = req.body;
    const onLoan = book.totalCopies - book.availableCopies;
    if (Number(totalCopies) < onLoan) {
      return res.status(400).json({ message: `Cannot set copies below the ${onLoan} currently on loan` });
    }
    Object.assign(book, { title, author, isbn, category: category || 'General', year: year || undefined, description });
    book.totalCopies = Number(totalCopies);
    book.availableCopies = book.totalCopies - onLoan;
    await book.save();
    res.json(book);
  } catch (err) { next(err); }
});

// DELETE /api/books/:id  (librarian)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const active = await Borrow.countDocuments({ book: req.params.id, status: 'borrowed' });
    if (active > 0) return res.status(400).json({ message: 'Cannot delete a book that is currently borrowed' });
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
