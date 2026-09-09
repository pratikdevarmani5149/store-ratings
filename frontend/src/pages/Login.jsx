import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';

const HOME_BY_ROLE = { admin: '/admin/dashboard', user: '/stores', store_owner: '/owner/dashboard' };

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(values.email, values.password);
      navigate(HOME_BY_ROLE[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <svg width="22" height="22" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#2F6F5E" />
            <path d="M16 7l2.6 5.7 6.2.6-4.7 4.2 1.4 6.1L16 20.8l-5.5 2.8 1.4-6.1-4.7-4.2 6.2-.6L16 7z" fill="#F6F7F5" />
          </svg>
          <span>StoreRatings</span>
        </div>
        <h2>Log in to your account</h2>
        <span className="subtitle">Rate stores, manage listings, or track your store's reputation.</span>

        {error && <div className="banner banner-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <FormField label="Email">
            <input
              type="email"
              required
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </FormField>
          <FormField label="Password">
            <input
              type="password"
              required
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              placeholder="Your password"
            />
          </FormField>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
