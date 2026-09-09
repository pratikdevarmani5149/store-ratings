import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardIcon, StoreIcon, UsersIcon, LogoutIcon, SettingsIcon } from './icons';

const NAV_BY_ROLE = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/admin/users', label: 'Users', icon: UsersIcon },
    { to: '/admin/stores', label: 'Stores', icon: StoreIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ],
  user: [
    { to: '/stores', label: 'Stores', icon: StoreIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ],
  store_owner: [
    { to: '/owner/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ],
};

const ROLE_LABEL = { admin: 'System Administrator', user: 'Normal User', store_owner: 'Store Owner' };

export default function AppLayout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[user.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#2F6F5E" />
            <path d="M16 7l2.6 5.7 6.2.6-4.7 4.2 1.4 6.1L16 20.8l-5.5 2.8 1.4-6.1-4.7-4.2 6.2-.6L16 7z" fill="#F6F7F5" />
          </svg>
          <span>StoreRatings</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user.name}</strong>
            {ROLE_LABEL[user.role]}
          </div>
          <button className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none' }} onClick={handleLogout}>
            <LogoutIcon />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <h1>{title}</h1>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
