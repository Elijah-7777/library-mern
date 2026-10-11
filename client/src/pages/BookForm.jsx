import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';

const empty = { title: '', author: '', isbn: '', category: '', year: '', description: '', totalCopies: 1 };

// Used for both "Add book" (/books/new) and "Edit book" (/books/:id/edit)
export default function BookForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/books/${id}`)
      .then(({ data }) => setForm({ ...empty, ...data, year: data.year || '' }))
      .catch((e) => setServerError(errMsg(e)));
  }, [id, editing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Enter the book title';
    if (!form.author.trim()) e.author = 'Enter the author';
    if (!form.isbn.trim()) e.isbn = 'Enter the ISBN';
    if (!Number.isInteger(Number(form.totalCopies)) || Number(form.totalCopies) < 1) e.totalCopies = 'Copies must be a whole number, 1 or more';
    if (form.year && (Number(form.year) < 0 || Number(form.year) > new Date().getFullYear())) e.year = 'Enter a valid year';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    const payload = { ...form, totalCopies: Number(form.totalCopies), year: form.year ? Number(form.year) : undefined };
    try {
      if (editing) await api.put(`/books/${id}`, payload);
      else await api.post('/books', payload);
      navigate('/books');
    } catch (err) {
      setServerError(errMsg(err));
    } finally { setBusy(false); }
  };

  const field = (name, label, type = 'text') => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input id={name} name={name} type={type} className={`form-control ${errors[name] ? 'is-invalid' : ''}`} value={form[name] ?? ''} onChange={handleChange} />
      <div className="invalid-feedback">{errors[name]}</div>
    </div>
  );

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <h1 className="mb-3">{editing ? 'Edit book' : 'Add book'}</h1>
        <form className="panel p-4" onSubmit={handleSubmit} noValidate>
          {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}
          {field('title', 'Title')}
          {field('author', 'Author')}
          <div className="row">
            <div className="col-md-6">{field('isbn', 'ISBN')}</div>
            <div className="col-md-6">{field('category', 'Category')}</div>
            <div className="col-md-6">{field('year', 'Year published', 'number')}</div>
            <div className="col-md-6">{field('totalCopies', 'Total copies', 'number')}</div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea id="description" name="description" rows="3" className="form-control" value={form.description ?? ''} onChange={handleChange} />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add book'}</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/books')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
