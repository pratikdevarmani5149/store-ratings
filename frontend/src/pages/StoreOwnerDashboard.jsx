import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import client from '../api/client';
import { RatingDisplay } from '../components/RatingStars';
import { TrashIcon, PlusIcon, ImageIcon } from '../components/icons';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await client.get('/store-owner/dashboard');
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your dashboard.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'rating',
      label: 'Rating',
      accessor: (row) => row.rating,
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RatingDisplay value={row.rating} /> {row.rating}
        </span>
      ),
    },
  ];

  return (
    <AppLayout title="Dashboard">
      {error && <div className="banner banner-error">{error}</div>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="card stat-card">
              <div className="label">Store</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{data.store.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>{data.store.address}</div>
            </div>
            <div className="card stat-card">
              <div className="label">Average rating</div>
              <div className="value" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {data.averageRating.toFixed(1)}
                <RatingDisplay value={data.averageRating} size={18} />
              </div>
            </div>
            <div className="card stat-card">
              <div className="label">Ratings received</div>
              <div className="value">{data.ratingCount}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 28 }}>
            <DescriptionCard store={data.store} onSaved={load} />
            <ImagesCard images={data.images} onChanged={load} />
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Ratings received</h3>
          <DataTable
            columns={columns}
            rows={data.raters.map((r) => ({ id: r.user_id, ...r }))}
            emptyLabel="No one has rated your store yet."
          />
        </>
      )}
    </AppLayout>
  );
}

function DescriptionCard({ store, onSaved }) {
  const [value, setValue] = useState(store.description || '');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (value.length > 1000) {
      setStatus({ type: 'error', message: 'Description must be at most 1000 characters.' });
      return;
    }
    setSubmitting(true);
    try {
      await client.put('/store-owner/store/description', { description: value });
      setStatus({ type: 'success', message: 'Description saved.' });
      onSaved?.();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Could not save description.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Store description</h3>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
        Shown to visitors browsing your store listing.
      </p>
      {status && <div className={`banner banner-${status.type}`}>{status.message}</div>}
      <form onSubmit={handleSubmit}>
        <FormField label="" hint={`${value.length}/1000 characters`}>
          <textarea
            rows={5}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tell customers what makes your store worth visiting..."
          />
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save description'}
        </button>
      </form>
    </div>
  );
}

function ImagesCard({ images, onChanged }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      await client.post('/store-owner/store/images', { imageUrl: url.trim() });
      setUrl('');
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add that image.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await client.delete(`/store-owner/store/images/${id}`);
      onChanged?.();
    } catch {
      setError('Could not remove that image.');
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Store photos</h3>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
        Add photo links so visitors can see your store, like a listing on a map app.
      </p>
      {error && <div className="banner banner-error">{error}</div>}

      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img src={img.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                className="icon-btn"
                onClick={() => handleDelete(img.id)}
                aria-label="Remove photo"
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.9)' }}
              >
                <TrashIcon width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted)', marginBottom: 16 }}>
          <ImageIcon /> No photos added yet.
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="https://example.com/photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13 }}
        />
        <button className="btn btn-ghost btn-sm" type="submit" disabled={submitting}>
          <PlusIcon width={14} height={14} /> Add
        </button>
      </form>
    </div>
  );
}
