import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import { validateName, validateEmail, validateAddress, validatePassword, runValidators } from '../utils/validators';

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const fieldErrors = runValidators(values, {
      name: validateName,
      email: validateEmail,
      address: validateAddress,
      password: validatePassword,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    try {
      const user = await signup(values);
      navigate(user.role === 'user' ? '/stores' : '/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to create your account. Please try again.');
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
        <h2>Create your account</h2>
        <span className="subtitle">Sign up to browse stores and share your ratings.</span>

        {serverError && <div className="banner banner-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Full name" error={errors.name} hint="1-60 characters">
            <input value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
          </FormField>
          <FormField label="Address" error={errors.address} hint="Up to 400 characters">
            <textarea rows={2} value={values.address} onChange={(e) => set('address', e.target.value)} placeholder="Your address" />
          </FormField>
          <FormField label="Password" error={errors.password} hint="8-16 characters, one uppercase letter, one special character">
            <input type="password" value={values.password} onChange={(e) => set('password', e.target.value)} placeholder="Choose a password" />
          </FormField>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
