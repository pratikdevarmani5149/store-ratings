import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import client from '../api/client';
import { SearchIcon, PlusIcon } from '../components/icons';
import { RatingDisplay } from '../components/RatingStars';
import { validateName, validateEmail, validateAddress, validatePassword, runValidators } from '../utils/validators';

const ROLE_LABEL = { admin: 'Administrator', user: 'Normal user', store_owner: 'Store owner' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await client.get('/admin/users', { params });
      setUsers(data.users);
      setError('');
    } catch (err) {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function openDetail(row) {
    try {
      const { data } = await client.get(`/admin/users/${row.id}`);
      setDetailUser(data.user);
    } catch {
      setError('Could not load user details.');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <span className={`role-badge ${row.role}`}>{ROLE_LABEL[row.role]}</span>,
    },
  ];

  const rowsWithClick = users.map((u) => ({ ...u }));

  return (
    <AppLayout title="Users">
      {error && <div className="banner banner-error">{error}</div>}

      <div className="table-toolbar">
        <div className="search-row">
          <FilterInput icon placeholder="Name" value={filters.name} onChange={(v) => setFilters((f) => ({ ...f, name: v }))} />
          <FilterInput placeholder="Email" value={filters.email} onChange={(v) => setFilters((f) => ({ ...f, email: v }))} />
          <FilterInput placeholder="Address" value={filters.address} onChange={(v) => setFilters((f) => ({ ...f, address: v }))} />
          <div className="search-input">
            <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
              <option value="">All roles</option>
              <option value="admin">Administrator</option>
              <option value="user">Normal user</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <PlusIcon /> Add user
        </button>
      </div>

      <div onClick={(e) => {
        const tr = e.target.closest('tbody tr');
        if (!tr) return;
        const index = [...tr.parentElement.children].indexOf(tr);
        if (rowsWithClick[index]) openDetail(rowsWithClick[index]);
      }}
        style={{ cursor: loading ? 'default' : 'pointer' }}
      >
        <DataTable columns={columns} rows={rowsWithClick} emptyLabel={loading ? 'Loading users...' : 'No users match your filters.'} />
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            fetchUsers();
          }}
        />
      )}

      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
    </AppLayout>
  );
}

function FilterInput({ placeholder, value, onChange }) {
  return (
    <div className="search-input">
      <SearchIcon />
      <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function UserDetailModal({ user, onClose }) {
  return (
    <Modal title="User details" onClose={onClose}>
      <DetailRow label="Name" value={user.name} />
      <DetailRow label="Email" value={user.email} />
      <DetailRow label="Address" value={user.address} />
      <DetailRow label="Role" value={ROLE_LABEL[user.role] || user.role} />
      {user.role === 'store_owner' && (
        <DetailRow
          label="Store rating"
          value={
            user.averageRating != null ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RatingDisplay value={user.averageRating} /> {user.averageRating}
              </span>
            ) : (
              'No ratings yet'
            )
          }
        />
      )}
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [values, setValues] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      await client.post('/admin/users', values);
      onCreated();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not create the user.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add user" onClose={onClose}>
      {serverError && <div className="banner banner-error">{serverError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Full name" error={errors.name} hint="1-60 characters">
          <input value={values.name} onChange={(e) => set('name', e.target.value)} />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
        </FormField>
        <FormField label="Address" error={errors.address}>
          <textarea rows={2} value={values.address} onChange={(e) => set('address', e.target.value)} />
        </FormField>
        <FormField label="Password" error={errors.password} hint="8-16 characters, one uppercase letter, one special character">
          <input type="password" value={values.password} onChange={(e) => set('password', e.target.value)} />
        </FormField>
        <FormField label="Role">
          <select value={values.role} onChange={(e) => set('role', e.target.value)}>
            <option value="user">Normal user</option>
            <option value="admin">Administrator</option>
            <option value="store_owner">Store owner</option>
          </select>
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 4 }}>
          {submitting ? 'Creating...' : 'Create user'}
        </button>
      </form>
    </Modal>
  );
}
