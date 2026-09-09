import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import client from '../api/client';
import { SearchIcon, EmptyIcon } from '../components/icons';
import { RatingDisplay, RatingInput } from '../components/RatingStars';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  async function fetchStores() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await client.get('/user/stores', { params });
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

  async function submitRating(storeId, rating) {
    setSavingId(storeId);
    try {
      await client.post('/user/ratings', { storeId, rating });
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, user_rating: rating } : s))
      );
    } catch {
      setError('Could not save your rating. Please try again.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AppLayout title="Stores">
      {error && <div className="banner banner-error">{error}</div>}

      <div className="table-toolbar">
        <div className="search-row">
          <div className="search-input">
            <SearchIcon />
            <input placeholder="Search by name" value={filters.name} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="search-input">
            <SearchIcon />
            <input placeholder="Search by address" value={filters.address} onChange={(e) => setFilters((f) => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
      </div>

      {!loading && stores.length === 0 ? (
        <div className="card empty-state">
          <EmptyIcon />
          <p>No stores match your search.</p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <div className="card store-card" key={store.id}>
              {store.images?.length > 0 && (
                <div className="store-photo-strip">
                  {store.images.slice(0, 3).map((src, i) => (
                    <img key={i} src={src} alt={`${store.name} photo ${i + 1}`} loading="lazy" />
                  ))}
                </div>
              )}
              <div>
                <h3>{store.name}</h3>
                <p className="address">{store.address}</p>
                {store.description && <p className="store-description">{store.description}</p>}
              </div>
              <div className="rating-row">
                <span>
                  Overall: <RatingDisplay value={store.overall_rating} /> {Number(store.overall_rating).toFixed(1)}
                </span>
              </div>
              <div className="rating-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span>{store.user_rating ? 'Your rating' : 'Rate this store'}</span>
                <RatingInput
                  value={store.user_rating || 0}
                  disabled={savingId === store.id}
                  onChange={(n) => submitRating(store.id, n)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
