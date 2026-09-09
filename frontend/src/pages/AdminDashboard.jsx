import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import client from '../api/client';
import { UsersIcon, StoreIcon, StarIcon } from '../components/icons';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Could not load dashboard statistics.'));
  }, []);

  const cards = [
    {
      key: 'users',
      label: 'Total users',
      value: stats?.totalUsers,
      icon: UsersIcon,
      to: '/admin/users',
    },
    {
      key: 'stores',
      label: 'Total stores',
      value: stats?.totalStores,
      icon: StoreIcon,
      to: '/admin/stores',
    },
    {
      key: 'ratings',
      label: 'Ratings submitted',
      value: stats?.totalRatings,
      icon: StarIcon,
      to: '/admin/stores',
    },
  ];

  return (
    <AppLayout title="Dashboard">
      {error && <div className="banner banner-error">{error}</div>}
      <div className="stat-grid">
        {cards.map(({ key, label, value, icon: Icon, to }) => (
          <button
            key={key}
            className="card stat-card stat-card-clickable"
            onClick={() => navigate(to)}
            aria-label={`View ${label.toLowerCase()}`}
          >
            <div className="label">
              <Icon width={14} height={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              {label}
            </div>
            <div className="value">{value ?? '—'}</div>
          </button>
        ))}
      </div>
    </AppLayout>
  );
}
