import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

const Stat = ({ label, value, alert }) => (
  <div className="col-6 col-lg-3">
    <div className={`stat ${alert ? 'alert-stat' : ''}`}>
      <div className="num">{value}</div>
      <div className="meta">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <h1 className="mb-1">Hello, {user.name.split(' ')[0]}</h1>
      <p className="meta mb-4">{isAdmin ? 'Library overview' : 'Your reading at a glance'}</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {!stats && !error && <p>Loading...</p>}
      {stats && isAdmin && (
        <div className="row g-3">
          <Stat label="Book titles" value={stats.titles} />
          <Stat label="Members" value={stats.members} />
          <Stat label="Active loans" value={stats.activeLoans} />
          <Stat label="Overdue" value={stats.overdue} alert={stats.overdue > 0} />
          <Stat label="Copies on shelf" value={`${stats.availableCopies} / ${stats.totalCopies}`} />
        </div>
      )}
      {stats && !isAdmin && (
        <div className="row g-3">
          <Stat label="Books on loan" value={stats.activeLoans} />
          <Stat label="Overdue" value={stats.overdue} alert={stats.overdue > 0} />
          <Stat label="Returned" value={stats.returned} />
        </div>
      )}
      <div className="mt-4 d-flex gap-2 flex-wrap">
        <Link to="/books" className="btn btn-primary">Browse catalog</Link>
        <Link to="/my-loans" className="btn btn-outline-primary">View my loans</Link>
        {isAdmin && <Link to="/books/new" className="btn btn-outline-primary">Add a book</Link>}
      </div>
    </>
  );
}
