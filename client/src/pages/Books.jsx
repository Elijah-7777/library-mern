import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

export default function Books() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ books: [], total: 0, pages: 1, categories: [] });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type, text }

  // Debounce the search box so we do not call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books', { params: { search: query, category, page } });
      setData(data);
    } catch (err) {
      setNotice({ type: 'danger', text: errMsg(err) });
    } finally { setLoading(false); }
  }, [query, category, page]);

  useEffect(() => { load(); }, [load]);

  const borrow = async (book) => {
    try {
      const { data: loan } = await api.post(`/borrows/${book._id}`);
      setNotice({ type: 'success', text: `Borrowed "${book.title}". Due ${new Date(loan.dueDate).toLocaleDateString()}.` });
      load();
    } catch (err) { setNotice({ type: 'danger', text: errMsg(err) }); }
  };

  const remove = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/books/${book._id}`);
      setNotice({ type: 'success', text: `Deleted "${book.title}".` });
      load();
    } catch (err) { setNotice({ type: 'danger', text: errMsg(err) }); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <h1 className="mb-0">Catalog</h1>
        {isAdmin && <Link to="/books/new" className="btn btn-primary">Add book</Link>}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <label htmlFor="search" className="visually-hidden">Search books</label>
          <input id="search" className="form-control" placeholder="Search by title, author, or ISBN" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label htmlFor="category" className="visually-hidden">Category</label>
          <select id="category" className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option>All</option>
            {data.categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type} alert-dismissible`} role="alert">
          {notice.text}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setNotice(null)}></button>
        </div>
      )}

      <div className="panel">
        {loading && <p className="p-3 mb-0">Loading...</p>}
        {!loading && data.books.length === 0 && <p className="p-3 mb-0">No books match your search. Try a different title, author, or category.</p>}
        {!loading && data.books.map((b) => (
          <div className="book-row" key={b._id}>
            <div>
              <h3 className="book-title">{b.title}</h3>
              <div className="meta">{b.author}{b.year ? `, ${b.year}` : ''} &middot; {b.category} &middot; ISBN {b.isbn}</div>
              <span className={`avail ${b.availableCopies > 0 ? 'in' : 'out'}`}>
                {b.availableCopies > 0 ? `${b.availableCopies} of ${b.totalCopies} available` : 'All copies on loan'}
              </span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-primary" disabled={b.availableCopies < 1} onClick={() => borrow(b)}>Borrow</button>
              {isAdmin && (
                <>
                  <Link to={`/books/${b._id}/edit`} className="btn btn-sm btn-outline-primary">Edit</Link>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(b)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="meta text-center mt-2">{data.total} {data.total === 1 ? 'book' : 'books'} found</div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </>
  );
}
