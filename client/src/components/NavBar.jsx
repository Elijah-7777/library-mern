import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar navbar-expand-md topbar">
      <div className="container">
        <NavLink to="/" className="navbar-brand brand">Stacks</NavLink>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink end to="/" className="nav-link">Dashboard</NavLink></li>
            <li className="nav-item"><NavLink to="/books" className="nav-link">Catalog</NavLink></li>
            <li className="nav-item"><NavLink to="/my-loans" className="nav-link">My loans</NavLink></li>
            {isAdmin && <li className="nav-item"><NavLink to="/loans" className="nav-link">All loans</NavLink></li>}
            {isAdmin && <li className="nav-item"><NavLink to="/books/new" className="nav-link">Add book</NavLink></li>}
          </ul>
          <ul className="navbar-nav align-items-md-center">
            <li className="nav-item"><NavLink to="/profile" className="nav-link">{user?.name}</NavLink></li>
            <li className="nav-item ms-md-2">
              <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>Log out</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
