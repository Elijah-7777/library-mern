import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMsg(null);
    const e = {};
    if (!name.trim()) e.name = 'Name cannot be empty';
    if (password && password.length < 6) e.password = 'Use at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim(), password });
      setUser(data.user);
      setPassword('');
      setMsg({ type: 'success', text: 'Profile saved.' });
    } catch (err) { setMsg({ type: 'danger', text: errMsg(err) }); }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <h1 className="mb-3">Profile</h1>
        <form className="panel p-4" onSubmit={handleSubmit} noValidate>
          {msg && <div className={`alert alert-${msg.type} py-2`} role="alert">{msg.text}</div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="pemail">Email</label>
            <input id="pemail" className="form-control" value={user.email} disabled />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="prole">Account type</label>
            <input id="prole" className="form-control" value={user.role === 'admin' ? 'Librarian' : 'Member'} disabled />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="pname">Name</label>
            <input id="pname" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={name} onChange={(e) => setName(e.target.value)} />
            <div className="invalid-feedback">{errors.name}</div>
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="ppass">New password</label>
            <input id="ppass" type="password" placeholder="Leave blank to keep your current password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <div className="invalid-feedback">{errors.password}</div>
          </div>
          <button className="btn btn-primary">Save changes</button>
        </form>
      </div>
    </div>
  );
}
