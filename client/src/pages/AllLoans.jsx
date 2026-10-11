import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Pagination from '../components/Pagination';

const fmt = (d) => new Date(d).toLocaleDateString();

// Librarian view: every loan in the library, with filter + pagination
export default function AllLoans() {
  const [data, setData] = useState({ loans: [], total: 0, pages: 1 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/borrows', { params: { status, page } })
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const markReturned = async (loan) => {
    try { await api.put(`/borrows/${loan._id}/return`); load(); }
    catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <h1 className="mb-0">All loans</h1>
        <div>
          <label htmlFor="status" className="visually-hidden">Filter by status</label>
          <select id="status" className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All loans</option>
            <option value="borrowed">On loan</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="panel table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Book</th><th>Member</th><th>Borrowed</th><th>Due</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {data.loans.length === 0 && <tr><td colSpan="6" className="text-center py-3">No loans found.</td></tr>}
            {data.loans.map((l) => {
              const overdue = l.status === 'borrowed' && new Date(l.dueDate) < new Date();
              return (
                <tr key={l._id}>
                  <td>{l.book?.title || 'Deleted book'}</td>
                  <td>{l.user?.name}<div className="meta">{l.user?.email}</div></td>
                  <td>{fmt(l.borrowedAt)}</td>
                  <td>{fmt(l.dueDate)}</td>
                  <td>{l.status === 'returned' ? <span className="badge text-bg-secondary">Returned</span> : overdue ? <span className="badge text-bg-danger">Overdue</span> : <span className="badge text-bg-success">On loan</span>}</td>
                  <td className="text-end">{l.status === 'borrowed' && <button className="btn btn-sm btn-outline-primary" onClick={() => markReturned(l)}>Mark returned</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </>
  );
}
