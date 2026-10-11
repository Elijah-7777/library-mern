const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    year: { type: Number, min: 0, max: 3000 },
    description: { type: String, maxlength: 1000, default: '' },
    totalCopies: { type: Number, required: true, min: 1, default: 1 },
    availableCopies: { type: Number, required: true, min: 0, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
