import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import client from '../api/client';
import { SearchIcon, PlusIcon } from '../components/icons';
import { RatingDisplay } from '../components/RatingStars';
import { validateEmail, validateAddress, runValidators } from '../utils/validators';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  async function fetchStores() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await client.get('/admin/stores', { params });
      setStores(data.stores);
      setError('');
    } catch {
      setError('Could not load stores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchStores, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'rating',
      label: 'Rating',
      accessor: (row) => Number(row.rating),
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RatingDisplay value={row.rating} />
          <span className="mono" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            {Number(row.rating).toFixed(1)} ({row.rating_count})
          </span>
        </span>
      ),
    },
  ];

  return (
    <AppLayout title="Stores">
      {error && <div className="banner banner-error">{error}</div>}

      <div className="table-toolbar">
        <div className="search-row">
          <FilterInput placeholder="Name" value={filters.name} onChange={(v) => setFilters((f) => ({ ...f, name: v }))} />
          <FilterInput placeholder="Email" value={filters.email} onChange={(v) => setFilters((f) => ({ ...f, email: v }))} />
          <FilterInput placeholder="Address" value={filters.address} onChange={(v) => setFilters((f) => ({ ...f, address: v }))} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <PlusIcon /> Add store
        </button>
      </div>

      <DataTable columns={columns} rows={stores} emptyLabel={loading ? 'Loading stores...' : 'No stores match your filters.'} />

      {showAdd && (
        <AddStoreModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            fetchStores();
          }}
        />
      )}
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

function AddStoreModal({ onClose, onCreated }) {
  const [values, setValues] = useState({ name: '', email: '', address: '', description: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    client
      .get('/admin/store-owners/unassigned')
      .then(({ data }) => setOwners(data.owners))
      .catch(() => {});
  }, []);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const fieldErrors = runValidators(values, {
      name: (v) => (v && v.length <= 60 && v.trim() ? null : 'Store name must be 1-60 characters.'),
      email: validateEmail,
      address: validateAddress,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setSubmitting(true);
    try {
      await client.post('/admin/stores', { ...values, ownerId: values.ownerId || null });
      onCreated();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not create the store.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add store" onClose={onClose}>
      {serverError && <div className="banner banner-error">{serverError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Store name" error={errors.name} hint="Up to 60 characters">
          <input value={values.name} onChange={(e) => set('name', e.target.value)} />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
        </FormField>
        <FormField label="Address" error={errors.address}>
          <textarea rows={2} value={values.address} onChange={(e) => set('address', e.target.value)} />
        </FormField>
        <FormField label="Description" hint="Optional — the store owner can also add or edit this later">
          <textarea rows={2} value={values.description} onChange={(e) => set('description', e.target.value)} />
        </FormField>
        <FormField label="Store owner" hint="Optional — only unassigned store-owner accounts are listed">
          <select value={values.ownerId} onChange={(e) => set('ownerId', e.target.value)}>
            <option value="">No owner yet</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 4 }}>
          {submitting ? 'Creating...' : 'Create store'}
        </button>
      </form>
    </Modal>
  );
}
