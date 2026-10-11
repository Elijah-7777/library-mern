# Stacks - Library Management System (MERN)

Full-stack library system: members search the catalog and borrow/return books; librarians manage books and see every loan.

## Stack
React 18 + Vite, React Router, Hooks, Axios, Bootstrap 5 | Node.js + Express | MongoDB + Mongoose | JWT auth (bcrypt password hashing)

## Run locally
Requirements: Node 18+, MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1) API
cd server
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed      # creates sample books + demo accounts
npm run dev       # http://localhost:5000

# 2) Web app (new terminal)
cd client
npm install
npm run dev       # http://localhost:5173
```

Demo accounts (after `npm run seed`):
- Librarian: librarian@library.com / admin123
- Member:    member@library.com / member123

## Features (mapped to the project requirements)
- User management: register, login, logout, bcrypt password encryption, JWT, profile update
- Dashboard: role-based stats (librarian: library-wide, member: own loans) + profile page
- CRUD: books (librarian create/read/update/delete), loans (borrow, return, list)
- React: components, Router, useState/useEffect/useContext, controlled forms with validation
- API: REST with Express + Axios (interceptor attaches JWT, auto-logout on 401)
- Security: protected routes (client and server), auth + role middleware, express-validator input validation, helmet, CORS, rate limiting on /api/auth, regex-escaped search
- UI: responsive Bootstrap layout, navigation menu, search + category filter, pagination (catalog and all-loans)

## API summary
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | user |
| PUT | /api/auth/profile | user |
| GET | /api/books?search=&category=&page= | user |
| GET | /api/books/:id | user |
| POST/PUT/DELETE | /api/books, /api/books/:id | librarian |
| POST | /api/borrows/:bookId | user |
| PUT | /api/borrows/:id/return | owner or librarian |
| GET | /api/borrows/mine | user |
| GET | /api/borrows | librarian |
| GET | /api/stats | user |

## Business rules
14-day loans, max 5 active loans per member, no duplicate active loan of the same book, a book with active loans cannot be deleted.
