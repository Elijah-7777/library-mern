import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookForm from './pages/BookForm';
import MyLoans from './pages/MyLoans';
import AllLoans from './pages/AllLoans';
import Profile from './pages/Profile';

// Wraps signed-in pages with the navigation bar and page container
const Shell = ({ children, adminOnly }) => (
  <ProtectedRoute adminOnly={adminOnly}>
    <NavBar />
    <main className="container py-4">{children}</main>
  </ProtectedRoute>
);

export default function App() {
  useLocation();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Shell><Dashboard /></Shell>} />
      <Route path="/books" element={<Shell><Books /></Shell>} />
      <Route path="/books/new" element={<Shell adminOnly><BookForm /></Shell>} />
      <Route path="/books/:id/edit" element={<Shell adminOnly><BookForm /></Shell>} />
      <Route path="/my-loans" element={<Shell><MyLoans /></Shell>} />
      <Route path="/loans" element={<Shell adminOnly><AllLoans /></Shell>} />
      <Route path="/profile" element={<Shell><Profile /></Shell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
