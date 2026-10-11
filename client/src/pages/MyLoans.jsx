import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

const fmt = (d) => new Date(d).toLocaleDateString();

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/borrows/mine').then((r) => setLoans(r.data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const giveBack = async (loan) => {
    try { await api.put(`/borrows/${loan._id}/return`); load(); }
    catch (err) { setError(errMsg(err)); }
  };

  const statusOf = (l) => {
    if (l.status === 'returned') return <span className="badge text-bg-secondary">Returned {fmt(l.returnedAt)}</span>;
    return new Date(l.dueDate) < new Date()
      ? <span className="badge text-bg-danger">Overdue since {fmt(l.dueDate)}</span>
      : <span className="badge text-bg-success">Due {fmt(l.dueDate)}</span>;
  };

  return (
    <>
      <h1 className="mb-3">My loans</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="panel">
        {loading && <p className="p-3 mb-0">Loading...</p>}
        {!loading && loans.length === 0 && <p className="p-3 mb-0">You have not borrowed anything yet. Head to the catalog to pick a book.</p>}
        {loans.map((l) => (
          <div className="book-row" key={l._id}>
            <div>
              <h3 className="book-title">{l.book?.title || 'Deleted book'}</h3>
              <div className="meta mb-1">{l.book?.author} &middot; Borrowed {fmt(l.borrowedAt)}</div>
              {statusOf(l)}
            </div>
            {l.status === 'borrowed' && <button className="btn btn-sm btn-primary" onClick={() => giveBack(l)}>Return</button>}
          </div>
        ))}
      </div>
    </>
  );
}
