import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected routes: redirects to login if signed out; adminOnly also checks the role
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-5 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
