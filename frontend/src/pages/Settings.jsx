import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import FormField from '../components/FormField';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validateName, validateAddress, validatePassword, runValidators } from '../utils/validators';

export default function Settings() {
  const { user, updateUser } = useAuth();

  return (
    <AppLayout title="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460 }}>
        <ProfileSection user={user} onSaved={updateUser} />
        <PasswordSection />
      </div>
    </AppLayout>
  );
}

function ProfileSection({ user, onSaved }) {
  const [values, setValues] = useState({ name: user.name, address: user.address || '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    const fieldErrors = runValidators(values, { name: validateName, address: validateAddress });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setSubmitting(true);
    try {
      const { data } = await client.put('/auth/profile', values);
      onSaved?.(data.user);
      setStatus({ type: 'success', message: 'Profile updated.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Could not update profile.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Profile</h3>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 18 }}>Your name and address as shown to the platform.</p>

      {status && <div className={`banner banner-${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Full name" error={errors.name} hint="1-60 characters">
          <input value={values.name} onChange={(e) => set('name', e.target.value)} />
        </FormField>
        <FormField label="Email">
          <input value={user.email} disabled style={{ background: '#f2f4f2', color: 'var(--color-muted)' }} />
        </FormField>
        <FormField label="Address" error={errors.address}>
          <textarea rows={2} value={values.address} onChange={(e) => set('address', e.target.value)} />
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    const fieldErrors = runValidators(values, {
      currentPassword: (v) => (v ? null : 'Current password is required.'),
      newPassword: validatePassword,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setSubmitting(true);
    try {
      await client.put('/auth/password', values);
      setStatus({ type: 'success', message: 'Your password has been updated.' });
      setValues({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Could not update password.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Password</h3>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 18 }}>Change the password used to log in.</p>

      {status && <div className={`banner banner-${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Current password" error={errors.currentPassword}>
          <input type="password" value={values.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} />
        </FormField>
        <FormField label="New password" error={errors.newPassword} hint="8-16 characters, one uppercase letter, one special character">
          <input type="password" value={values.newPassword} onChange={(e) => set('newPassword', e.target.value)} />
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
