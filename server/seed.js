// Run: npm run seed  -> creates a librarian, a demo member, and sample books
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');
const Borrow = require('./models/Borrow');

const books = [
  ['Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 2008],
  ['The Pragmatic Programmer', 'Andrew Hunt, David Thomas', '9780135957059', 'Programming', 2019],
  ['Introduction to Algorithms', 'Thomas H. Cormen', '9780262046305', 'Computer Science', 2022],
  ['Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'Computer Science', 2019],
  ['Eloquent JavaScript', 'Marijn Haverbeke', '9781593279509', 'Programming', 2018],
  ["You Don't Know JS Yet", 'Kyle Simpson', '9781091210099', 'Programming', 2020],
  ['Noli Me Tangere', 'Jose Rizal', '9780143107095', 'Literature', 1887],
  ['El Filibusterismo', 'Jose Rizal', '9780824818760', 'Literature', 1891],
  ['Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 2015],
  ['A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 1998],
  ['The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fiction', 1937],
  ['1984', 'George Orwell', '9780451524935', 'Fiction', 1949],
  ['Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 2018],
  ['Operating System Concepts', 'Abraham Silberschatz', '9781119800361', 'Computer Science', 2021],
].map(([title, author, isbn, category, year], i) => ({
  title, author, isbn, category, year,
  description: `${title} by ${author}.`,
  totalCopies: 2 + (i % 3), availableCopies: 2 + (i % 3),
}));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Book.deleteMany({}), Borrow.deleteMany({})]);
  await User.create({ name: 'Head Librarian', email: 'librarian@library.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Demo Member', email: 'member@library.com', password: 'member123', role: 'member' });
  await Book.insertMany(books);
  console.log('Seeded. Librarian: librarian@library.com / admin123  |  Member: member@library.com / member123');
  process.exit(0);
})();
